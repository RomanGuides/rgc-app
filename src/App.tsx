// Roman Guides Companion — App
// Tab bar a 4 sezioni (Home, Rome, Experiences, Saved). Home aggiunta il
// 2026-08-16 — non una marcia indietro cieca sul taglio 5→3 di questo stesso
// redesign, ma un'eccezione motivata: biglietto da visita + scorciatoie di
// navigazione, non un duplicato dei contenuti di Rome/Experiences (vedi
// HomeScreen.tsx). Stato locale per la tab attiva — nessuna libreria di
// routing necessaria per un'app a poche tab senza URL profonde (Architettura
// v2, sezione 6).

import { useState } from 'react';
import { HomeScreen } from './features/home/HomeScreen';
import { MapScreen } from './features/map/MapScreen';
import { ExperiencesScreen } from './features/experiences/ExperiencesScreen';
import { MyRomeScreen } from './features/myrome/MyRomeScreen';
import { WelcomeScreen } from './features/welcome/WelcomeScreen';
import { TabBar, type TabKey } from './design-system/components/TabBar';
import { usePlacesStore } from './store/usePlacesStore';
import './design-system/tokens.css';

type Tab = TabKey;

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  // Home's "Meet the Guides" shortcut needs to land ON the guides, not just
  // on the Experiences tab's top (tours + gift card come first there) —
  // one-shot signal, cleared by ExperiencesScreen once it's scrolled there.
  const [experiencesScrollTarget, setExperiencesScrollTarget] = useState<'guides' | null>(null);
  const hasSeenWelcome = usePlacesStore((s) => s.hasSeenWelcome);
  const setHasSeenWelcome = usePlacesStore((s) => s.setHasSeenWelcome);

  if (!hasSeenWelcome) {
    return <WelcomeScreen onDone={setHasSeenWelcome} />;
  }

  function goToGuides() {
    setExperiencesScrollTarget('guides');
    setActiveTab('experiences');
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {activeTab === 'home' && <HomeScreen onNavigate={setActiveTab} onMeetGuides={goToGuides} />}
        {activeTab === 'rome' && <MapScreen />}
        {activeTab === 'experiences' && (
          <ExperiencesScreen
            scrollTarget={experiencesScrollTarget}
            onScrollTargetHandled={() => setExperiencesScrollTarget(null)}
          />
        )}
        {activeTab === 'saved' && <MyRomeScreen onNavigate={setActiveTab} />}
      </div>

      <TabBar activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default App;
