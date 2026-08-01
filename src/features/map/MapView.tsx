// Roman Guides Companion — MapView
//
// Porting diretto della logica validata in roman-guides-map-spike-v6.html:
// clustering nativo MapLibre per i gruppi + marker HTML (goccia + emoji per
// categoria) per i punti singoli. Il bug delle icone perse durante il
// clustering (risolto nello Spike v6) è già incorporato qui.

import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// Causa radice trovata: maplibre-gl-worker.mjs importa a sua volta
// ./maplibre-gl-shared.mjs con un percorso relativo. L'import Vite "?url"
// tratta il worker come asset statico opaco e NON include automaticamente
// questa sua dipendenza interna — stesso problema, sotto un'altra forma.
// Fix: entrambi i file sono copiati in public/ (percorso stabile, identico
// in dev e produzione, con la stessa relazione relativa tra i due file),
// e l'URL del worker è indicato esplicitamente all'avvio dell'app.
import type { Place } from '../../data/types';
import type { ActiveRoute } from '../../store/usePlacesStore';
import { buildMapStyle } from '../../config/mapProvider.config';
import { ROME_CENTER, DEFAULT_MAP_ZOOM, CLUSTER_MAX_ZOOM, CLUSTER_RADIUS } from '../../config/app.config';
import { getCategoryMeta } from '../../config/categories.config';
import { markStart, markEnd } from '../../utils/performance';

maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');

interface MapViewProps {
  places: Place[]; // già filtrati (categoria/raggio) da chi usa questo componente
  onSelectPlace: (place: Place) => void;
  userLocation?: { lat: number; lng: number } | null; // marker verde "la mia posizione" — validato nello Spike, mancante nel primo porting React
  activeRoute?: ActiveRoute | null; // Concierge Map: percorso pedonale attivo, se presente
  selectedPlace?: Place | null; // per centrare la mappa quando la selezione arriva da fuori (es. Explore)
  locateMeSignal?: number; // incrementato ad ogni pressione esplicita di "Use my location" — fa volare la mappa lì
}

function placesToGeoJSON(places: Place[]) {
  return {
    type: 'FeatureCollection' as const,
    features: places.map((p) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
      properties: { id: p.id },
    })),
  };
}

