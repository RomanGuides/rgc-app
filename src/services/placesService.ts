// Roman Guides Companion — Places data service
//
// Unico punto dell'app che sa DA DOVE arrivano i luoghi. Oggi legge
// places.json (generato da export_places.py a partire dal Google Sheet).
// Quando in futuro si passerà a un CMS, cambia solo questo file — lo store
// e i componenti continuano a chiamare getPlaces() senza saperlo.

import type { Place } from '../data/types';
import placesData from '../data/places.json';

export function getPlaces(): Place[] {
  return placesData as Place[];
}
