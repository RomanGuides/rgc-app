// Roman Guides Companion — UtilityPlaceCard
// Popup per luoghi "utility" (categoria con tier 'utility': ristoranti,
// bar, ecc.) — NESSUNA foto per scelta progettuale, solo icona + nome +
// distanza + descrizione/tip se disponibili + Directions.

import type { Place } from '../../data/types';
import { Button } from '../../design-system/components/Button';
import { getCategoryMeta } from '../../config/categories.config';
import { distMeters, formatDistance } from '../../utils/distance';
import { startWalkingDirections } from './startWalkingDirections';
import type { UserLocation } from '../../store/usePlacesStore';

interface UtilityPlaceCardProps {
  place: Place;
  userLocation: UserLocation | null;
}

export function UtilityPlaceCard({ place: p, userLocation }: UtilityPlaceCardProps) {
  const meta = getCategoryMeta(p.category);
  const tip = p.content?.attribution;
  const description = p.content?.body;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: meta.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            flexShrink: 0,
          }}
        >
          {meta.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.25 }}>{p.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.72rem', color: 'var(--stone)', marginTop: 2 }}>
            <span>{meta.label}</span>
            {userLocation && (
              <>
                <span>·</span>
                <span>{formatDistance(distMeters(userLocation.lat, userLocation.lng, p.lat, p.lng))} away</span>
              </>
            )}
            {p.rating && (
              <>
                <span>·</span>
                <span style={{ color: '#e8a93b' }}>★ {p.rating}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {description && <div style={{ fontSize: '0.82rem', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>{description}</div>}

      {tip && (
        <div
          style={{
            background: 'var(--surface-2)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-2) var(--space-3)',
            marginBottom: 'var(--space-3)',
            fontSize: '0.78rem',
            lineHeight: 1.45,
          }}
        >
          <span style={{ fontWeight: 700, color: 'var(--red)' }}>Roman Guides Tip — </span>
          {tip}
        </div>
      )}

      <Button variant="primary" onClick={() => startWalkingDirections(p)} fullWidth>
        🧭 Get Directions
      </Button>
    </>
  );
}
