// Roman Guides Companion — TabBar component
// Sostituisce la vecchia tab bar a emoji. L'icona del tab attivo viene
// cerchiata da un tratto di pennello, lo stesso segno che circonda il
// wordmark nel logo Roman Guides — porta il marchio dentro la
// navigazione invece di limitarsi a un'icona generica.

import type { ReactNode } from 'react';
import { BrushRing } from './BrushRing';
import { HomeIcon, MapPinIcon, ExperiencesIcon, ExploreIcon, HeartIcon } from './Icons';

export type TabKey = 'home' | 'map' | 'experiences' | 'explore' | 'myrome';

interface TabDef {
  key: TabKey;
  label: string;
  icon: ReactNode;
}

const TABS: TabDef[] = [
  { key: 'home', label: 'Home', icon: <HomeIcon width={19} height={19} /> },
  { key: 'map', label: 'Mappa', icon: <MapPinIcon width={19} height={19} /> },
  { key: 'experiences', label: 'Experiences', icon: <ExperiencesIcon width={19} height={19} /> },
  { key: 'explore', label: 'Explore', icon: <ExploreIcon width={19} height={19} /> },
  { key: 'myrome', label: 'My Rome', icon: <HeartIcon width={19} height={19} /> },
];

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
