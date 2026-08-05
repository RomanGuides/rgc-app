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

// 'denied' è distinto da 'fallback' — serve a RomeSheet per sapere se
// l'utente ha esplicitamente rifiutato il permesso (redesign v1, Empty and
// Error States, stato 05: "Nearest to you" viene sostituito da un elenco
// per zona), invece che una richiesta semplicemente scaduta o non supportata.
export type LocationStatus = 'idle' | 'locating' | 'located' | 'fallback' | 'denied';

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
      (err) => {
        setLocation({ ...DEFAULT_ME });
        // code 1 = PERMISSION_DENIED — l'utente ha detto esplicitamente no,
        // a differenza di un timeout (3) o "non disponibile" (2). Solo un
        // rifiuto esplicito attiva lo stato 05 (elenco per zona) in RomeSheet;
        // un timeout resta 'fallback' e può essere ritentato senza motivo
        // per pensare che ritentare non serva a niente.
        setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'fallback');
      },
      // 6s was too tight for a real first GPS/network fix on a physical
      // device (esp. indoors) — it reliably timed out (code=3) and fell
      // back to the Trevi Fountain default even when location genuinely
      // worked given more time. Confirmed on a real phone: 15s fixed it.
      { timeout: 15000 }
    );
  }, []);

  // Tracciamento continuo — usato SOLO mentre un percorso è attivo (batteria).
  // Fuori da quel contesto resta il comportamento "una tantum" di sempre.
  //
  // enableHighAccuracy: true — era stato messo a false per mitigare un ANR
  // riscontrato su dispositivo reale (vedi CHANGELOG), ma la bassa precisione
  // (posizionamento WiFi/celle invece del GPS vero) ha prodotto un errore di
  // posizione di ~200m su dispositivo reale — inaccettabile per una funzione
  // che deve rilevare l'arrivo entro 25m. Riportato a true: i dati dell'ANR
  // mostravano che il carico principale veniva da ALTRE app in background
  // (system_server, altri processi) e non dalla nostra richiesta di alta
  // precisione (eravamo il contributo di CPU più piccolo dei tre) — quindi il
  // costo in precisione non era giustificato dal beneficio marginale sull'ANR.
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
