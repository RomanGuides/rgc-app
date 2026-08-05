// Roman Guides Companion — App state store
//
// Solo stato applicativo (Architettura v2, sezione 4). La logica di filtro
// vive in utils/filterPlaces.ts, la fonte dei dati in services/placesService.ts.
// Questo store non "pensa" — legge, scrive, e basta.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Place, PlaceCategory } from '../data/types';
import { getPlaces } from '../services/placesService';
import { CATEGORY_META } from '../config/categories.config';
import { SAVE_STORAGE_KEY } from '../config/app.config';

export interface UserLocation {
  lat: number;
  lng: number;
  label?: string;
}

export interface ActiveRoute {
  destinationId: string;
  destinationName: string;
  coordinates: [number, number][]; // [lng, lat], GeoJSON
  originalDistanceMeters: number;
  originalDurationSeconds: number;
  // Distanza/tempo mostrati nella barra — aggiornati localmente man mano che
  // l'utente si muove, senza richiamare l'API ogni volta (vedi routingService).
  remainingDistanceMeters: number;
  remainingDurationSeconds: number;
}

interface PlacesStore {
  places: Place[];
  activeCategories: Set<PlaceCategory>;
  userLocation: UserLocation | null;
  selectedPlace: Place | null;
  savedPlaceIds: string[];
  // Nota personale libera per luogo ("suona il campanello a sinistra") —
  // solo locale, mai sincronizzata, per uso proprio dell'utente (redesign v1, Fase 4).
  arrivalNotes: Record<string, string>;
  activeRoute: ActiveRoute | null;
  arrivalMessageVisible: boolean;
  // Incrementato SOLO quando l'utente preme esplicitamente "Use my
  // location" — permette a MapView di centrare la visuale in quel momento
  // preciso, senza rifarlo ad ogni aggiornamento silenzioso di posizione
  // durante un percorso attivo (altrimenti la mappa "scatterebbe" mentre si cammina).
  locateMeSignal: number;

  loadPlaces: () => void;
  toggleCategory: (cat: PlaceCategory) => void;
  setUserLocation: (loc: UserLocation | null) => void;
  selectPlace: (p: Place | null) => void;
  toggleSaved: (id: string) => void;
  setArrivalNote: (placeId: string, note: string) => void;
  setActiveRoute: (route: ActiveRoute | null) => void;
  updateRouteProgress: (remainingDistanceMeters: number, remainingDurationSeconds: number) => void;
  showArrivalMessage: () => void;
  hideArrivalMessage: () => void;
  bumpLocateMeSignal: () => void;
}

export const usePlacesStore = create<PlacesStore>()(
  persist(
    (set) => ({
      places: [],
      activeCategories: new Set(Object.keys(CATEGORY_META) as PlaceCategory[]),
      userLocation: null,
      selectedPlace: null,
      savedPlaceIds: [],
      arrivalNotes: {},
      activeRoute: null,
      arrivalMessageVisible: false,
      locateMeSignal: 0,

      loadPlaces: () => set({ places: getPlaces() }),

      toggleCategory: (cat) =>
        set((state) => {
          const next = new Set(state.activeCategories);
          if (next.has(cat)) next.delete(cat);
          else next.add(cat);
          return { activeCategories: next };
        }),

      setUserLocation: (loc) => set({ userLocation: loc }),

      selectPlace: (p) => set({ selectedPlace: p }),

      toggleSaved: (id) =>
        set((state) => {
          const idx = state.savedPlaceIds.indexOf(id);
          const next =
            idx >= 0
              ? state.savedPlaceIds.filter((sid) => sid !== id)
              : [...state.savedPlaceIds, id];
          return { savedPlaceIds: next };
        }),

      setArrivalNote: (placeId, note) =>
        set((state) => ({ arrivalNotes: { ...state.arrivalNotes, [placeId]: note } })),

      setActiveRoute: (route) => set({ activeRoute: route }),

      updateRouteProgress: (remainingDistanceMeters, remainingDurationSeconds) =>
        set((state) =>
          state.activeRoute
            ? { activeRoute: { ...state.activeRoute, remainingDistanceMeters, remainingDurationSeconds } }
            : {}
        ),

      showArrivalMessage: () => set({ arrivalMessageVisible: true }),
      hideArrivalMessage: () => set({ arrivalMessageVisible: false }),
      bumpLocateMeSignal: () => set((state) => ({ locateMeSignal: state.locateMeSignal + 1 })),
    }),
    {
      name: SAVE_STORAGE_KEY,
      // Solo i luoghi salvati e le note d'arrivo sono persistiti — il resto è stato di sessione
      partialize: (state) => ({ savedPlaceIds: state.savedPlaceIds, arrivalNotes: state.arrivalNotes }),
    }
  )
);
