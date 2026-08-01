// Roman Guides Companion — TabBar component
// Sostituisce la vecchia tab bar a emoji. L'icona del tab attivo viene
// cerchiata da un tratto di pennello, lo stesso segno che circonda il
// wordmark nel logo Roman Guides — porta il marchio dentro la
// navigazione invece di limitarsi a un'icona generica.

import type { ReactNode } from 'react';

export type TabKey = 'home' | 'map' | 'experiences' | 'explore' | 'myrome';

interface TabDef {
  key: TabKey;
  label: string;
  icon: ReactNode;
}

const ICON_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  width: 19,
  height: 19,
};

function HomeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

function ExperiencesIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 4v5M16 4v5" />
    </svg>
  );
}

function ExploreIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" strokeLinejoin="round" />
    </svg>
  );
}

function MyRomeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M20.8 4.9a5.4 5.4 0 0 0-7.6 0L12 6.1l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6l1.2 1.2L12 21l7.6-7.3 1.2-1.2a5.4 5.4 0 0 0 0-7.6Z" />
    </svg>
  );
}

const TABS: TabDef[] = [
  { key: 'home', label: 'Home', icon: <HomeIcon /> },
  { key: 'map', label: 'Mappa', icon: <MapIcon /> },
  { key: 'experiences', label: 'Experiences', icon: <ExperiencesIcon /> },
  { key: 'explore', label: 'Explore', icon: <ExploreIcon /> },
  { key: 'myrome', label: 'My Rome', icon: <MyRomeIcon /> },
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
