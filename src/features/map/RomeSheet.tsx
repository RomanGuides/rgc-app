// Roman Guides Companion — RomeSheet
// Il foglio persistente della tab Rome (redesign v1, Fase 3) — sostituisce
// la barra nera, AroundMeBar (raggio) e CategoryFilterBar (chip categoria).
// Tre detent: peek (168), resting (392, default), full — trascinabile dalla
// maniglia. Dentro: campo di ricerca (apre SearchScreen), filtro categoria,
// "Tonight" (era Tip of the Day), "Nearest to you"; a detent pieno anche
// Get Around ed Emergency (contenuto ex-Home, redistribuito qui).
//
// Il raggio "Around Me" è stato rimosso di proposito (decisione del redesign):
// l'ordinamento è sempre per distanza a piedi, senza controllo utente.
// I filtri categoria restano, ma dentro il pannello del bottone Filtro
// invece di una riga di chip sempre visibile.

import { useCallback, useRef, useState } from 'react';
import { usePlacesStore } from '../../store/usePlacesStore';
import { getAppContentSection } from '../../services/appContentService';
import { distMeters, formatDistance } from '../../utils/distance';
import { buildWaterFountainSearchUrl } from '../../utils/waterFountainSearch';
import { CATEGORY_META } from '../../config/categories.config';
import { SearchIcon, FilterIcon } from '../../design-system/components/Icons';
import type { Place, PlaceCategory } from '../../data/types';

type Detent = 'peek' | 'resting' | 'full';

const PEEK_PX = 168;
const RESTING_PX = 392;
// "full" non ha un valore fisso nella spec — lascia una porzione di mappa
// visibile in alto invece di coprire tutto lo schermo.
const FULL_TOP_GAP_PX = 70;

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
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startY: number; startHeight: number } | null>(null);
  const [dragHeight, setDragHeight] = useState<number | null>(null);

  const heightForDetent = useCallback((d: Detent): number => {
    if (d === 'peek') return PEEK_PX;
    if (d === 'resting') return RESTING_PX;
    const containerHeight = containerRef.current?.clientHeight ?? 700;
    return Math.max(RESTING_PX, containerHeight - FULL_TOP_GAP_PX);
  }, []);

  const currentHeight = dragHeight ?? heightForDetent(detent);

  function onHandlePointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startY: e.clientY, startHeight: sheetRef.current?.getBoundingClientRect().height ?? currentHeight };
  }

  function onHandlePointerMove(e: React.PointerEvent) {
    if (!dragState.current) return;
    const delta = dragState.current.startY - e.clientY; // trascinare in su = più alto
    const containerHeight = containerRef.current?.clientHeight ?? 700;
    const max = Math.max(RESTING_PX, containerHeight - FULL_TOP_GAP_PX);
    const next = Math.min(max, Math.max(PEEK_PX, dragState.current.startHeight + delta));
    setDragHeight(next);
  }

  function onHandlePointerUp() {
    if (!dragState.current) return;
    const totalMovement = Math.abs((dragHeight ?? dragState.current.startHeight) - dragState.current.startHeight);
    dragState.current = null;

    // Movimento minimo (o nullo): trattalo come un tocco sulla maniglia,
    // non come un trascinamento — fa avanzare al detent successivo. Serve
    // da alternativa affidabile al drag vero e proprio (touch/mouse su
    // dispositivi/browser dove il gesto di trascinamento non è preciso).
    if (totalMovement < 10) {
      setDetent((d) => (d === 'peek' ? 'resting' : d === 'resting' ? 'full' : 'peek'));
      setDragHeight(null);
      return;
    }

    const current = dragHeight ?? currentHeight;
    const containerHeight = containerRef.current?.clientHeight ?? 700;
    const fullPx = Math.max(RESTING_PX, containerHeight - FULL_TOP_GAP_PX);
    const distances: [Detent, number][] = [
      ['peek', Math.abs(current - PEEK_PX)],
      ['resting', Math.abs(current - RESTING_PX)],
      ['full', Math.abs(current - fullPx)],
    ];
    distances.sort((a, b) => a[1] - b[1]);
    setDetent(distances[0][0]);
    setDragHeight(null);
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
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}
    >
      <div
        ref={sheetRef}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: currentHeight,
          background: '#FFFFFF',
          borderRadius: '22px 22px 0 0',
          boxShadow: '0 -14px 44px rgba(26,22,20,.14)',
          pointerEvents: 'auto',
          transition: dragHeight === null ? 'height 0.28s ease-out' : 'none',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
          style={{ padding: '10px 0 4px', cursor: 'grab', touchAction: 'none' }}
        >
          <div style={{ width: 38, height: 5, background: 'rgba(26,22,20,.16)', borderRadius: 3, margin: '0 auto' }} />
        </div>

        <div style={{ padding: '0 20px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 22, position: 'relative' }}>
            <button
              onClick={onOpenSearch}
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
                style={{
                  position: 'absolute',
                  top: 54,
                  right: 0,
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
