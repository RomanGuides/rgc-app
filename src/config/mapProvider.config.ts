// Roman Guides Companion — Map provider configuration
//
// Policy (decisa dal team): nessun impegno con un provider commerciale prima
// di avere dati di utilizzo reali. Durante sviluppo e beta privata si usa un
// provider di tile gratuito. Cambiare provider = cambiare questo file, mai la
// logica di inizializzazione della mappa altrove nel codice.
//
// Porting diretto da roman-guides-map-spike-v6.html, invariato.

export type MapProviderKey = 'osm' | 'maptiler' | 'mapbox';

export const MAP_PROVIDER: MapProviderKey = 'osm';

export const MAP_PROVIDERS: Record<MapProviderKey, { buildStyle: (apiKey?: string) => any }> = {
  osm: {
    // Provider gratuito — usato in sviluppo e beta privata.
    // I termini d'uso sono pensati per traffico leggero/non commerciale —
    // NON adatto al lancio pubblico su larga scala senza rivalutazione.
    buildStyle: () => ({
      version: 8,
      sources: {
        tiles: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors',
        },
      },
      layers: [{ id: 'tiles', type: 'raster', source: 'tiles' }],
    }),
  },
  maptiler: {
    // Opzione commerciale — richiede MAPTILER_API_KEY. Non attiva finché la
    // revisione post-lancio non decide di passare a questo provider.
    buildStyle: (apiKey?: string) =>
      `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
  },
  mapbox: {
    // Opzione commerciale — richiede MAPBOX_ACCESS_TOKEN.
    buildStyle: () => 'mapbox://styles/mapbox/streets-v12',
  },
};

export function buildMapStyle(): any {
  return MAP_PROVIDERS[MAP_PROVIDER].buildStyle();
}
