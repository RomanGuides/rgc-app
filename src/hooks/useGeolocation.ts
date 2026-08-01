// Roman Guides Companion — Geolocation hook
// Porting della logica requestLocation/fallback validata nello Spike:
// prova la geolocalizzazione reale, e se negata o non disponibile usa un
// punto di riferimento di default (Fontana di Trevi), senza bloccare l'utente.

import { useCallback, useRef, useState } from 'react';
import { DEFAULT_ME } from '../config/app.config';

export interface UserLocation {
  lat: number;
  lng: number;
  label?: string;
}

export type LocationStatus = 'idle' | 'locating' | 'located' | 'fallback';

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const watchIdRef = useRef<number | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation({ ...DEFAULT_ME });
      setStatus('fallback');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'Your location' });
        setStatus('located');
      },
      () => {
        setLocation({ ...DEFAULT_ME });
        setStatus('fallback');
      },
      { timeout: 6000 }
    );
  }, []);

  // Tracciamento continuo — usato SOLO mentre un percorso è attivo (batteria).
  // Fuori da quel contesto resta il comportamento "una tantum" di sempre.
  const startWatching = useCallback(() => {
    if (!navigator.geolocation || watchIdRef.current !== null) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'Your location' });
        setStatus('located');
      },
      () => {
        /* se il tracciamento continuo fallisce, resta l'ultima posizione nota */
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  return { location, status, requestLocation, startWatching, stopWatching };
}
