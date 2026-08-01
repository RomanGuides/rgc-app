// Roman Guides Companion — Collections data service
// Stesso pattern di placesService.ts.

import type { Collection } from '../data/types';
import collectionsData from '../data/collections.json';

export function getCollections(): Collection[] {
  return collectionsData as Collection[];
}
