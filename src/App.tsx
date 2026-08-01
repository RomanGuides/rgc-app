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
import { TabBar, type TabKey } from './design-system/components/TabBar';
import './design-system/tokens.css';

type Tab = TabKey;

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

      <TabBar activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default App;
