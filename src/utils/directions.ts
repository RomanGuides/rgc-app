// Roman Guides Companion — Directions URL builder
//
// Google Maps ha due formati di URL diversi: "search" (mostra solo il pin,
// quello già usato per googleMapsUrl) e "dir" (indicazioni stradali vere,
// da un punto A a un punto B). Se conosciamo la posizione dell'utente, la
// includiamo come origine — un tap, cammino a piedi già impostato.

export interface LatLng {
  lat: number;
  lng: number;
}

export function buildDirectionsUrl(destination: LatLng, origin?: LatLng | null): string {
  const params = new URLSearchParams({
    api: '1',
    destination: `${destination.lat},${destination.lng}`,
    travelmode: 'walking', // Roma centro storico — a piedi è quasi sempre la modalità giusta
  });
  if (origin) {
    params.set('origin', `${origin.lat},${origin.lng}`);
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
