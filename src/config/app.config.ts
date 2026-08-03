// Roman Guides Companion — App-wide configuration
// Porting diretto da roman-guides-map-spike-v6.html.

// [lng, lat] — MapLibre vuole le coordinate in quest'ordine
export const ROME_CENTER: [number, number] = [12.4964, 41.9028];

export const DEFAULT_MAP_ZOOM = 13.2;

// Punto di riferimento usato quando la geolocalizzazione viene negata o non è disponibile
export const DEFAULT_ME = {
  lat: 41.9009,
  lng: 12.4833,
  label: 'Trevi Fountain (default reference point)',
};

// Soglie di dimensione cluster (validate nello Spike)
export const CLUSTER_MAX_ZOOM = 15;
export const CLUSTER_RADIUS = 50;

export const CLUSTER_COLOR_STEPS = {
  small: '#ff6b85', // < 10 luoghi
  medium: '#ff0033', // 10-29 luoghi
  large: '#cc0029', // 30+ luoghi
};

export const SAVE_STORAGE_KEY = 'rgc_saved_places';