export function MapView({ places, onSelectPlace, userLocation, activeRoute, selectedPlace, locateMeSignal }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const domMarkersRef = useRef<Record<string, maplibregl.Marker>>({});
  const meMarkerRef = useRef<maplibregl.Marker | null>(null);
  const placeByIdRef = useRef<Record<string, Place>>({});
  const onSelectPlaceRef = useRef(onSelectPlace);
  onSelectPlaceRef.current = onSelectPlace;
  // Always-current ref for places — the map-init effect below runs only once
  // (empty deps), so it must NOT read `places` directly from its closure
  // (that would stay stuck at whatever it was on the very first render,
  // typically an empty array before the store finishes loading). Reading
  // from this ref instead avoids that stale-closure bug.
  const placesRef = useRef<Place[]>(places);
  placesRef.current = places;

  // Inizializzazione mappa — una sola volta
  useEffect(() => {
    if (!containerRef.current) return;
    markStart('map_init');

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildMapStyle(),
      center: ROME_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    function syncIndividualMarkers() {
      markStart('marker_sync');
      const source = map.getSource('places') as maplibregl.GeoJSONSource | undefined;
      if (!source) {
        markEnd('marker_sync', { skipped: 'source not ready' });
        return;
      }
      const leaves = map.querySourceFeatures('places', {
        filter: ['!', ['has', 'point_count']],
      });
      const neededIds = new Set(leaves.map((f) => f.properties?.id as string));

      Object.keys(domMarkersRef.current).forEach((id) => {
        if (!neededIds.has(id)) {
          domMarkersRef.current[id].remove();
          delete domMarkersRef.current[id];
        }
      });

      leaves.forEach((f) => {
        const id = f.properties?.id as string;
        if (domMarkersRef.current[id]) return;
        const p = placeByIdRef.current[id];
        if (!p) return;
        const meta = getCategoryMeta(p.category);
        const el = document.createElement('div');
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50% 50% 50% 0';
        el.style.transform = 'rotate(-45deg)';
        el.style.background = meta.color;
        el.style.border = '2px solid #fff';
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.35)';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.cursor = 'pointer';
        el.innerHTML = `<span style="transform:rotate(45deg);font-size:13px;">${meta.emoji}</span>`;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectPlaceRef.current(p);
        });
        const coords = f.geometry.type === 'Point' ? (f.geometry.coordinates as [number, number]) : null;
        if (!coords) return;
        domMarkersRef.current[id] = new maplibregl.Marker({ element: el }).setLngLat(coords).addTo(map);
      });
      markEnd('marker_sync', { markerCount: leaves.length });
    }

    function setupClusterLayers() {
      map.addSource('places', {
        type: 'geojson',
        data: placesToGeoJSON(placesRef.current) as any, // ref, not the closure-captured `places` prop
        cluster: true,
        clusterMaxZoom: CLUSTER_MAX_ZOOM,
        clusterRadius: CLUSTER_RADIUS,
      });

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'places',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#ff6b85', 10, '#ff0033', 30, '#cc0029'],
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 20, 30, 26],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties?.cluster_id;
        // maplibre-gl v6 ha cambiato questa funzione da callback a Promise
        // (versione precedente usata nello Spike: callback). Corretto qui.
        (map.getSource('places') as maplibregl.GeoJSONSource)
          .getClusterExpansionZoom(clusterId)
          .then((zoom) => {
            const coords = (features[0].geometry as any).coordinates;
            map.easeTo({ center: coords, zoom });
          })
          .catch(() => {
            /* cluster già espanso o id non più valido — nessuna azione necessaria */
          });
      });

      map.on('mouseenter', 'clusters', () => (map.getCanvas().style.cursor = 'pointer'));
      map.on('mouseleave', 'clusters', () => (map.getCanvas().style.cursor = ''));

      map.on('moveend', syncIndividualMarkers);
      map.on('zoomend', syncIndividualMarkers);
      map.on('sourcedata', (e) => {
        if (e.sourceId === 'places' && e.isSourceLoaded) syncIndividualMarkers();
      });

      // Concierge Map — sorgente/layer della linea di percorso, vuota finché
      // nessun percorso è attivo. Un solo layer, riutilizzato per ogni
      // percorso (cambiare destinazione aggiorna solo i dati, non ricrea nulla).
      map.addSource('active-route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'active-route-line',
        type: 'line',
        source: 'active-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#ff0033',
          'line-width': 5,
          'line-opacity': 0.85,
        },
      });
    }

    let layersReady = false;
    function ensureLayers() {
      if (layersReady) return;
      // Il fallback timer sotto può scattare prima che lo stile abbia
      // davvero finito di caricare (rete lenta, dev server) — chiamare
      // addSource() in quel momento lancia "Style is not done loading".
      // Se non è ancora pronto, ci si appoggia comunque all'evento 'load'
      // invece di forzare l'esecuzione.
      if (!map.isStyleLoaded()) {
        map.once('load', ensureLayers);
        return;
      }
      layersReady = true;
      setupClusterLayers();
      markEnd('map_init', { placesCount: placesRef.current.length });
    }
    map.on('load', ensureLayers);
    const fallbackTimer = setTimeout(ensureLayers, 800);

    return () => {
      clearTimeout(fallbackTimer);
      Object.values(domMarkersRef.current).forEach((m) => m.remove());
      domMarkersRef.current = {};
      meMarkerRef.current?.remove();
      meMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aggiorna la sorgente dati quando cambia l'elenco filtrato dei luoghi
  useEffect(() => {
    placeByIdRef.current = Object.fromEntries(places.map((p) => [p.id, p]));
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource('places') as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(placesToGeoJSON(places) as any);
    }
  }, [places]);

  // Marker verde "la mia posizione" — stessa forma a goccia dei luoghi, ma
  // colore verde e nessun'azione al click. Porting dallo Spike (placeMeMarker),
  // mancante nel primo porting React: solo i luoghi avevano il marker,
  // la posizione dell'utente no.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!userLocation) {
      meMarkerRef.current?.remove();
      meMarkerRef.current = null;
      return;
    }

    if (!meMarkerRef.current) {
      const el = document.createElement('div');
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50% 50% 50% 0';
      el.style.transform = 'rotate(-45deg)';
      el.style.background = 'var(--green, #006600)';
      el.style.border = '2px solid #fff';
      el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.35)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.innerHTML = '<span style="transform:rotate(45deg);font-size:13px;">📍</span>';
      meMarkerRef.current = new maplibregl.Marker({ element: el });
    }
    meMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]).addTo(map);
  }, [userLocation]);

  // "Use my location" premuto esplicitamente — vola sempre lì, anche se le
  // coordinate sono identiche alla richiesta precedente (locateMeSignal
  // cambia comunque, a differenza di userLocation che potrebbe non cambiare
  // valore). Non scatta per gli aggiornamenti silenziosi in background
  // durante un percorso attivo — vedi AroundMeBar.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation || !locateMeSignal) return;
    map.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: Math.max(map.getZoom(), 15),
      duration: 600,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locateMeSignal]);

  // Centra la mappa quando la selezione arriva da fuori la mappa stessa
  // (es. un tocco su una card in Explore) — altrimenti il popup si aprirebbe
  // su un luogo che potrebbe non essere nemmeno nell'inquadratura corrente.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPlace) return;
    map.flyTo({
      center: [selectedPlace.lng, selectedPlace.lat],
      zoom: Math.max(map.getZoom(), 16),
      duration: 600,
    });
  }, [selectedPlace]);

  // Concierge Map — percorso attivo: disegna la linea, centra la mappa sul
  // tragitto con margine, e attenua i marker che non sono la destinazione.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyMarkerOpacity = () => {
      Object.entries(domMarkersRef.current).forEach(([id, marker]) => {
        const el = marker.getElement();
        el.style.opacity = !activeRoute || id === activeRoute.destinationId ? '1' : '0.35';
        el.style.transition = 'opacity 0.2s ease';
      });
    };

    const source = map.getSource('active-route') as maplibregl.GeoJSONSource | undefined;

    if (!activeRoute) {
      source?.setData({ type: 'FeatureCollection', features: [] } as any);
      applyMarkerOpacity();
      return;
    }

    source?.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: activeRoute.coordinates },
          properties: {},
        },
      ],
    } as any);

    applyMarkerOpacity();

    const bounds = activeRoute.coordinates.reduce(
      (b, coord) => b.extend(coord as [number, number]),
      new maplibregl.LngLatBounds(activeRoute.coordinates[0], activeRoute.coordinates[0])
    );
    map.fitBounds(bounds, { padding: 70, duration: 500 });
    // Nuovi marker creati mentre il percorso è già attivo (es. dopo un pan)
    // devono nascere già con l'opacità corretta — da qui il listener in più.
    map.on('sourcedata', applyMarkerOpacity);
    return () => {
      map.off('sourcedata', applyMarkerOpacity);
    };
  }, [activeRoute]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
