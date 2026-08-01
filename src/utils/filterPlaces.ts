// Roman Guides Companion — Place filtering logic
// Estratta come funzione pura (Architettura v2, sezione 4) — non vive nello
// store, così è testabile da sola e non nasconde logica di business dentro
// le azioni Zustand.

import type { Place } from '../data/types';
import { distMeters } from './distance';

export interface FilterOptions {
  activeCategories: Set<string>;
  radius: number; // 0 = nessun filtro raggio (Tutta Roma)
  userLocation: { lat: number; lng: number } | null;
}

export function filterPlaces(places: Place[], options: FilterOptions): Place[] {
  const { activeCategories, radius, userLocation } = options;

  let visible = places.filter((p) => activeCategories.has(p.category));

  if (radius > 0 && userLocation) {
    visible = visible.filter(
      (p) => distMeters(userLocation.lat, userLocation.lng, p.lat, p.lng) <= radius
    );
  }

  return visible;
}
