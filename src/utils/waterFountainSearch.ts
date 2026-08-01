// Roman Guides Companion — Water fountain search link builder
//
// Non un'integrazione dentro la nostra mappa (niente chiave API, niente
// fatturazione Google Cloud) — un link diretto alla ricerca di Google Maps.
// Se conosciamo la posizione dell'utente, la includiamo nell'URL (stesso
// formato "@lat,lng,zoom" che Google Maps usa quando cerchi tu stesso da
// browser); altrimenti Google userà la geolocalizzazione del dispositivo
// nella scheda che si apre.

export interface LatLng {
  lat: number;
  lng: number;
}

export function buildWaterFountainSearchUrl(userLocation?: LatLng | null): string {
  const base = 'https://www.google.com/maps/search/drinking+water+fountain+near+me/';
  if (userLocation) {
    return `${base}@${userLocation.lat},${userLocation.lng},16z`;
  }
  return base;
}
