// Roman Guides Companion — App
// Tab bar a 3 sezioni (Rome, Experiences, Saved) — redesign v1. Rome sostituisce
// Home + Explore + Map; Saved sostituisce My Rome. Stato locale per la tab
// attiva — nessuna libreria di routing necessaria per un'app a poche tab
// senza URL profonde (Architettura v2, sezione 6).

import { useState } from 'react';
import { MapScreen } from './features/map/MapScreen';
import { ExperiencesScreen } from './features/experiences/ExperiencesScreen';
import { MyRomeScreen } from './features/myrome/MyRomeScreen';
import { WelcomeScreen } from './features/welcome/WelcomeScreen';
import { TabBar, type TabKey } from './design-system/components/TabBar';
import { usePlacesStore } from './store/usePlacesStore';
import './design-system/tokens.css';

type Tab = TabKey;

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('rome');
  const hasSeenWelcome = usePlacesStore((s) => s.hasSeenWelcome);
  const setHasSeenWelcome = usePlacesStore((s) => s.setHasSeenWelcome);

  if (!hasSeenWelcome) {
    return <WelcomeScreen onDone={setHasSeenWelcome} />;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {activeTab === 'rome' && <MapScreen />}
        {activeTab === 'experiences' && <ExperiencesScreen />}
        {activeTab === 'saved' && <MyRomeScreen onNavigate={setActiveTab} />}
      </div>

      <TabBar activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default App;
