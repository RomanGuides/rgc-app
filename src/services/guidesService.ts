// Roman Guides Companion — Guides data service
// Stesso pattern di placesService.ts — isola la fonte dei dati dal resto dell'app.

import type { Guide } from '../data/types';
import guidesData from '../data/guides.json';

export function getGuides(): Guide[] {
  return guidesData as Guide[];
}
