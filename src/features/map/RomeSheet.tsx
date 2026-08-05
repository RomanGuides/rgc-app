// Roman Guides Companion — RomeSheet
// Il foglio persistente della tab Rome (redesign v1, Fase 3/4) — sostituisce
// la barra nera, AroundMeBar (raggio) e CategoryFilterBar (chip categoria).
// Dentro: campo di ricerca (apre SearchScreen), filtro categoria, "Tonight"
// (era Tip of the Day), "Nearest to you"; a detent pieno anche Get Around
// ed Emergency (contenuto ex-Home, redistribuito qui).
//
// Il raggio "Around Me" è stato rimosso di proposito (decisione del redesign):
// l'ordinamento è sempre per distanza a piedi, senza controllo utente.
// I filtri categoria restano, ma dentro il pannello del bottone Filtro
// invece di una riga di chip sempre visibile.
//
// Fisica del trascinamento (spec aggiornata dopo la Fase 3): non più altezze
// fisse con transizione CSS a durata fissa, ma una vera simulazione a molla
// (stiffness 320, damping 34, integrata a mano frame per frame — nessuna
// nuova dipendenza) con proiezione della velocità al rilascio e resistenza
// rubber-band oltre i limiti. Vedi animateToDetent()/onDragMove() sotto.

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlacesStore } from '../../store/usePlacesStore';
import { getAppContentSection } from '../../services/appContentService';
import { distMeters, formatDistance } from '../../utils/distance';
import { buildWaterFountainSearchUrl } from '../../utils/waterFountainSearch';
import { CATEGORY_META } from '../../config/categories.config';
import { SearchIcon, FilterIcon } from '../../design-system/components/Icons';
import type { Place, PlaceCategory } from '../../data/types';

type Detent = 'peek' | 'resting' | 'full';

const DETENT_FRACTIONS: Record<Detent, number> = { peek: 0.16, resting: 0.4, full: 0.9 };
const STIFFNESS = 320;
const DAMPING = 34;
const RUBBER_BAND = 0.35;
const VELOCITY_PROJECTION_S = 0.15;
const TAP_MOVEMENT_THRESHOLD_PX = 8;
const BODY_DRAG_COMMIT_THRESHOLD_PX = 6;

interface RomeSheetProps {
  onOpenSearch: () => void;
}

