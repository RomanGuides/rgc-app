// Roman Guides Companion — Android hardware back button, centralizzato
//
// L'app non ha una libreria di routing (nessuno storico di navigazione
// reale — Architettura v2, sezione 6), quindi il comportamento di default
// di Capacitor per il tasto indietro non ha nulla su cui "tornare" e chiude
// l'app direttamente, a meno che qualcosa non lo intercetti esplicitamente.
//
// Più schermate a schermo intero possono essere montate insieme (es.
// TourDetailScreen -> BookingWidgetModal, PlaceScreen -> BookingWidgetModal):
// se ognuna ascoltasse App.addListener('backButton', ...) per conto propria,
// un singolo tocco indietro farebbe scattare TUTTI gli handler registrati
// insieme, chiudendo due schermate invece di una sola. Questa pila condivisa
// garantisce che solo la schermata più in alto (l'ultima montata) risponda —
// vedi App.tsx per il singolo listener globale che la consuma.
import { useEffect } from 'react';

const stack: Array<() => void> = [];

export function useAndroidBackHandler(onBack: () => void) {
  useEffect(() => {
    stack.push(onBack);
    return () => {
      const idx = stack.lastIndexOf(onBack);
      if (idx !== -1) stack.splice(idx, 1);
    };
  }, [onBack]);
}

// true se una schermata in pila ha gestito la pressione (App.tsx non deve
// fare altro); false se la pila è vuota — si è a un tab "nudo", da lì in poi
// decide App.tsx (doppia pressione per uscire).
export function popTopBackHandler(): boolean {
  const handler = stack[stack.length - 1];
  if (!handler) return false;
  handler();
  return true;
}
