// Roman Guides Companion — WelcomeScreen
// Mostrata una sola volta per installazione, prima di qualunque tab —
// vedi App.tsx (gate su hasSeenWelcome, persistito in usePlacesStore) e
// docs/AppStatus.md per il perché: senza questa schermata l'unico modo di
// concedere la posizione è toccare la bussola senza alcun contesto, e su
// iOS un rifiuto lì è per sempre (il dialogo di sistema si mostra una sola
// volta nella vita dell'app). Una schermata che spiega prima di chiedere
// aumenta la probabilità di un sì — e quel sì è ciò che rende utile
// "Nearest to you". Nessun carosello: chi ha appena scaricato l'app vuole
// entrare, non essere istruito.

import { useGeolocation } from '../../hooks/useGeolocation';
import { getAppContentSection } from '../../services/appContentService';
import { OUR_STORY_MASTHEAD } from '../../config/story';

interface WelcomeScreenProps {
  onDone: () => void;
}

export function WelcomeScreen({ onDone }: WelcomeScreenProps) {
  const { requestLocation } = useGeolocation();
  const hero = getAppContentSection('hero');

  function handlePrimary() {
    // Che l'utente conceda o neghi, si procede lo stesso — l'app gestisce
    // già entrambi i casi (Nearest to you, o l'elenco per zona di RomeSheet).
    requestLocation();
    onDone();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#100C0A' }}>
      {hero?.imageUrl && (
        <img
          src={hero.imageUrl}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      {/* Sfumatura sul terzo inferiore per la leggibilità — se la foto non
          carica, resta comunque questo fondo scuro e il testo resta leggibile. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(16,12,10,.94) 0%, rgba(16,12,10,.6) 40%, transparent 72%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 20px)',
          left: 24,
          fontFamily: 'var(--display)',
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          color: '#FFFFFF',
        }}
      >
        Roman Guides
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
          padding: '0 24px',
        }}
      >
        <div style={{ fontFamily: 'var(--display)', fontSize: '2.1rem', fontWeight: 700, lineHeight: 1.15, color: '#FFFFFF', marginBottom: 14 }}>
          {OUR_STORY_MASTHEAD}
        </div>
        <div style={{ fontSize: '1.0625rem', lineHeight: 1.5, color: 'rgba(255,255,255,.88)', marginBottom: 28 }}>
          Eighty-nine places we actually send our friends to. The nearest ones first.
        </div>
        <button
          onClick={handlePrimary}
          style={{
            width: '100%',
            height: 54,
            borderRadius: 16,
            background: '#CC0029',
            color: '#fff',
            fontSize: '1.05rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            marginBottom: 18,
          }}
        >
          Show me what's nearby
        </button>
        <button
          onClick={onDone}
          style={{
            display: 'block',
            width: '100%',
            border: 'none',
            background: 'none',
            padding: 0,
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,.75)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            textAlign: 'center',
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
