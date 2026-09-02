// Roman Guides Companion — App
// Tab bar a 4 sezioni (Home, Rome, Experiences, Saved). Home aggiunta il
// 2026-08-16 — non una marcia indietro cieca sul taglio 5→3 di questo stesso
// redesign, ma un'eccezione motivata: biglietto da visita + scorciatoie di
// navigazione, non un duplicato dei contenuti di Rome/Experiences (vedi
// HomeScreen.tsx). Stato locale per la tab attiva — nessuna libreria di
// routing necessaria per un'app a poche tab senza URL profonde (Architettura
// v2, sezione 6).

import { useEffect, useRef, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import type { TourType } from './data/types';
import { HomeScreen } from './features/home/HomeScreen';
import { MapScreen } from './features/map/MapScreen';
import { ExperiencesScreen } from './features/experiences/ExperiencesScreen';
import { GuidesScreen } from './features/guides/GuidesScreen';
import { MyRomeScreen } from './features/myrome/MyRomeScreen';
import { WelcomeScreen } from './features/welcome/WelcomeScreen';
import { TabBar, type TabKey } from './design-system/components/TabBar';
import { usePlacesStore } from './store/usePlacesStore';
import { popTopBackHandler } from './hooks/useAndroidBackHandler';
import './design-system/tokens.css';

type Tab = TabKey;

// Tempo massimo tra due pressioni di indietro perché la seconda conti come
// conferma di uscita — troppo generoso e un tocco perso ore dopo sembra un
// bug, troppo stretto e nessuno riesce a farlo in tempo.
const EXIT_CONFIRM_WINDOW_MS = 2000;

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  // Home's "Meet the Guides" shortcut and category pills (Classic Tours/
  // Experiences/...) need to land ON their own section, not just on the
  // Experiences tab's top — one-shot signal, cleared by ExperiencesScreen
  // once it's scrolled there.
  const [experiencesScrollTarget, setExperiencesScrollTarget] = useState<TourType | null>(null);
  const hasSeenWelcome = usePlacesStore((s) => s.hasSeenWelcome);
  const setHasSeenWelcome = usePlacesStore((s) => s.setHasSeenWelcome);

  // Il tasto indietro fisico Android, un solo posto per tutta l'app — prima
  // (2026-08-18) solo BookingWidgetModal lo intercettava, ogni altra
  // schermata a schermo intero (dettaglio tour/luogo/guida, ricerca, legale)
  // lasciava il comportamento di default di Capacitor, che senza uno storico
  // di navigazione reale (nessun router, vedi sopra) chiude l'app anche
  // quando c'è ovviamente "qualcosa da chiudere" prima — bug reale confermato
  // su device. Tre livelli, in ordine: (1) una schermata in useAndroidBackHandler.ts
  // consuma la pressione se ce n'è una aperta; (2) altrimenti, se non si è
  // già sulla tab Home, si torna lì; (3) altrimenti (già su Home, niente
  // aperto) una seconda pressione entro EXIT_CONFIRM_WINDOW_MS esce
  // davvero — non la prima pressione isolata.
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const lastBackPressRef = useRef(0);

  useEffect(() => {
    let handle: { remove: () => void } | undefined;
    CapacitorApp.addListener('backButton', () => {
      if (popTopBackHandler()) return;
      if (activeTabRef.current !== 'home') {
        setActiveTab('home');
        return;
      }
      const now = Date.now();
      if (now - lastBackPressRef.current < EXIT_CONFIRM_WINDOW_MS) {
        CapacitorApp.exitApp();
      } else {
        lastBackPressRef.current = now;
      }
    }).then((h) => {
      handle = h;
    });
    return () => handle?.remove();
  }, []);

  if (!hasSeenWelcome) {
    return <WelcomeScreen onDone={setHasSeenWelcome} />;
  }

  function goToExperiencesSection(target: TourType) {
    setExperiencesScrollTarget(target);
    setActiveTab('experiences');
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {activeTab === 'home' && <HomeScreen onNavigate={setActiveTab} onNavigateToSection={goToExperiencesSection} />}
        {activeTab === 'rome' && <MapScreen />}
        {activeTab === 'experiences' && (
          <ExperiencesScreen
            scrollTarget={experiencesScrollTarget}
            onScrollTargetHandled={() => setExperiencesScrollTarget(null)}
          />
        )}
        {activeTab === 'guides' && <GuidesScreen />}
        {activeTab === 'saved' && <MyRomeScreen onNavigate={setActiveTab} />}
      </div>

      <TabBar activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default App;
