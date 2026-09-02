// Roman Guides Companion — TabBar component
// Sostituisce la vecchia tab bar a emoji. L'icona del tab attivo viene
// cerchiata da un tratto di pennello, lo stesso segno che circonda il
// wordmark nel logo Roman Guides — porta il marchio dentro la
// navigazione invece di limitarsi a un'icona generica.
//
// Le icone (audit brand 2026-08-17) vengono ora da Icons.tsx invece di un
// set locale a parte — questo file prima duplicava la stessa semantica
// stroke-2/round-cap/no-fill in un secondo oggetto ICON_PROPS, la "seconda
// famiglia icone" che il design system dice esplicitamente di non avere.

import { HomeIcon, LocationPinIcon, TicketIcon, PersonIcon, HeartIcon } from './Icons';
import type { ReactNode } from 'react';

export type TabKey = 'home' | 'rome' | 'experiences' | 'guides' | 'saved';

interface TabDef {
  key: TabKey;
  label: string;
  icon: ReactNode;
}

const TABS: TabDef[] = [
  { key: 'home', label: 'Home', icon: <HomeIcon width={19} height={19} /> },
  { key: 'rome', label: 'Rome', icon: <LocationPinIcon width={19} height={19} /> },
  { key: 'experiences', label: 'Experiences', icon: <TicketIcon width={19} height={19} /> },
  // Le guide erano la quinta di sette sezioni dentro Experiences, a 7,3
  // schermate di scorrimento. Promosse a tab il 2026-09-01. PersonIcon e' gia'
  // l'icona canonica delle guide in questo design system (la scorciatoia della
  // Home e la riga "Local guides" la usano da agosto): nessuna icona nuova,
  // come chiede la regola no-duplication di CONTRIBUTING.md.
  { key: 'guides', label: 'Guides', icon: <PersonIcon width={19} height={19} /> },
  { key: 'saved', label: 'Saved', icon: <HeartIcon width={19} height={19} /> },
];

// Tratto di pennello — stesso path per ogni tab, leggermente irregolare
// per non sembrare un cerchio geometrico perfetto (coerente col logo).
function BrushRing({ active }: { active: boolean }) {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 40 40"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: active ? 1 : 0,
        transform: active ? 'scale(1)' : 'scale(0.6)',
        transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,0.9,0.32,1)',
        pointerEvents: 'none',
      }}
    >
      <path
        d="M20 2 C29 1, 37 8, 38 18 C39 28, 31 37, 20 38 C10 39, 2 31, 2 20 C1 10, 11 2, 20 2"
        fill="none"
        stroke="var(--red)"
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

interface TabBarProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        borderTop: '1px solid var(--line)',
        background: 'var(--surface)',
        flexShrink: 0,
        // Nella WebView nativa (Android edge-to-edge da targetSdk 35+) l'app
        // disegna fino al bordo fisico dello schermo: senza questo padding
        // i pulsanti della tab bar finiscono sotto la barra di navigazione
        // di sistema (3 pulsanti), che intercetta il tocco per prima.
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1,
              // Senza minWidth: 0 la dimensione minima automatica di un flex
              // item e' il suo contenuto: l'etichetta piu' lunga ('Experiences')
              // non poteva comprimersi sotto la propria larghezza di testo e le
              // altre tab assorbivano la differenza. Misurato su viewport 320px:
              // a scala del font di sistema ~2,00 la somma dei pulsanti arrivava
              // a 323,2px contro 320 disponibili e l'ultima tab usciva dallo
              // schermo. Peggiora con ogni tab in piu'. Ora l'etichetta si
              // comprime in ellipsis e il pavimento diventa l'icona (36px + 8px
              // di padding), non il testo.
              minWidth: 0,
              padding: '12px 4px 10px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              fontFamily: 'inherit',
            }}
          >
            <span
              style={{
                position: 'relative',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? 'var(--red)' : 'var(--stone)',
                transition: 'color 0.2s ease',
              }}
            >
              <BrushRing active={isActive} />
              <span style={{ position: 'relative', zIndex: 1, display: 'flex' }}>{tab.icon}</span>
            </span>
            <span
              style={{
                fontSize: '0.625rem',
                color: isActive ? 'var(--red)' : 'var(--stone)',
                fontWeight: isActive ? 700 : 500,
                transition: 'color 0.2s ease',
                // Vedi minWidth: 0 sopra. nowrap perche una seconda riga
                // alzerebbe la barra solo per una tab, disallineando le altre.
                maxWidth: '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
