// Roman Guides Companion — Home screen static config
// Link e azioni rapide che cambiano raramente — navigazione/config, non
// contenuto editoriale. Icone come chiavi verso il registro condiviso in
// design-system/components/Icons.tsx, non più emoji.

import type { IconKey } from '../../design-system/components/Icons';

export interface LocalTip {
  label: string;
  icon: IconKey;
  action: { type: 'external'; url: string } | { type: 'tab'; tab: 'map' | 'explore' };
}

export const LOCAL_TIPS: LocalTip[] = [
  { label: 'Eat & Drink nearby', icon: 'fork', action: { type: 'tab', tab: 'map' } },
  { label: 'Hidden gems', icon: 'landmark', action: { type: 'tab', tab: 'explore' } },
  {
    label: 'Water fountains',
    icon: 'droplet',
    action: { type: 'external', url: 'https://www.google.com/maps/search/drinking+water+fountain+near+me/' },
  },
  {
    label: 'Public toilets',
    icon: 'toilet',
    action: { type: 'external', url: 'https://www.google.com/maps/search/public+toilet+near+me/' },
  },
  {
    label: 'Shopping',
    icon: 'shopping',
    action: { type: 'external', url: 'https://www.google.com/maps/search/shopping+near+me/' },
  },
];

export interface GetAroundOption {
  label: string;
  icon: IconKey;
  url: string;
}

// Semplificato su richiesta: solo Uber, FREE NOW, Metro Map — MyCicero rimosso.
export const GET_AROUND_OPTIONS: GetAroundOption[] = [
  { label: 'Uber', icon: 'car', url: 'https://m.uber.com/ul/?action=setPickup&pickup=my_location' },
  { label: 'FREE NOW', icon: 'car', url: 'https://www.free-now.com/it/' },
  { label: 'Metro Map', icon: 'train', url: 'https://www.atac.roma.it/en/routes-maps/metro-network' },
];
