// Roman Guides Companion — Performance monitoring
//
// Monitoraggio di base: misura durate di operazioni chiave e le registra.
// Oggi il "backend" è la console — non c'è ancora un servizio di analytics/
// monitoring reale collegato (Sentry, LogRocket, o un endpoint interno).
// Quando ce ne sarà uno, reportMetric() è l'unico punto da modificare —
// il resto dell'app continua a chiamare markStart/markEnd senza saperlo,
// stesso principio già applicato a placesService per i dati.

const marks = new Map<string, number>();

export function markStart(label: string): void {
  marks.set(label, performance.now());
}

export function markEnd(label: string, context?: Record<string, unknown>): number | null {
  const start = marks.get(label);
  if (start === undefined) return null;
  const duration = performance.now() - start;
  marks.delete(label);
  reportMetric(label, duration, context);
  return duration;
}

function reportMetric(label: string, durationMs: number, context?: Record<string, unknown>): void {
  // Soglia oltre la quale un'operazione è "lenta" e merita un warning invece
  // di un log informativo — valore scelto in base a cosa ci si aspetta da
  // un'interazione fluida (~1 frame a 60fps è 16ms, ma per operazioni async
  // come il caricamento mappa una soglia più permissiva ha senso).
  const SLOW_THRESHOLD_MS = 1000;

  const payload = { label, durationMs: Math.round(durationMs), ...context };
  if (durationMs > SLOW_THRESHOLD_MS) {
    console.warn(`[perf] ${label} SLOW (${payload.durationMs}ms)`, context || '');
  } else {
    console.info(`[perf] ${label} (${payload.durationMs}ms)`, context || '');
  }

  // Punto di innesto futuro per un servizio reale, es.:
  // if (window.__ANALYTICS__) window.__ANALYTICS__.track('performance', payload);
}
