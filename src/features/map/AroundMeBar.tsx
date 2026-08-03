// Roman Guides Companion — AroundMeBar
// Porting del pattern validato nello Spike: chip raggio + bottone geolocalizzazione.

import { useEffect, useRef } from 'react';
import { Chip } from '../../design-system/components/Chip';
import { RADIUS_OPTIONS } from '../../config/app.config';
import { useGeolocation } from '../../hooks/useGeolocation';
import { usePlacesStore } from '../../store/usePlacesStore';

export function AroundMeBar() {
  const radius = usePlacesStore((s) => s.radius);
  const setRadius = usePlacesStore((s) => s.setRadius);
  const setUserLocation = usePlacesStore((s) => s.setUserLocation);
  const bumpLocateMeSignal = usePlacesStore((s) => s.bumpLocateMeSignal);
  const activeRoute = usePlacesStore((s) => s.activeRoute);
  const { location, status, requestLocation, startWatching, stopWatching } = useGeolocation();
  // true solo tra il click sul bottone e la prossima risoluzione di
  // posizione — distingue "l'utente ha chiesto esplicitamente di essere
  // ricentrato" dagli aggiornamenti silenziosi in background durante un
  // percorso attivo (quelli non devono far scattare la ricentratura).
  const explicitRequestPending = useRef(false);

  useEffect(() => {
    if (location) {
      setUserLocation(location);
      if (explicitRequestPending.current) {
        bumpLocateMeSignal();
        explicitRequestPending.current = false;
      }
    }
  }, [location, setUserLocation, bumpLocateMeSignal]);

  useEffect(() => {
    if (activeRoute) {
      startWatching();
    } else {
      stopWatching();
    }
    return () => stopWatching();
  }, [activeRoute, startWatching, stopWatching]);

  function handleRadiusClick(value: number) {
    setRadius(value);
    if (value > 0 && !location) {
      explicitRequestPending.current = true;
      requestLocation();
    }
  }

  function handleLocateMeClick() {
    explicitRequestPending.current = true;
    requestLocation();
  }

  const locateLabel =
    status === 'locating'
      ? 'Locating…'
      : status === 'located'
      ? '📍 Located'
      : status === 'fallback'
      ? '📍 Using default point'
      : 'Use my location';

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--line)',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
        📍 Around Me
      </span>
      {RADIUS_OPTIONS.map((opt) => (
        <Chip key={opt.value} active={radius === opt.value} onClick={() => handleRadiusClick(opt.value)}>
          {opt.label}
        </Chip>
      ))}
      <button
        onClick={handleLocateMeClick}
        style={{
          marginLeft: 'auto',
          fontSize: '0.68rem',
          fontWeight: 700,
          padding: '6px 10px',
          borderRadius: '999px',
          border: '1px solid var(--line)',
          background: status === 'located' || status === 'fallback' ? 'var(--ink)' : 'var(--surface-2)',
          color: status === 'located' || status === 'fallback' ? '#fff' : 'var(--ink)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {locateLabel}
      </button>
    </div>
  );
}
