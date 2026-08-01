// Roman Guides Companion — DirectionsBar
// Barra flottante minimale mostrata durante un percorso attivo: icona a
// piedi, tempo stimato, distanza, bottone Stop Route. Nient'altro, come da
// specifica dello sprint Concierge Map.

import { usePlacesStore } from '../../store/usePlacesStore';
import { formatDistance } from '../../utils/distance';

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return '<1 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}min` : `${hours}h`;
}

export function DirectionsBar() {
  const activeRoute = usePlacesStore((s) => s.activeRoute);
  const setActiveRoute = usePlacesStore((s) => s.setActiveRoute);

  if (!activeRoute) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 'max(16px, calc(env(safe-area-inset-bottom) + 8px))',
        left: 16,
        right: 16,
        zIndex: 20,
        background: 'var(--black)',
        color: '#fff',
        borderRadius: 'var(--radius-pill)',
        padding: '10px 8px 10px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>🚶</span>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{formatDuration(activeRoute.remainingDurationSeconds)}</span>
        <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)' }}>
          {formatDistance(activeRoute.remainingDistanceMeters)}
        </span>
      </div>
      <button
        onClick={() => setActiveRoute(null)}
        style={{
          marginLeft: 'auto',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '8px 16px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid rgba(255,255,255,0.3)',
          background: 'transparent',
          color: '#fff',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Stop Route
      </button>
    </div>
  );
}
