// Roman Guides Companion — minuti totali (es. da experiences.json) in una
// stringa breve tipo "2h 15m" — usata sia dalla card tour che dal dettaglio.
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
