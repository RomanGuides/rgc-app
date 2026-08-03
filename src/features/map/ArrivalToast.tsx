// Roman Guides Companion — ArrivalToast
// Messaggio "✓ You have arrived", si nasconde da solo dopo circa 2 secondi
// (la temporizzazione vive in useRouteTracking, qui solo la presentazione).

import { usePlacesStore } from '../../store/usePlacesStore';

export function ArrivalToast() {
  const visible = usePlacesStore((s) => s.arrivalMessageVisible);
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 30,
        background: 'var(--ink)',
        color: '#fff',
        fontWeight: 700,
        fontSize: '0.9rem',
        padding: '12px 24px',
        borderRadius: 'var(--radius-pill)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      ✓ You have arrived
    </div>
  );
}
