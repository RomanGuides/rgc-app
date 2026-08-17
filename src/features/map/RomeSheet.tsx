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

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { usePlacesStore } from '../../store/usePlacesStore';
import { getAppContentSection } from '../../services/appContentService';
import { distMeters, formatDistance } from '../../utils/distance';
import { buildWaterFountainSearchUrl } from '../../utils/waterFountainSearch';
import { CATEGORY_META } from '../../config/categories.config';
import { ROME_CENTER } from '../../config/app.config';
import { SearchIcon, FilterIcon, CATEGORY_ICONS } from '../../design-system/components/Icons';
import { EmptyState } from '../../design-system/components/EmptyState';
import type { LocationStatus } from '../../hooks/useGeolocation';
import type { Place, PlaceCategory } from '../../data/types';

export type Detent = 'peek' | 'resting' | 'full';

const DETENT_FRACTIONS: Record<Detent, number> = { peek: 0.16, resting: 0.4, full: 0.9 };
// Un permesso concesso ma una posizione lontana (a casa, in aeroporto prima
// di partire) risolve comunque a una distanza reale — "Nearest to you"
// mostrerebbe "9.000 km" invece di accorgersi che l'utente non è ancora
// arrivato. 50km copre comodamente l'intera area metropolitana di Roma
// (Fiumicino ~30km, Ciampino ~15km dal centro) senza scattare per chi è
// già in zona.
const OUTSIDE_ROME_THRESHOLD_METERS = 50000;
const STIFFNESS = 320;
const DAMPING = 34;
const RUBBER_BAND = 0.35;
const VELOCITY_PROJECTION_S = 0.15;
const TAP_MOVEMENT_THRESHOLD_PX = 8;
const BODY_DRAG_COMMIT_THRESHOLD_PX = 6;

interface RomeSheetProps {
  onOpenSearch: () => void;
  locationStatus: LocationStatus;
  forceFullDetent?: boolean; // stato 04: offline — il foglio sale a full così la lista porta lo schermo
  onDetentChange?: (detent: Detent) => void; // MapScreen ne ha bisogno per nascondere LocateButton al detent full (altrimenti il bottone filtro ci finisce sotto, stesso angolo di schermo)
  onOpenLegal?: () => void;
}

// "Tonight" (tip_of_the_day) ha un ctaUrl reale (oggi un link Instagram) da
// tempo nei dati, mai letto qui — il blocco era testo puro, non toccabile.
// Stesso pattern di link esterno già usato per "Leave a review"/"Find Water
// Nearby" in questo stesso file. Senza ctaUrl resta un blocco informativo,
// non un bottone finto.
function TonightTapTarget({ href, children }: { href?: string | null; children: ReactNode }) {
  if (!href) return <>{children}</>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
      {children}
    </a>
  );
}

// Etichetta maiuscola di sezione ("Tonight"/eyebrow di area/"Nearest to
// you") — stesso oggetto ripetuto 3 volte con solo marginBottom diverso
// (audit token Fase 5).
const SECTION_LABEL_BASE = {
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '.09em',
  textTransform: 'uppercase' as const,
  color: 'var(--stone)',
};

// Bottone "solo testo" (Show nearest places/Clear filters/Legal & About) —
// stesso reset di bottone ripetuto 3 volte, solo colore/dimensione diversi
// (audit token Fase 5).
function textButtonStyle(color: string, fontSize = '1.0625rem') {
  return {
    border: 'none',
    background: 'none',
    padding: 0,
    textAlign: 'left' as const,
    color,
    fontWeight: 600,
    fontSize,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };
}

// Get Around/Emergency — stesso blocco eyebrow+corpo copiato due volte
// (audit token Fase 5).
function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--ink)', lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}

