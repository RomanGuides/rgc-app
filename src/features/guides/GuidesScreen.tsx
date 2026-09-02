// Roman Guides Companion — GuidesScreen (tab "Guides")
//
// Le bio delle guide vivevano dentro la tab Experiences, quinta di sette
// sezioni: misurate a 5.657px dall'inizio su viewport 390x844, cioè 7,3
// schermate di scorrimento, l'85% di profondità della tab. Aprendo
// Experiences non c'era alcun indizio che le guide esistessero. Promosse a
// tab propria il 2026-09-01, decisione di posizionamento del founder: le
// guide sono il prodotto di Roman Guides, e la barra ora lo dichiara.
//
// Nessun redesign del contenuto: lista e dettaglio sono quelli di prima,
// spostati. Foto 52px, bio troncata a due righe, dettaglio a schermo pieno
// al tap — identici.
//
// Guadagno tecnico collaterale: è sparito il meccanismo di scroll
// programmato verso la sezione (scrollTarget === 'guides' in
// ExperiencesScreen), che il commento di quel file documentava come
// inaffidabile nella WebView Android — misurava l'offset a mano perché
// scrollIntoView sbagliava l'antenato scrollabile. Una tab non ha bisogno di
// scorrere da nessuna parte: si apre già in cima.

import { useEffect, useState } from 'react';
import { getGuides } from '../../services/guidesService';
import { GuidePhoto } from './GuidePhoto';
import { GuideDetailScreen } from './GuideDetailScreen';
import { SectionHeader } from '../../design-system/components/SectionHeader';
import { BrandMark } from '../../design-system/components/BrandMark';
import type { Guide } from '../../data/types';

export function GuidesScreen() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  useEffect(() => {
    setGuides(getGuides());
  }, []);

  return (
    <>
      <div style={{ padding: 'var(--space-5) var(--space-4)', height: '100%', overflowY: 'auto', background: 'var(--bg-app)' }}>
        <BrandMark />
        <SectionHeader eyebrow="Your local experts" title="Meet the Guides" />
        <div style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
          {guides.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGuide(g)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                width: '100%',
                marginBottom: 'var(--space-4)',
                border: 'none',
                background: 'none',
                padding: 0,
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <GuidePhoto avatar={g.avatar} name={g.name} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)' }}>{g.name}</div>
                <div
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--stone)',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {g.bio}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {selectedGuide && <GuideDetailScreen guide={selectedGuide} onClose={() => setSelectedGuide(null)} />}
    </>
  );
}
