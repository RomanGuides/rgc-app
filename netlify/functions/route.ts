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

const ORS_WALKING_URL = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';

interface NetlifyEvent {
  httpMethod: string;
  body: string | null;
}

interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const orsApiKey = process.env.ORS_API_KEY;
  if (!orsApiKey) {
    return { statusCode: 500, body: 'ORS_API_KEY non impostata sul server (Netlify Site settings -> Environment variables)' };
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
    headers: { 'Content-Type': 'application/json' },
    body: data,
  };
}
