// Roman Guides Companion — ExploreScreen
// Griglia fotografica a 2 colonne. Toccare un luogo ora seleziona quel
// luogo e passa alla Mappa, dove si apre lo stesso popup Premium già
// costruito (foto, tip, indicazioni) — non si esce più dall'app verso una
// pagina esterna. Il link editoriale (detailUrl) resta comunque
// raggiungibile da dentro il popup stesso ("More Info →").

import { useEffect, useState } from 'react';
import type { Place } from '../../data/types';
import { getPlaces } from '../../services/placesService';
import { getCategoryMeta } from '../../config/categories.config';
import { SectionHeader } from '../../design-system/components/SectionHeader';
import { usePlacesStore } from '../../store/usePlacesStore';

interface ExploreScreenProps {
  onNavigate: (tab: 'home' | 'map' | 'experiences' | 'explore' | 'myrome') => void;
}

export function ExploreScreen({ onNavigate }: ExploreScreenProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const selectPlace = usePlacesStore((s) => s.selectPlace);

  useEffect(() => {
    setPlaces(getPlaces().filter((p) => p.category === 'gallery'));
  }, []);

  const meta = getCategoryMeta('gallery');

  function openOnMap(place: Place) {
    selectPlace(place);
    onNavigate('map');
  }

  return (
    <div style={{ padding: 'var(--space-5) var(--space-4)', height: '100%', overflowY: 'auto', background: 'var(--bg-app)' }}>
      <SectionHeader
        eyebrow="Roman Guides Companion"
        title="Explore"
        subtitle={`Visit on Your Own — ${places.length} places curated by locals who know them well.`}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
        {places.map((p) => (
          <button
            key={p.id}
            onClick={() => openOnMap(p)}
            style={{ textAlign: 'left', border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: 'inherit', font: 'inherit' }}
          >
            <div
              style={{
                position: 'relative',
                aspectRatio: '3 / 4',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: p.imageUrl
                  ? `url(${p.imageUrl}) center/cover`
                  : `linear-gradient(160deg, ${meta.color}, #2f4d2f)`,
                boxShadow: 'var(--shadow-card)',
                marginBottom: 'var(--space-2)',
              }}
            >
              {p.rating && (
                <span
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#fff',
                    background: 'rgba(0,0,0,0.45)',
                    backdropFilter: 'blur(4px)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-pill)',
                  }}
                >
                  ★ {p.rating}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3 }}>{p.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
