// Roman Guides Companion — MapScreen (tab "Rome")
//
// La mappa a tutto schermo con RomeSheet sopra (redesign v1, Fase 3).
// Sostituisce la vecchia barra nera, AroundMeBar (raggio) e CategoryFilterBar
// — la logica di geolocalizzazione/tracciamento vive ora qui, un solo posto
// invece che sparsa nei componenti UI rimossi.

import { useEffect, useState } from 'react';
import { MapView } from './MapView';
import { RomeSheet } from './RomeSheet';
import { LocateButton } from './LocateButton';
import { SearchScreen } from './SearchScreen';
import { PlaceScreen } from './PlaceScreen';
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

  const { location, status, requestLocation, startWatching, stopWatching } = useGeolocation();
  const isOnline = useOnlineStatus();

  useRouteTracking();

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

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

  function handleLocateMe() {
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
          selectedPlace={selectedPlaceForCentering}
          locateMeSignal={locateMeSignal}
          onBoundsChange={setMapBounds}
        />
        <LocateButton status={status} onClick={handleLocateMe} />
        <DirectionsBar />
        <ArrivalToast />
        {!isOnline && <OfflineBanner />}
        {!selectedPlaceForCentering && (
          <RomeSheet onOpenSearch={() => setSearchOpen(true)} locationStatus={status} forceFullDetent={!isOnline} />
        )}
      </div>
      {selectedPlaceForCentering && <PlaceScreen place={selectedPlaceForCentering} />}
      {searchOpen && <SearchScreen onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
