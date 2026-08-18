// Roman Guides Companion — Routing service (OpenRouteService)
// Un solo posto che parla con l'API esterna — se in futuro si cambiasse
// provider (es. auto-hosting Valhalla), è questo l'unico file da riscrivere.

import { ORS_WALKING_URL } from '../config/routing.config';

export interface WalkingRoute {
  coordinates: [number, number][]; // [lng, lat], ordine GeoJSON
  distanceMeters: number;
  durationSeconds: number;
}

export async function fetchWalkingRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<WalkingRoute> {
  if (!ORS_WALKING_URL) {
    throw new Error('VITE_ORS_PROXY_URL non impostata — vedi .env.example');
  }

  // Niente più Authorization qui: la chiave ORS reale vive lato server,
  // dentro netlify/functions/route.ts, non nel client. Stesso corpo di
  // richiesta di prima, solo indirizzato alla nostra funzione invece che a
  // ORS direttamente.
  const response = await fetch(ORS_WALKING_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coordinates: [
        [from.lng, from.lat],
        [to.lng, to.lat],
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouteService ha risposto ${response.status}`);
  }

  const data = await response.json();
  const feature = data.features?.[0];
  if (!feature) {
    throw new Error('Nessun percorso trovato');
  }

  return {
    coordinates: feature.geometry.coordinates,
    distanceMeters: feature.properties.summary.distance,
    durationSeconds: feature.properties.summary.duration,
  };
}
