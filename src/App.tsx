// Roman Guides Companion — App
// Tab bar a 5 sezioni (Home, Mappa, Experiences, Explore, My Rome), come
// nella PWA esistente. Stato locale per la tab attiva — nessuna libreria di
// routing necessaria per un'app a 5 tab senza URL profonde (Architettura v2, sezione 6).

import { useState } from 'react';
import { HomeScreen } from './features/home/HomeScreen';
import { MapScreen } from './features/map/MapScreen';
import { ExperiencesScreen } from './features/experiences/ExperiencesScreen';
import { ExploreScreen } from './features/explore/ExploreScreen';
import { MyRomeScreen } from './features/myrome/MyRomeScreen';
import './design-system/tokens.css';

type Tab = 'home' | 'map' | 'experiences' | 'explore' | 'myrome';

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: 'home', label: 'Home', emoji: '🏠' },
  { key: 'map', label: 'Mappa', emoji: '📍' },
  { key: 'experiences', label: 'Experiences', emoji: '🎬' },
  { key: 'explore', label: 'Explore', emoji: '🏛️' },
  { key: 'myrome', label: 'My Rome', emoji: '❤️' },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('map');

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {activeTab === 'home' && <HomeScreen onNavigate={setActiveTab} />}
        {activeTab === 'map' && <MapScreen />}
        {activeTab === 'experiences' && <ExperiencesScreen />}
        {activeTab === 'explore' && <ExploreScreen onNavigate={setActiveTab} />}
        {activeTab === 'myrome' && <MyRomeScreen onNavigate={setActiveTab} />}
      </div>

      <div
        style={{
          display: 'flex',
          borderTop: '1px solid var(--line)',
          background: 'var(--surface)',
          flexShrink: 0,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '10px 4px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              color: activeTab === tab.key ? 'var(--red)' : 'var(--stone)',
              fontWeight: activeTab === tab.key ? 700 : 500,
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{tab.emoji}</span>
            <span style={{ fontSize: '0.62rem' }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
