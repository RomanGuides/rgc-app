// Roman Guides Companion — SearchScreen
// Nuova schermata (redesign v1, Fase 3) — non esisteva prima. Full-screen,
// non un modale. Filtro in tempo reale su nome + categoria + area, nessun
// invio/spinner. Sostituisce la funzione di navigazione della vecchia tab
// Explore (rimossa in Fase 2).

import { useState } from 'react';
import { usePlacesStore } from '../../store/usePlacesStore';
import { getCategoryMeta } from '../../config/categories.config';
import { distMeters } from '../../utils/distance';
import { AVERAGE_WALKING_SPEED_MPS } from '../../config/routing.config';
import { SearchIcon, ChevronLeftIcon } from '../../design-system/components/Icons';
import type { Place } from '../../data/types';

interface SearchScreenProps {
  onClose: () => void;
}

function walkingMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / AVERAGE_WALKING_SPEED_MPS / 60));
}

export function SearchScreen({ onClose }: SearchScreenProps) {
  const places = usePlacesStore((s) => s.places);
  const userLocation = usePlacesStore((s) => s.userLocation);
  const selectPlace = usePlacesStore((s) => s.selectPlace);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered: Place[] = q
    ? places.filter((p) => {
        const meta = getCategoryMeta(p.category);
        return (
          p.name.toLowerCase().includes(q) ||
          meta.label.toLowerCase().includes(q) ||
          (p.area ?? '').toLowerCase().includes(q)
        );
      })
    : places;

  const results = userLocation
    ? [...filtered].sort(
        (a, b) =>
          distMeters(userLocation.lat, userLocation.lng, a.lat, a.lng) -
          distMeters(userLocation.lat, userLocation.lng, b.lat, b.lng)
      )
    : filtered;

  function handleSelect(p: Place) {
    selectPlace(p);
    onClose();
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', zIndex: 8, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 20px 14px',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Back"
          style={{ border: 'none', background: 'none', color: 'var(--ink)', cursor: 'pointer', display: 'flex', padding: 4 }}
        >
          <ChevronLeftIcon width={22} height={22} />
        </button>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            height: 48,
            borderRadius: 14,
            background: '#F3EFEB',
            border: q ? '1.5px solid #CC0029' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 14px',
          }}
        >
          <SearchIcon width={19} height={19} color="#8C7F79" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search places, categories, areas…"
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--ink)',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <button
          onClick={onClose}
          style={{ border: 'none', background: 'none', color: 'var(--red)', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Cancel
        </button>
      </div>

      <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: '#6E645F', padding: '0 20px 8px' }}>
        {q ? `${results.length} result${results.length === 1 ? '' : 's'}` : userLocation ? 'Nearest to you' : 'All places'}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        {results.length === 0 && (
          <div style={{ padding: '24px 0', fontSize: '0.9rem', color: '#8C7F79' }}>No places match "{query}".</div>
        )}
        {results.map((p) => {
          const meta = getCategoryMeta(p.category);
          const minutes = userLocation ? walkingMinutes(distMeters(userLocation.lat, userLocation.lng, p.lat, p.lng)) : null;
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '12px 0',
                border: 'none',
                borderBottom: '1px solid rgba(26,22,20,.07)',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: p.imageUrl ? `url(${p.imageUrl}) center/cover` : meta.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                }}
              >
                {!p.imageUrl && meta.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '1.05rem', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6E645F' }}>
                  {meta.label}
                  {p.area ? ` · ${p.area}` : ''}
                  {minutes !== null ? ` · ${minutes} min walk` : ''}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
