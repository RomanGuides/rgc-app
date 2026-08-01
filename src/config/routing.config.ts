// Roman Guides Companion — OpenRouteService configuration
// Chiave via variabile d'ambiente, mai nel codice — stesso principio già
// usato per altre chiavi API in questo progetto.

export const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY as string | undefined;
export const ORS_WALKING_URL = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';

// Velocità media a piedi, usata per stimare il tempo residuo senza richiamare
// l'API a ogni aggiornamento di posizione (solo la prima richiesta usa la
// stima reale di ORS — dopo si ricalcola localmente, in linea retta).
export const AVERAGE_WALKING_SPEED_MPS = 1.35; // ~4.9 km/h

// Entro questa distanza dalla destinazione, il percorso si considera concluso.
export const ARRIVAL_THRESHOLD_METERS = 25;
