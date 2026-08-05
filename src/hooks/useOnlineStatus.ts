// Roman Guides Companion — useOnlineStatus
// Wrapper minimo su navigator.onLine + eventi online/offline — usato solo
// dallo stato 04 (Empty and Error States addendum): il banner "No
// connection" sulla mappa, che sparisce da solo quando la connessione torna.

import { useEffect, useState } from 'react';

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

  useEffect(() => {
    function goOnline() {
      setIsOnline(true);
    }
    function goOffline() {
      setIsOnline(false);
    }
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}