export function RomeSheet({ onOpenSearch }: RomeSheetProps) {
  const places = usePlacesStore((s) => s.places);
  const activeCategories = usePlacesStore((s) => s.activeCategories);
  const toggleCategory = usePlacesStore((s) => s.toggleCategory);
  const userLocation = usePlacesStore((s) => s.userLocation);
  const selectPlace = usePlacesStore((s) => s.selectPlace);

  const [detent, setDetent] = useState<Detent>('resting');
  const [filterOpen, setFilterOpen] = useState(false);
  const [heightPx, setHeightPx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const rafRef = useRef<number | null>(null);
  // Trascinamento attivo (header o corpo, una volta "agganciato").
  const dragRef = useRef<{ startY: number; startHeight: number; lastY: number; lastT: number; lastDy: number; lastDt: number } | null>(null);
  // Candidato di trascinamento dal corpo — non ancora "agganciato" finché non
  // si conferma che la lista è in cima e il dito si muove verso il basso.
  const bodyCandidateRef = useRef<{ startY: number; scrollTopAtStart: number } | null>(null);

  const getContainerHeight = useCallback(() => containerRef.current?.clientHeight ?? 700, []);
  const getDetentPx = useCallback((d: Detent) => getContainerHeight() * DETENT_FRACTIONS[d], [getContainerHeight]);

  // Misura iniziale e ricalcolo su resize/rotazione (le altezze sono frazioni
  // del viewport, non valori fissi).
  useEffect(() => {
    function measure() {
      setHeightPx((prev) => {
        if (dragRef.current) return prev; // non interferire con un drag in corso
        return getDetentPx(detent);
      });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detent]);

  function stopAnimation() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  // Vera simulazione a molla (non una transizione CSS a durata fissa):
  // integra l'equazione del moto frame per frame finché non si assesta,
  // così un rilascio più veloce raggiunge il detent più rapidamente invece
  // di seguire sempre la stessa curva temporale.
  function animateToDetent(target: Detent, initialVelocity: number) {
    setDetent(target);
    stopAnimation();
    const targetPx = getDetentPx(target);
    let velocity = initialVelocity; // px/s
    let last = performance.now();

    function step(now: number) {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      setHeightPx((prev) => {
        const cur = prev ?? targetPx;
        const displacement = cur - targetPx;
        const accel = -STIFFNESS * displacement - DAMPING * velocity;
        velocity += accel * dt;
        const next = cur + velocity * dt;
        if (Math.abs(next - targetPx) < 0.5 && Math.abs(velocity) < 2) {
          rafRef.current = null;
          return targetPx;
        }
        rafRef.current = requestAnimationFrame(step);
        return next;
      });
    }
    rafRef.current = requestAnimationFrame(step);
  }

  function nearestDetentTo(px: number): Detent {
    const entries = (Object.keys(DETENT_FRACTIONS) as Detent[]).map((d): [Detent, number] => [d, Math.abs(px - getDetentPx(d))]);
    entries.sort((a, b) => a[1] - b[1]);
    return entries[0][0];
  }

  function clampWithRubberBand(raw: number): number {
    const min = getDetentPx('peek');
    const max = getDetentPx('full');
    if (raw > max) return max + (raw - max) * RUBBER_BAND;
    if (raw < min) return min + (raw - min) * RUBBER_BAND;
    return raw;
  }

  function beginDrag(clientY: number) {
    stopAnimation();
    dragRef.current = {
      startY: clientY,
      startHeight: heightPx ?? getDetentPx(detent),
      lastY: clientY,
      lastT: performance.now(),
      lastDy: 0,
      lastDt: 1,
    };
  }

  function updateDrag(clientY: number) {
    const d = dragRef.current;
    if (!d) return;
    const now = performance.now();
    d.lastDy = clientY - d.lastY;
    d.lastDt = Math.max(1, now - d.lastT);
    d.lastY = clientY;
    d.lastT = now;

    const rawDelta = d.startY - clientY; // trascinare in su = più alto
    setHeightPx(clampWithRubberBand(d.startHeight + rawDelta));
  }

  function endDrag() {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;

    const totalMovement = Math.abs(d.startY - d.lastY);
    if (totalMovement < TAP_MOVEMENT_THRESHOLD_PX) {
      // Tocco, non trascinamento — alterna resting ↔ full (mai peek dal tocco).
      const next = detent === 'full' ? 'resting' : 'full';
      animateToDetent(next, 0);
      return;
    }

    // Velocità istantanea dall'ultimo tratto di movimento, proiettata in avanti:
    // un flick veloce deve poter cambiare detent anche con pochi px percorsi.
    const rawVelocityYPerS = (d.lastDy / d.lastDt) * 1000; // px/s, negativo = su
    const heightVelocity = -rawVelocityYPerS;
    const current = heightPx ?? getDetentPx(detent);
    const projected = current + heightVelocity * VELOCITY_PROJECTION_S;
    animateToDetent(nearestDetentTo(projected), heightVelocity);
  }

  function onHeaderPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    beginDrag(e.clientY);
  }
  function onHeaderPointerMove(e: React.PointerEvent) {
    updateDrag(e.clientY);
  }
  function onHeaderPointerUp() {
    endDrag();
  }

  // Sul corpo (lista interna): la lista scrolla normalmente, TRANNE quando è
  // già in cima e il dito trascina verso il basso — in quel caso il gesto
  // controlla il foglio, non il contenuto (altrimenti si "urterebbe" contro
  // l'inizio della lista senza effetto, che sembra rotto).
  function onBodyPointerDown(e: React.PointerEvent) {
    if (dragRef.current) return;
    bodyCandidateRef.current = { startY: e.clientY, scrollTopAtStart: listRef.current?.scrollTop ?? 0 };
  }
  function onBodyPointerMove(e: React.PointerEvent) {
    if (dragRef.current) {
      updateDrag(e.clientY);
      return;
    }
    const c = bodyCandidateRef.current;
    if (!c) return;
    const draggingDown = e.clientY - c.startY > BODY_DRAG_COMMIT_THRESHOLD_PX;
    if (c.scrollTopAtStart <= 0 && draggingDown) {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      bodyCandidateRef.current = null;
      beginDrag(c.startY);
      updateDrag(e.clientY);
    }
  }
  function onBodyPointerUp() {
    bodyCandidateRef.current = null;
    if (dragRef.current) endDrag();
  }

  function handleSearchTap() {
    animateToDetent('full', 0);
    onOpenSearch();
  }

  const tonight = getAppContentSection('tip_of_the_day');
  const getAround = getAppContentSection('get_around');
  const emergency = getAppContentSection('emergency');

  const visiblePlaces = places.filter((p) => activeCategories.has(p.category));
  const nearest: (Place & { distanceMeters: number })[] = userLocation
    ? visiblePlaces
        .map((p) => ({ ...p, distanceMeters: distMeters(userLocation.lat, userLocation.lng, p.lat, p.lng) }))
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, 2)
    : [];

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: heightPx ?? getDetentPx('resting'),
          background: '#FFFFFF',
          borderRadius: '22px 22px 0 0',
          boxShadow: '0 -14px 44px rgba(26,22,20,.14)',
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom, 0px))',
          overflow: 'hidden',
        }}
      >
        {/* Superficie di trascinamento: l'intero header (maniglia + padding
            attorno al campo di ricerca). I bottoni al suo interno fermano la
            propagazione del pointerdown così restano toccabili normalmente. */}
        <div
          onPointerDown={onHeaderPointerDown}
          onPointerMove={onHeaderPointerMove}
          onPointerUp={onHeaderPointerUp}
          onPointerCancel={onHeaderPointerUp}
          style={{ touchAction: 'none', cursor: 'grab', minHeight: 44, flexShrink: 0 }}
        >
          <div style={{ padding: '10px 0 4px' }}>
            <div style={{ width: 38, height: 5, background: 'rgba(26,22,20,.16)', borderRadius: 3, margin: '0 auto' }} />
          </div>

          <div style={{ display: 'flex', gap: 10, padding: '0 20px', position: 'relative' }}>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleSearchTap}
              style={{
                flex: 1,
                minWidth: 0,
                height: 48,
                borderRadius: 14,
                background: '#F3EFEB',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 14px',
                color: '#8C7F79',
                fontSize: '0.95rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <SearchIcon width={19} height={19} />
              Search Rome
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setFilterOpen((v) => !v)}
              aria-label="Filter by category"
              style={{
                width: 32,
                height: 32,
                alignSelf: 'center',
                borderRadius: '50%',
                background: '#E4DED7',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ink)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <FilterIcon width={16} height={16} />
            </button>

            {filterOpen && (
              <div
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 54,
                  right: 20,
                  zIndex: 6,
                  background: '#FFFFFF',
                  borderRadius: 14,
                  boxShadow: '0 4px 16px rgba(26,22,20,.18)',
                  padding: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  minWidth: 180,
                }}
              >
                {(Object.keys(CATEGORY_META) as PlaceCategory[]).map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const active = activeCategories.has(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: 'none',
                        background: active ? '#F3EFEB' : 'transparent',
                        color: 'var(--ink)',
                        fontSize: '0.85rem',
                        fontWeight: active ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                      }}
                    >
                      <span>{meta.emoji}</span>
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ height: 22 }} />
        </div>

        <div
          ref={listRef}
          onPointerDown={onBodyPointerDown}
          onPointerMove={onBodyPointerMove}
          onPointerUp={onBodyPointerUp}
          onPointerCancel={onBodyPointerUp}
          style={{ padding: '0 20px', overflowY: dragRef.current ? 'hidden' : 'auto', flex: 1 }}
        >
          {tonight && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: '#6E645F', marginBottom: 4 }}>
                Tonight
              </div>
              <div style={{ fontFamily: 'var(--display)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1614', marginBottom: 4 }}>
                {tonight.title}
              </div>
              {tonight.subtitle && <div style={{ fontSize: '0.85rem', color: '#6E645F' }}>{tonight.subtitle}</div>}
            </div>
          )}

          {nearest.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: '#6E645F', marginBottom: 10 }}>
                Nearest to you
              </div>
              {nearest.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectPlace(p)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: '10px 0',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{ fontSize: '1rem', color: '#1A1614' }}>{p.name}</span>
                  <span style={{ fontSize: '0.85rem', color: '#8C7F79', flexShrink: 0, marginLeft: 12 }}>
                    {formatDistance(p.distanceMeters)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {detent === 'full' && (getAround || emergency) && (
            <div style={{ borderTop: '1px solid rgba(26,22,20,.10)', paddingTop: 16, marginTop: 8 }}>
              {getAround && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#8C7F79', marginBottom: 4 }}>
                    {getAround.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#443A33', lineHeight: 1.5 }}>{getAround.body}</div>
                </div>
              )}
              {emergency && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#8C7F79', marginBottom: 4 }}>
                    {emergency.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#443A33', lineHeight: 1.5 }}>{emergency.body}</div>
                </div>
              )}
              <a
                href={buildWaterFountainSearchUrl(userLocation)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.82rem', color: 'var(--red)', fontWeight: 600, textDecoration: 'none' }}
              >
                🚰 Find Water Nearby
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
