// Roman Guides Companion — GuideDetailScreen
// La bio completa di ogni guida (tre paragrafi, una citazione, un titolo)
// esisteva nei dati ma era quasi invisibile: "Meet the Guides" ne mostrava
// solo la prima riga. Tap su una riga guida -> questa schermata a schermo
// intero, foto grande, citazione, bio intera. Nessun bottone di contatto
// (WhatsApp) per scelta esplicita — è un impegno operativo sui tempi di
// risposta, non solo una decisione di contenuto, e non è stato approvato.
//
// Croce vs freccia indietro: qui si usa la freccia, non la croce — si entra
// da una riga dentro il tab Experiences (come Search da RomeSheet), non da
// un flusso esterno come il checkout; tornare indietro è il gesto giusto.

import { ChevronLeftIcon } from '../../design-system/components/Icons';
import { GuidePhoto } from './ExperiencesScreen';
import type { Guide } from '../../data/types';
import { useAndroidBackHandler } from '../../hooks/useAndroidBackHandler';

interface GuideDetailScreenProps {
  guide: Guide;
  onClose: () => void;
}

export function GuideDetailScreen({ guide, onClose }: GuideDetailScreenProps) {
  useAndroidBackHandler(onClose);
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--surface)', zIndex: 8, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 20px 14px',
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Back"
          style={{ border: 'none', background: 'none', color: 'var(--ink)', cursor: 'pointer', display: 'flex', padding: 4, marginLeft: -4 }}
        >
          <ChevronLeftIcon width={22} height={22} />
        </button>
      </div>

      {/* Niente env(safe-area-inset-bottom): stesso motivo di
          TourDetailScreen.tsx/PlaceScreen.tsx/LegalScreen.tsx (2026-08-18). */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 28 }}>
          <GuidePhoto avatar={guide.avatar} name={guide.name} size={112} />
          <div style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginTop: 18 }}>
            {guide.displayTitle}
          </div>
        </div>

        {guide.quote && (
          <div
            style={{
              fontFamily: 'var(--display)',
              fontSize: '1.15rem',
              fontStyle: 'normal',
              lineHeight: 1.5,
              color: 'var(--ink)',
              textAlign: 'center',
              margin: '0 0 28px',
            }}
          >
            {guide.quote}
          </div>
        )}

        {/* La bio arriva da guides.json come stringa unica, con i paragrafi
            separati da una riga vuota (\n\n). In HTML un newline collassa in uno
            spazio, quindi senza questo split le bio lunghe (Realda: tre paragrafi,
            ~1.100 caratteri) si leggevano come un unico muro di testo. Le bio senza
            \n\n restano un solo paragrafo: nessun cambiamento per le altre guide. */}
        {guide.bio.split('\n\n').map((paragraph, i) => (
          <p
            key={i}
            style={{ fontSize: '1.0625rem', lineHeight: 1.6, color: 'var(--ink)', margin: i === 0 ? 0 : '1em 0 0' }}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
