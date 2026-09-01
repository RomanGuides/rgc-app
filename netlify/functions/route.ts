// Roman Guides Companion — Netlify Function: proxy OpenRouteService
//
// La chiave ORS reale non deve mai finire nel bundle spedito con l'app
// (2026-08-18, vedi ROADMAP.md) — chiunque scarichi l'APK/IPA pubblicato
// potrebbe estrarla da lì. Questa funzione gira lato server: riceve dal
// client lo stesso corpo che prima andava direttamente a ORS (coordinate),
// aggiunge lei la chiave reale (letta da process.env, mai committata), e
// inoltra la richiesta. Nessuna logica in più — stesso URL ORS, stesso
// corpo, solo l'Authorization spostata qui.
//
// ORS_API_KEY va impostata nel pannello Netlify (Site settings -> Environment
// variables), NON in .env/.env.example — quel file riguarda solo variabili
// lette dal client Vite (VITE_*), un contesto completamente diverso da dove
// gira questa funzione.
//
// CORS (2026-09-01): l'API di ORS accettava richieste da qualunque origine,
// quindi finché il client la chiamava direttamente il problema non esisteva.
// Mettendoci davanti una funzione NOSTRA il vincolo di same-origin è
// comparso: un proxy eredita le regole di origine del proprio host, non
// quelle del servizio che avvolge. Senza gli header qui sotto la funzione
// rispondeva solo al sito Netlify, e le indicazioni a piedi erano rotte in
// sviluppo locale, in CI e — la più grave — nella WebView nativa, cioè nel
// canale di distribuzione principale. I due test e2e rossi dal 2026-08-19
// erano esattamente questo segnale, letto per due settimane come "manca il
// sito di hosting".
//
// Allowlist e non '*': questa funzione consuma la quota ORS di Roman Guides,
// e con '*' chiunque potrebbe usarla come proxy gratuito dal browser. Nota
// onesta sui limiti: il CORS lo applica il browser, quindi non protegge da
// un client che non manda Origin (curl, script server-side). Serve a non
// regalare la quota alle pagine web altrui, non come controllo d'accesso.

const ORS_WALKING_URL = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';

// Ogni contesto da cui l'app chiama davvero questa funzione.
const ALLOWED_ORIGINS = new Set([
  'https://roman-guides-companion.netlify.app', // sito deployato
  'https://localhost',                          // WebView Android (androidScheme di default: https)
  'capacitor://localhost',                      // WebView iOS
  'http://localhost:5173',                      // npm run dev (Vite)
  'http://localhost:4173',                      // npm run preview (porta di default)
  'http://localhost:4181',                      // Playwright (playwright.config.ts)
]);

interface NetlifyEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
}

interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

// Vary: Origin perché la risposta cambia in base all'header Origin — senza,
// una CDN potrebbe servire a un'origine la risposta memorizzata per un'altra.
function corsHeadersFor(origin: string | undefined): Record<string, string> {
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return { Vary: 'Origin' };
  return {
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
  };
}

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  // event.headers arriva con i nomi in minuscolo da Netlify, ma non è
  // garantito da tutti i runtime: controlliamo entrambe le forme.
  const origin = event.headers?.origin ?? event.headers?.Origin;
  const cors = corsHeadersFor(origin);

  // Il client manda Content-Type: application/json, quindi la richiesta non
  // è una "simple request" e il browser antepone SEMPRE un preflight OPTIONS.
  // Prima questo ramo non esisteva e il preflight cadeva nel 405 qui sotto,
  // uccidendo la chiamata prima ancora che il POST partisse.
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        ...cors,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: 'Method Not Allowed' };
  }

  const orsApiKey = process.env.ORS_API_KEY;
  if (!orsApiKey) {
    return {
      statusCode: 500,
      headers: cors,
      body: 'ORS_API_KEY non impostata sul server (Netlify Site settings -> Environment variables)',
    };
  }

  const response = await fetch(ORS_WALKING_URL, {
    method: 'POST',
    headers: {
      Authorization: orsApiKey,
      'Content-Type': 'application/json',
    },
    body: event.body ?? '',
  });

  const data = await response.text();
  return {
    statusCode: response.status,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: data,
  };
}
