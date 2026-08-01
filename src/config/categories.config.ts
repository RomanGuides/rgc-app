// Roman Guides Companion — Category configuration
// Un solo posto per colori/emoji/tier per categoria.
//
// "tier" decide quale popup mostrare sulla mappa (Concierge Map, sprint
// dedicato): 'premium' = scheda curata con foto (Colosseo, Pantheon...),
// 'utility' = popup compatto senza foto (ristoranti, bar...). Aggiungere
// in futuro una nuova categoria utility (farmacie, fermate bus) richiede
// solo una riga qui — nessun altro file da toccare.

import type { PlaceCategory } from '../data/types';

export interface CategoryMeta {
  label: string;
  emoji: string;
  color: string;
  tier: 'premium' | 'utility';
}

export const CATEGORY_META: Record<PlaceCategory, CategoryMeta> = {
  restaurant: { label: 'Restaurants', emoji: '🍝', color: '#ff0033', tier: 'utility' },
  pasta: { label: 'Pasta', emoji: '🍝', color: '#ff0033', tier: 'utility' },
  pizza: { label: 'Pizza', emoji: '🍕', color: '#e0862a', tier: 'utility' },
  gelato: { label: 'Gelato', emoji: '🍨', color: '#3aa0c8', tier: 'utility' },
  rooftop_bar: { label: 'Rooftop Bars', emoji: '🌇', color: '#c2519b', tier: 'utility' },
  cocktail_bar: { label: 'Cocktail Bars', emoji: '🍸', color: '#7a4fc2', tier: 'utility' },
  gallery: { label: 'Visit on Your Own', emoji: '🏛️', color: '#4d7a4d', tier: 'premium' },
};

export const DEFAULT_CATEGORY_META: CategoryMeta = {
  label: 'Other',
  emoji: '📍',
  color: '#ff0033',
  tier: 'utility',
};

export function getCategoryMeta(category: string): CategoryMeta {
  return (CATEGORY_META as Record<string, CategoryMeta>)[category] || DEFAULT_CATEGORY_META;
}
