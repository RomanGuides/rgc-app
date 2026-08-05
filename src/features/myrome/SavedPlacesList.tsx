// Roman Guides Companion — SavedPlacesList
// Contenuto della tab Saved (MyRomeScreen.tsx). Righe compatte
// deliberatamente (non Card piene) — nate per vivere anche dentro un
// bottom sheet con spazio limitato.
//
// Ordinata per distanza dall'utente (Empty and Error States addendum, stato
// 03) — utile mentre si è per strada, non solo per ordine di salvataggio.
// Senza una posizione nota, resta l'ordine di inserimento.

import { getCategoryMeta } from '../../config/categories.config';
import { usePlacesStore } from '../../store/usePlacesStore';
import { distMeters } from '../../utils/distance';
import type { Place } from '../../data/types';
import { EmptyState } from '../../design-system/components/EmptyState';
import { HeartIcon } from '../../design-system/components/Icons';

interface SavedPlacesListProps {
  onSelect?: (place: Place) => void;
  onBrowseMap?: () => void;
}

export function SavedPlacesList({ onSelect, onBrowseMap }: SavedPlacesListProps) {
  const places = usePlacesStore((s) => s.places);
  const savedPlaceIds = usePlacesStore((s) => s.savedPlaceIds);
  const toggleSaved = usePlacesStore((s) => s.toggleSaved);
  const selectPlace = usePlacesStore((s) => s.selectPlace);
  const userLocation = usePlacesStore((s) => s.userLocation);

  const placeById = Object.fromEntries(places.map((p) => [p.id, p]));
  let savedPlaces = savedPlaceIds.map((id) => placeById[id]).filter(Boolean);
  if (userLocation) {
    savedPlaces = [...savedPlaces].sort(
      (a, b) =>
        distMeters(userLocation.lat, userLocation.lng, a.lat, a.lng) -
        distMeters(userLocation.lat, userLocation.lng, b.lat, b.lng)
    );
  }

  if (savedPlaces.length === 0) {
    return (
      <EmptyState
        icon={<HeartIcon width={40} height={40} stroke="#D8CFC7" strokeWidth={1.6} />}
        message="Tap the heart on any place to keep it here. Your list stays sorted by how far away it is, so it is useful while you are standing in the street."
        action={
          onBrowseMap && (
            <button
              onClick={onBrowseMap}
              style={{ border: 'none', background: 'none', padding: 0, color: 'var(--red)', fontWeight: 600, fontSize: '1.0625rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Browse the map
            </button>
          )
        }
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
