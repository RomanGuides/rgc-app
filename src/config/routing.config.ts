// Roman Guides Companion — Routing configuration
//
// Fino al 2026-08-18 questo file esportava anche ORS_API_KEY, letta da
// VITE_ORS_API_KEY e mandata direttamente a OpenRouteService dal client —
// significa che la chiave reale finiva nel bundle JS spedito con l'app,
// estraibile da chiunque scaricasse l'APK/IPA pubblicato. Rimossa: l'app
// ora chiama una funzione serverless (netlify/functions/route.ts) che tiene
// la chiave reale lato server e inoltra la richiesta a ORS per conto nostro.
// Questo URL non è un segreto — è solo l'indirizzo della nostra funzione,
// sicuro da avere nel bundle client (è il punto di tutta questa modifica).
export const ORS_WALKING_URL = import.meta.env.VITE_ORS_PROXY_URL as string | undefined;

// Velocità media a piedi, usata per stimare il tempo residuo senza richiamare
// l'API a ogni aggiornamento di posizione (solo la prima richiesta usa la
// stima reale di ORS — dopo si ricalcola localmente, in linea retta).
export const AVERAGE_WALKING_SPEED_MPS = 1.35; // ~4.9 km/h

// Entro questa distanza dalla destinazione, il percorso si considera concluso.
export const ARRIVAL_THRESHOLD_METERS = 25;