export function RomeSheet({ onOpenSearch, locationStatus, forceFullDetent, onDetentChange, onOpenLegal }: RomeSheetProps) {
  const places = usePlacesStore((s) => s.places);
  const activeCategories = usePlacesStore((s) => s.activeCategories);
  const toggleCategory = usePlacesStore((s) => s.toggleCategory);
  const setActiveCategories = usePlacesStore((s) => s.setActiveCategories);
  const userLocation = usePlacesStore((s) => s.userLocation);
  const selectPlace = usePlacesStore((s) => s.selectPlace);

  const [detent, setDetent] = useState<Detent>('resting');
  const [filterOpen, setFilterOpen] = useState(false);
  const [heightPx, setHeightPx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Popover filtro — portato in document.body (vedi il return più sotto):
  // il foglio ha `overflow: hidden` e il proprio stacking context (il
  // wrapper esterno è a z-index 5, più basso di LocateButton a 6), quindi
  // un popover annidato lì dentro non può mai comparire sopra LocateButton
  // per quanto alto sia il suo z-index locale — veniva tagliato e finiva
  // sotto in z-order (bug corretto qui). Con un portal la posizione è
  // calcolata dal rect reale del bottone, non da un offset fisso.
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterPopoverRef = useRef<HTMLDivElement>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<{ top?: number; bottom?: number; right: number } | null>(null);

  function handleFilterToggle() {
    setFilterOpen((wasOpen) => {
      const next = !wasOpen;
      if (next && filterButtonRef.current) {
        const rect = filterButtonRef.current.getBoundingClientRect();
        // Ancorato sotto per default, 8px di distacco — ribaltato sopra
        // nel layout effect qui sotto se non c'è spazio a sufficienza.
        setPopoverAnchor({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
      }
      return next;
    });
  }

  // Non sovrapporsi mai al bottone: se lo spazio sotto non basta per
  // l'altezza reale del popover (nota solo dopo il primo render), si apre
  // verso l'alto invece.
  useLayoutEffect(() => {
    if (!filterOpen || !filterButtonRef.current || !filterPopoverRef.current) return;
    const buttonRect = filterButtonRef.current.getBoundingClientRect();
    const popoverHeight = filterPopoverRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - buttonRect.bottom - 8;
    if (spaceBelow < popoverHeight) {
      setPopoverAnchor({ bottom: window.innerHeight - buttonRect.top + 8, right: window.innerWidth - buttonRect.right });
    }
  }, [filterOpen]);

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

  // Stato 04: offline — il foglio sale a full da solo (non un default
  // iniziale, un salto attivo quando la connessione cade) così la lista dei
  // luoghi porta lo schermo invece di lasciare la mappa vuota in primo piano.
  useEffect(() => {
    if (forceFullDetent) animateToDetent('full', 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceFullDetent]);

  useEffect(() => {
    onDetentChange?.(detent);
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

  // Stato 02 (Empty and Error States addendum): il filtro categoria svuota
  // l'elenco — nella nostra app, con il raggio "Around Me" rimosso in Fase 3,
  // l'unico modo reale di arrivarci è deselezionare tutte le categorie dal
  // popover Filtro (ogni categoria ha sempre almeno un luogo). Due azioni
  // distinte come da spec, adattate al nostro modello a sole categorie:
  // "Show nearest places" riaccende solo le categorie dei luoghi più vicini
  // (equivalente minimo di "allargare"), "Clear filters" le riaccende tutte.
  function handleShowNearestPlaces() {
    const nearestAcrossAll = userLocation
      ? [...places]
          .sort(
            (a, b) =>
              distMeters(userLocation.lat, userLocation.lng, a.lat, a.lng) -
              distMeters(userLocation.lat, userLocation.lng, b.lat, b.lng)
          )
          .slice(0, 2)
      : [];
    setActiveCategories(new Set(nearestAcrossAll.map((p) => p.category)));
  }

  function handleClearFilters() {
    setActiveCategories(new Set(Object.keys(CATEGORY_META) as PlaceCategory[]));
  }

  const tonight = getAppContentSection('tip_of_the_day');
  const getAround = getAppContentSection('get_around');
  const emergency = getAppContentSection('emergency');
  // Un puntino sul bottone Filtro quando è attivo un sottoinsieme di categorie
  // — prima non c'era alcun indizio visivo sul bottone stesso, un utente
  // poteva filtrare e dimenticarsene, chiedendosi perché "Nearest to you"
  // sembra incompleto.
  const isFiltered = activeCategories.size < Object.keys(CATEGORY_META).length;

  const visiblePlaces = places.filter((p) => activeCategories.has(p.category));
  const nearest: (Place & { distanceMeters: number })[] = userLocation
    ? visiblePlaces
        .map((p) => ({ ...p, distanceMeters: distMeters(userLocation.lat, userLocation.lng, p.lat, p.lng) }))
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, 2)
    : [];

  const isOutsideRome = userLocation
    ? distMeters(userLocation.lat, userLocation.lng, ROME_CENTER[1], ROME_CENTER[0]) > OUTSIDE_ROME_THRESHOLD_METERS
    : false;

  // Stato 05 (Empty and Error States addendum): permesso di localizzazione
  // rifiutato esplicitamente — "Nearest to you" non ha senso senza distanze
  // reali, quindi viene sostituito (non svuotato) da un elenco per zona.
  // Stessa sostituzione se la posizione è nota ma lontana da Roma (vedi
  // isOutsideRome sopra): "Nearest to you" con "9.000 km" è tecnicamente
  // corretto ma inutile, non diverso nella pratica da non sapere la posizione.
  // Aree canoniche garantite da scripts/check-place-areas.mjs — nessun
  // luogo può avere area nulla o fuori lista a build completata.
  const areaGroups: { area: string; places: Place[] }[] =
    (locationStatus === 'denied' || isOutsideRome) && visiblePlaces.length > 0
      ? Object.entries(
          visiblePlaces.reduce<Record<string, Place[]>>((acc, p) => {
            const area = p.area ?? 'Other';
            (acc[area] ??= []).push(p);
            return acc;
          }, {})
        )
          .map(([area, areaPlaces]) => ({ area, places: areaPlaces }))
          .sort((a, b) => b.places.length - a.places.length || a.area.localeCompare(b.area))
      : [];

  return (
    <>
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: heightPx ?? getDetentPx('resting'),
          background: 'var(--surface)',
          borderRadius: '22px 22px 0 0',
          boxShadow: '0 -14px 44px var(--shadow-color)',
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
          <div role="button" aria-label="Expand or collapse" style={{ padding: '10px 0 4px' }}>
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
                background: 'var(--bg-app)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 14px',
                color: 'var(--stone)',
                fontSize: '0.95rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <SearchIcon width={19} height={19} />
              Search Rome
            </button>
            <button
              ref={filterButtonRef}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleFilterToggle}
              aria-label={isFiltered ? 'Filter by category (filter active)' : 'Filter by category'}
              style={{
                width: 32,
                height: 32,
                alignSelf: 'center',
                borderRadius: '50%',
                background: 'var(--bg-app)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ink)',
                cursor: 'pointer',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              <FilterIcon width={16} height={16} />
              {isFiltered && (
                <span
                  style={{
                    position: 'absolute',
                    top: -1,
                    right: -1,
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: 'var(--red)',
                    border: '1.5px solid var(--white)',
                  }}
                />
              )}
            </button>
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
              <div style={{ ...SECTION_LABEL_BASE, marginBottom: 8 }}>Tonight</div>
              <TonightTapTarget href={tonight.ctaUrl}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {tonight.imageUrl && (
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        flexShrink: 0,
                        background: `url(${tonight.imageUrl}) center/cover`,
                      }}
                    />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>
                      {tonight.title}
                    </div>
                    {tonight.subtitle && <div style={{ fontSize: '0.85rem', color: 'var(--stone)', lineHeight: 1.35 }}>{tonight.subtitle}</div>}
                  </div>
                </div>
              </TonightTapTarget>
            </div>
          )}

          {visiblePlaces.length === 0 && (
            <div style={{ marginBottom: 24 }}>
              <EmptyState
                message="No places match your filter. We only carry the eighty-nine places our guides stand behind."
                action={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {userLocation && (
                      <button onClick={handleShowNearestPlaces} style={textButtonStyle('var(--red)')}>
                        Show nearest places
                      </button>
                    )}
                    <button onClick={handleClearFilters} style={textButtonStyle('var(--stone)')}>
                      Clear filters
                    </button>
                  </div>
                }
              />
            </div>
          )}

          {visiblePlaces.length > 0 && (locationStatus === 'denied' || isOutsideRome
            ? areaGroups.map((g) => (
                <div key={g.area} style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', ...SECTION_LABEL_BASE, marginBottom: 10 }}>
                    <span>{g.area}</span>
                    <span style={{ color: 'var(--stone)' }}>
                      {g.places.length} place{g.places.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  {g.places.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selectPlace(p)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 0',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                        fontSize: '1rem',
                        color: 'var(--ink)',
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              ))
            : nearest.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ ...SECTION_LABEL_BASE, marginBottom: 10 }}>Nearest to you</div>
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
                      <span style={{ fontSize: '1rem', color: 'var(--ink)' }}>{p.name}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--stone)', flexShrink: 0, marginLeft: 12 }}>
                        {formatDistance(p.distanceMeters)}
                      </span>
                    </button>
                  ))}
                </div>
              ))}

          {detent === 'full' && (getAround || emergency) && (
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, marginTop: 8 }}>
              {getAround && <InfoBlock title={getAround.title} body={getAround.body} />}
              {emergency && <InfoBlock title={emergency.title} body={emergency.body} />}
              <a
                href={buildWaterFountainSearchUrl(userLocation)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.82rem', color: 'var(--red)', fontWeight: 600, textDecoration: 'none', display: 'block', marginBottom: 12 }}
              >
                🚰 Find Water Nearby
              </a>
              {onOpenLegal && (
                <button onClick={onOpenLegal} style={textButtonStyle('var(--stone)', '0.82rem')}>
                  Legal &amp; About
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {filterOpen &&
      popoverAnchor &&
      createPortal(
        <>
          {/* Backdrop trasparente a tutto schermo — chiude il popover al
              tap, così non resta aperto sopra la lista o altri controlli. */}
          <div onClick={() => setFilterOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30 }} />
          <div
            ref={filterPopoverRef}
            style={{
              position: 'fixed',
              ...(popoverAnchor.top !== undefined ? { top: popoverAnchor.top } : { bottom: popoverAnchor.bottom }),
              right: popoverAnchor.right,
              zIndex: 31,
              background: 'var(--surface)',
              borderRadius: 16,
              boxShadow: '0 8px 28px var(--shadow-color)',
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              minWidth: 220,
            }}
          >
            {(Object.keys(CATEGORY_META) as PlaceCategory[]).map((cat) => {
              const meta = CATEGORY_META[cat];
              const active = activeCategories.has(cat);
              const Icon = CATEGORY_ICONS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: 'none',
                    background: active ? 'var(--bg-app)' : 'transparent',
                    color: active ? 'var(--red)' : 'var(--stone)',
                    fontSize: '0.85rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  <Icon width={20} height={20} strokeWidth={2} />
                  <span style={{ color: 'var(--ink)' }}>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}
  </>
  );
}
