// Roman Guides Companion — Home screen static config
// Link e azioni rapide che cambiano raramente — navigazione/config, non
// contenuto editoriale.

export interface LocalTip {
  label: string;
  emoji: string;
  action: { type: 'external'; url: string } | { type: 'tab'; tab: 'map' | 'explore' };
}

export const LOCAL_TIPS: LocalTip[] = [
  { label: 'Eat & Drink', emoji: '🍝', action: { type: 'tab', tab: 'map' } },
  { label: 'Hidden Gems', emoji: '🏛️', action: { type: 'tab', tab: 'explore' } },
  {
    label: 'Water Fountains',
    emoji: '🚰',
    action: { type: 'external', url: 'https://www.google.com/maps/search/drinking+water+fountain+near+me/' },
  },
  {
    label: 'Public Toilets',
    emoji: '🚻',
    action: { type: 'external', url: 'https://www.google.com/maps/search/public+toilet+near+me/' },
  },
  {
    label: 'Shopping',
    emoji: '🛍️',
    action: { type: 'external', url: 'https://www.google.com/maps/search/shopping+near+me/' },
  },
  {
    // Ask a Guide -> Ask Roman Guides (stesso collegamento WhatsApp, solo etichetta cambiata)
    label: 'Ask Roman Guides',
    emoji: '💬',
    action: { type: 'external', url: 'https://wa.me/393516260186?text=Hi!%20I%27m%20using%20the%20Roman%20Guides%20app%20and%20have%20a%20question.' },
  },
];

export interface GetAroundOption {
  label: string;
  emoji: string;
  url: string;
}

// Semplificato su richiesta: solo Uber, FREE NOW, Metro Map — MyCicero rimosso.
export const GET_AROUND_OPTIONS: GetAroundOption[] = [
  { label: 'Uber', emoji: '🚗', url: 'https://m.uber.com/ul/?action=setPickup&pickup=my_location' },
  { label: 'FREE NOW', emoji: '🚕', url: 'https://www.free-now.com/it/' },
  { label: 'Metro Map', emoji: '🚇', url: 'https://www.atac.roma.it/en/routes-maps/metro-network' },
];
