// Roman Guides Companion — MapScreen
//
// La schermata reale della Mappa, che sostituisce "Our Picks" nella tab bar.
// Unisce i pezzi già validati singolarmente: AroundMeBar (raggio + posizione),
// CategoryFilterBar (filtro categoria), MapView (mappa + cluster + marker),
// PlaceBottomSheet (dettaglio luogo + salvataggio).

import { useEffect, useState } from 'react';
import { MapView } from './MapView';
import { AroundMeBar } from './AroundMeBar';
import { CategoryFilterBar } from './CategoryFilterBar';
import { PlaceBottomSheet } from './PlaceBottomSheet';
import { DirectionsBar } from './DirectionsBar';
import { ArrivalToast } from './ArrivalToast';
import { useRouteTracking } from './useRouteTracking';
import { MyRomePanel } from '../myrome/MyRomePanel';
import { usePlacesStore } from '../../store/usePlacesStore';
import { filterPlaces } from '../../utils/filterPlaces';
import { buildWaterFountainSearchUrl } from '../../utils/waterFountainSearch';

export function MapScreen() {
  const places = usePlacesStore((s) => s.places);
  const activeCategories = usePlacesStore((s) => s.activeCategories);
  const radius = usePlacesStore((s) => s.radius);
  const userLocation = usePlacesStore((s) => s.userLocation);
  const loadPlaces = usePlacesStore((s) => s.loadPlaces);
  const selectPlace = usePlacesStore((s) => s.selectPlace);
  const savedPlaceIds = usePlacesStore((s) => s.savedPlaceIds);
  const activeRoute = usePlacesStore((s) => s.activeRoute);
  const selectedPlaceForCentering = usePlacesStore((s) => s.selectedPlace);
  const locateMeSignal = usePlacesStore((s) => s.locateMeSignal);
  const [myRomeOpen, setMyRomeOpen] = useState(false);

  useRouteTracking();

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  const visiblePlaces = filterPlaces(places, { activeCategories, radius, userLocation });

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          background: 'var(--black)',
          color: '#fff',
          padding: '10px 16px',
          // Stessa causa del fix sulla tab bar in App.tsx: nella WebView nativa
          // edge-to-edge, questa barra è il primo elemento in cima allo schermo
          // e finisce dietro la barra di stato (segnale, orologio) senza questo
          // padding — riscontrato su dispositivo reale.
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
        }}
      >
        <a
          href={buildWaterFountainSearchUrl(userLocation)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '6px 12px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.25)',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          🚰 Find Water Nearby
        </a>
        <button
          onClick={() => setMyRomeOpen(true)}
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '6px 12px',
            borderRadius: 999,
            border: `1px solid ${savedPlaceIds.length > 0 ? 'var(--red)' : 'rgba(255,255,255,0.25)'}`,
            background: savedPlaceIds.length > 0 ? 'var(--red)' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          ❤️ My Rome ({savedPlaceIds.length})
        </button>
      </div>
      <AroundMeBar />
      <CategoryFilterBar />
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView
          places={visiblePlaces}
          onSelectPlace={selectPlace}
          userLocation={userLocation}
          activeRoute={activeRoute}
          selectedPlace={selectedPlaceForCentering}
          locateMeSignal={locateMeSignal}
        />
        {/* Contatore luoghi visibili — pattern validato nello Spike (count-pill) */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 4,
            background: 'rgba(26,20,16,0.85)',
            color: '#fff',
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '6px 14px',
            borderRadius: 999,
            pointerEvents: 'none',
          }}
        >
          {visiblePlaces.length} place{visiblePlaces.length === 1 ? '' : 's'}
          {radius > 0 ? ` within ${radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}` : ' — entire Rome'}
        </div>
        <DirectionsBar />
        <ArrivalToast />
      </div>
      <PlaceBottomSheet />
      <MyRomePanel isOpen={myRomeOpen} onClose={() => setMyRomeOpen(false)} />
    </div>
  );
}
