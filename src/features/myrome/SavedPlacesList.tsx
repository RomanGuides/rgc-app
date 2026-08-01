// Roman Guides Companion — SavedPlacesList
// Markup condiviso tra MyRomePanel (overlay sulla mappa) e MyRomeScreen
// (tab dedicata) — stessa logica, un solo posto da mantenere. Righe
// compatte deliberatamente (non Card piene): questo componente vive anche
// dentro un bottom sheet con spazio limitato.

import { getCategoryMeta } from '../../config/categories.config';
import { usePlacesStore } from '../../store/usePlacesStore';
import type { Place } from '../../data/types';
import { EmptyState } from '../../design-system/components/EmptyState';

interface SavedPlacesListProps {
  onSelect?: (place: Place) => void;
}

export function SavedPlacesList({ onSelect }: SavedPlacesListProps) {
  const places = usePlacesStore((s) => s.places);
  const savedPlaceIds = usePlacesStore((s) => s.savedPlaceIds);
  const toggleSaved = usePlacesStore((s) => s.toggleSaved);
  const selectPlace = usePlacesStore((s) => s.selectPlace);

  const placeById = Object.fromEntries(places.map((p) => [p.id, p]));
  const savedPlaces = savedPlaceIds.map((id) => placeById[id]).filter(Boolean);

  if (savedPlaces.length === 0) {
    return (
      <EmptyState
        emoji="❤️"
        title="Nothing saved yet"
        message="Tap the heart on any place on the map to start building your own list of Rome."
      />
    );
  }

  return (
    <>
      {savedPlaces.map((p) => {
        const meta = getCategoryMeta(p.category);
        return (
          <div
            key={p.id}
            onClick={() => {
              selectPlace(p);
              onSelect?.(p);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-2)',
              borderBottom: '1px solid var(--line)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              transition: 'background var(--duration-fast) ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: `linear-gradient(160deg, ${meta.color}, ${meta.color}dd)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                flexShrink: 0,
              }}
            >
              {meta.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink)' }}>{p.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--stone)' }}>
                {meta.label}
                {p.area ? ` · ${p.area}` : ''}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSaved(p.id);
              }}
              aria-label="Remove"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--stone)',
                fontSize: '1rem',
                cursor: 'pointer',
                padding: 'var(--space-1) var(--space-2)',
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </>
  );
}
