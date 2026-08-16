// Roman Guides Companion — MapScreen (tab "Rome")
//
// La mappa a tutto schermo con RomeSheet sopra (redesign v1, Fase 3).
// Sostituisce la vecchia barra nera, AroundMeBar (raggio) e CategoryFilterBar
// — la logica di geolocalizzazione/tracciamento vive ora qui, un solo posto
// invece che sparsa nei componenti UI rimossi.

import { useEffect, useRef, useState } from 'react';
import { MapView } from './MapView';
import { RomeSheet, type Detent } from './RomeSheet';
import { LocateButton } from './LocateButton';
import { SearchScreen } from './SearchScreen';
import { PlaceScreen, PLACE_SCREEN_TRANSITION_MS } from './PlaceScreen';
import { LegalScreen } from '../legal/LegalScreen';
import { DirectionsBar } from './DirectionsBar';
import { ArrivalToast } from './ArrivalToast';
import { OfflineBanner } from './OfflineBanner';
import { useRouteTracking } from './useRouteTracking';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { usePlacesStore } from '../../store/usePlacesStore';
import { filterPlaces } from '../../utils/filterPlaces';

export function MapScreen() {
  const places = usePlacesStore((s) => s.places);
  const activeCategories = usePlacesStore((s) => s.activeCategories);
  const userLocation = usePlacesStore((s) => s.userLocation);
  const setUserLocation = usePlacesStore((s) => s.setUserLocation);
  const loadPlaces = usePlacesStore((s) => s.loadPlaces);
  const selectPlace = usePlacesStore((s) => s.selectPlace);
  const activeRoute = usePlacesStore((s) => s.activeRoute);
  const selectedPlaceForCentering = usePlacesStore((s) => s.selectedPlace);
  const locateMeSignal = usePlacesStore((s) => s.locateMeSignal);
  const bumpLocateMeSignal = usePlacesStore((s) => s.bumpLocateMeSignal);
  const setMapBounds = usePlacesStore((s) => s.setMapBounds);
  const [searchOpen, setSearchOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [sheetDetent, setSheetDetent] = useState<Detent>('resting');
  // Solo per sessione, non persistito: vedi handleLocateMe sotto.
  const [locationPrimed, setLocationPrimed] = useState(false);

  // PlaceScreen ora si anima in chiusura (PLACE_SCREEN_TRANSITION_MS) invece
  // di sparire di scatto — ma lo store azzera selectedPlace (dal bottone
  // indietro di PlaceScreen, o da startWalkingDirections.ts quando un
  // percorso parte) prima che l'animazione possa partire. Questo stato
  // locale tiene il componente montato con l'ultimo luogo noto per la durata
  // dell'animazione, passandogli closing=true, invece di affidarsi al valore
  // dello store (già null a quel punto) per decidere cosa mostrare.
  const [placeScreenPlace, setPlaceScreenPlace] = useState(selectedPlaceForCentering);
  const [placeScreenClosing, setPlaceScreenClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (selectedPlaceForCentering) {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setPlaceScreenClosing(false);
      setPlaceScreenPlace(selectedPlaceForCentering);
    } else if (placeScreenPlace) {
      setPlaceScreenClosing(true);
      closeTimerRef.current = window.setTimeout(() => {
        setPlaceScreenPlace(null);
        setPlaceScreenClosing(false);
        closeTimerRef.current = null;
      }, PLACE_SCREEN_TRANSITION_MS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlaceForCentering]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const { location, status, requestLocation, startWatching, stopWatching } = useGeolocation();
  const isOnline = useOnlineStatus();

  useRouteTracking();

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  // Se il permesso di posizione è già stato deciso (concesso o negato — da
  // WelcomeScreen, o da una sessione precedente), popola subito "Nearest to
  // you"/l'elenco per zona senza aspettare un tap sulla bussola. Se invece è
  // ancora "prompt" (indeciso — l'utente ha toccato "Not now"), non si
  // richiede nulla qui: altrimenti si romperebbe la promessa di "Not now",
  // mostrando un dialogo di sistema non richiesto. navigator.permissions non
  // è garantito ovunque — se manca o fallisce, nessuna richiesta automatica,
  // stesso comportamento di sempre (solo su tap esplicito della bussola).
  useEffect(() => {
    if (!navigator.permissions?.query) return;
    let cancelled = false;
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        if (!cancelled && result.state !== 'prompt') requestLocation();
      })
      .catch(() => {
        /* Permissions API non supportata per 'geolocation' in questo browser/WebView — nessuna richiesta automatica */
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aggiorna lo store ad ogni risoluzione di posizione (una tantum o durante
  // il tracciamento) — stessa logica che viveva in AroundMeBar.
  useEffect(() => {
    if (location) setUserLocation(location);
  }, [location, setUserLocation]);

  // Tracciamento continuo SOLO mentre un percorso è attivo (batteria).
  //
  // Dipende da activeRoute?.destinationId, non dall'intero oggetto
  // activeRoute — updateRouteProgress (in useRouteTracking.ts) crea un nuovo
  // oggetto activeRoute ad ogni aggiornamento di posizione mentre un percorso
  // è attivo. Con l'intero oggetto come dipendenza, questo effect si
  // ri-eseguiva (stopWatching + startWatching) ad ogni singolo tick GPS,
  // registrando una nuova watchPosition con l'OS in un loop stretto —
  // riscontrato su dispositivo reale come freeze immediato dell'app appena
  // avviata una route (i log di sistema mostravano una nuova registrazione
  // GPS ogni ~15-20ms). Stessa causa e stesso fix già applicati
  // all'effect della route-line in MapView.tsx.
  useEffect(() => {
    if (activeRoute) {
      startWatching();
    } else {
      stopWatching();
    }
    return () => stopWatching();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoute?.destinationId, startWatching, stopWatching]);

  // Se l'utente ha detto "Not now" a Welcome, il permesso resta "prompt"
  // (indeciso) — il PRIMO tap sulla bussola in questo caso non chiama subito
  // il dialogo di sistema a freddo una seconda volta: mostra prima una riga
  // di spiegazione (vedi il testo sotto LocateButton), poi il tap
  // SUCCESSIVO lo innesca davvero. Se il permesso è già deciso (concesso o
  // negato) non c'è alcun dialogo da proteggere — comportamento invariato,
  // richiesta immediata come sempre. Solo per sessione corrente (non
  // persistito): a un riavvio dell'app, se ancora indeciso, si rispiega.
  async function handleLocateMe() {
    if (!locationPrimed && navigator.permissions?.query) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        if (result.state === 'prompt') {
          setLocationPrimed(true);
          return;
        }
      } catch {
        /* Permissions API non supportata per 'geolocation' — richiesta diretta, comportamento di sempre */
      }
    }
    requestLocation();
    bumpLocateMeSignal();
  }

  const visiblePlaces = filterPlaces(places, { activeCategories });

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView
          places={visiblePlaces}
          onSelectPlace={selectPlace}
          userLocation={userLocation}
          activeRoute={activeRoute}
          // placeScreenPlace, non lo store grezzo: resta valorizzato per
          // tutta l'animazione di chiusura di PlaceScreen, così il marker
          // selezionato si "spegne" insieme allo schermo invece di scattare
          // a spento nell'istante in cui si tocca indietro.
          selectedPlace={placeScreenPlace}
          locateMeSignal={locateMeSignal}
          onBoundsChange={setMapBounds}
        />
        <LocateButton status={status} onClick={handleLocateMe} hidden={sheetDetent === 'full'} />
        {locationPrimed && status === 'idle' && sheetDetent !== 'full' && (
          <div
            style={{
              position: 'absolute',
              // Sotto il bottone, non sopra: a top: safe+62px con un testo
              // di due righe non c'è abbastanza margine verticale prima
              // della status bar per stare sopra senza sovrapporlo — e un
              // overlay che intercetta i tap sul bottone stesso sarebbe
              // un bug peggiore del posizionamento non conforme alla spec.
              top: 'calc(env(safe-area-inset-top, 0px) + 62px + 44px + 8px)',
              right: 20,
              maxWidth: 190,
              zIndex: 6,
              pointerEvents: 'none',
              background: '#1A1614',
              color: '#FFFFFF',
              fontSize: '0.8125rem',
              lineHeight: 1.4,
              borderRadius: 12,
              padding: '9px 12px',
              textAlign: 'right',
            }}
          >
            Turn on location to sort by how far away things are.
          </div>
        )}
        <DirectionsBar />
        <ArrivalToast />
        {!isOnline && <OfflineBanner />}
        {!selectedPlaceForCentering && (
          <RomeSheet
            onOpenSearch={() => setSearchOpen(true)}
            locationStatus={status}
            forceFullDetent={!isOnline}
            onDetentChange={setSheetDetent}
            onOpenLegal={() => setLegalOpen(true)}
          />
        )}
      </div>
      {placeScreenPlace && <PlaceScreen place={placeScreenPlace} closing={placeScreenClosing} />}
      {searchOpen && <SearchScreen onClose={() => setSearchOpen(false)} />}
      {legalOpen && <LegalScreen onClose={() => setLegalOpen(false)} />}
    </div>
  );
}
