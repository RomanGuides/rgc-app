// Roman Guides Companion — Place filtering logic
// Estratta come funzione pura (Architettura v2, sezione 4) — non vive nello
// store, così è testabile da sola e non nasconde logica di business dentro
// le azioni Zustand.
//
// Il filtro per raggio ("Around Me") è stato rimosso nel redesign v1 (Fase 3):
// l'ordinamento è sempre per distanza a piedi, senza controllo utente — resta
// solo il filtro per categoria.

import type { Place } from '../data/types';

export interface FilterOptions {
  activeCategories: Set<string>;
}

export function filterPlaces(places: Place[], options: FilterOptions): Place[] {
  return places.filter((p) => options.activeCategories.has(p.category));
}
