// Roman Guides Companion — LocateButton
// Bottone circolare "usa la mia posizione" sopra la mappa — sostituisce il
// bottone testuale che viveva in AroundMeBar (rimossa in Fase 3). Stessa
// logica (requestLocation + segnale per centrare la mappa), solo icona.

import type { LocationStatus } from '../../hooks/useGeolocation';

interface LocateButtonProps {
  status: LocationStatus;
  onClick: () => void;
  // RomeSheet al detent "full" (90% schermo) fa risalire il proprio header
  // — bottone filtro incluso — fin dentro lo stesso angolo in alto a destra
  // dove vive questo bottone. Il suo z-index resta più alto apposta (il
  // popover filtro deve poter comparire sopra), quindi senza questo il
  // filtro finirebbe visivamente sotto la bussola invece di scomparire lei.
  hidden?: boolean;
}

export function LocateButton({ status, onClick, hidden }: LocateButtonProps) {
  const located = status === 'located' || status === 'fallback';

  return (
    <button
      onClick={onClick}
      aria-label={status === 'locating' ? 'Locating…' : located ? 'Located' : 'Use my location'}
      aria-hidden={hidden}
      style={{
        position: 'absolute',
        top: 'calc(env(safe-area-inset-top, 0px) + 62px)',
        right: 20,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: '#FFFFFF',
        border: 'none',
        boxShadow: '0 1px 3px rgba(26,22,20,.10), 0 8px 22px rgba(26,22,20,.14)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        cursor: 'pointer',
        zIndex: 6,
        opacity: hidden ? 0 : status === 'locating' ? 0.6 : 1,
        pointerEvents: hidden ? 'none' : 'auto',
        transition: 'opacity 0.2s ease',
      }}
    >
      {located ? '📍' : '🧭'}
    </button>
  );
}
