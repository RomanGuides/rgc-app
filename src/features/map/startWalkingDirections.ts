// Roman Guides Companion — startWalkingDirections
// Funzione condivisa, usata sia da PremiumPlaceCard che da UtilityPlaceCard:
// avvia un percorso pedonale in-app verso il luogo selezionato. Un solo
// posto che sa come farlo — le due card non duplicano questa logica.

import type { Place } from '../../data/types';
import { usePlacesStore } from '../../store/usePlacesStore';
import { fetchWalkingRoute } from '../../services/routingService';

export async function startWalkingDirections(destination: Place): Promise<void> {
  const { userLocation, setActiveRoute, selectPlace } = usePlacesStore.getState();

  if (!userLocation) {
    // Senza una posizione nota non possiamo calcolare un percorso — l'utente
    // va guidato ad attivarla dal bottone "Use my location" nella barra.
    window.alert('Please enable "Use my location" first, so we can calculate your route.');
    return;
  }

  try {
    const route = await fetchWalkingRoute(userLocation, { lat: destination.lat, lng: destination.lng });
    setActiveRoute({
      destinationId: destination.id,
      destinationName: destination.name,
      coordinates: route.coordinates,
      originalDistanceMeters: route.distanceMeters,
      originalDurationSeconds: route.durationSeconds,
      remainingDistanceMeters: route.distanceMeters,
      remainingDurationSeconds: route.durationSeconds,
    });
    selectPlace(null); // chiude il popup, la mappa diventa protagonista
  } catch (err) {
    window.alert('Could not calculate a walking route right now. Please try again.');
    console.error('startWalkingDirections failed:', err);
  }
}
