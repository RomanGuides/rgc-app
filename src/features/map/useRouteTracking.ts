// Roman Guides Companion — useRouteTracking
// Mentre un percorso è attivo: ad ogni aggiornamento della posizione utente
// ricalcola distanza/tempo residui (in linea retta, nessuna nuova chiamata
// a OpenRouteService — solo la richiesta iniziale usa l'API) e rileva
// l'arrivo a destinazione. Un solo posto con questa logica, usato una
// volta sola in MapScreen.

import { useEffect, useRef } from 'react';
import { usePlacesStore } from '../../store/usePlacesStore';
import { distMeters } from '../../utils/distance';
import { AVERAGE_WALKING_SPEED_MPS, ARRIVAL_THRESHOLD_METERS } from '../../config/routing.config';

export function useRouteTracking() {
  const activeRoute = usePlacesStore((s) => s.activeRoute);
  const userLocation = usePlacesStore((s) => s.userLocation);
  const setActiveRoute = usePlacesStore((s) => s.setActiveRoute);
  const updateRouteProgress = usePlacesStore((s) => s.updateRouteProgress);
  const showArrivalMessage = usePlacesStore((s) => s.showArrivalMessage);
  const hideArrivalMessage = usePlacesStore((s) => s.hideArrivalMessage);
  const destinationRef = useRef<{ lat: number; lng: number } | null>(null);

  // Tiene la destinazione corrente in un ref, per non ricalcolare tutto se
  // cambia solo la posizione utente (che aggiorna spesso).
  useEffect(() => {
    if (!activeRoute) {
      destinationRef.current = null;
      return;
    }
    const lastCoord = activeRoute.coordinates[activeRoute.coordinates.length - 1];
    destinationRef.current = { lat: lastCoord[1], lng: lastCoord[0] };
  }, [activeRoute?.destinationId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeRoute || !userLocation || !destinationRef.current) return;

    const remaining = distMeters(userLocation.lat, userLocation.lng, destinationRef.current.lat, destinationRef.current.lng);

    if (remaining <= ARRIVAL_THRESHOLD_METERS) {
      setActiveRoute(null);
      showArrivalMessage();
      setTimeout(() => hideArrivalMessage(), 2000);
      return;
    }

    updateRouteProgress(remaining, remaining / AVERAGE_WALKING_SPEED_MPS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, activeRoute?.destinationId]);
}
