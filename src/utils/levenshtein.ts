// Roman Guides Companion — Levenshtein distance
// Usata da SearchScreen (Empty and Error States addendum, stato 01) per
// trovare il luogo il cui nome è lessicalmente più vicino a una query senza
// risultati — non un fuzzy-match libreria, solo la distanza di edit classica.

export function normalizeForMatch(s: string): string {
  // NFD + rimozione dei diacritici (es. "città" -> "citta") prima del confronto,
  // così una query senza accenti non penalizza un nome che li ha.
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prevRow = Array.from({ length: n + 1 }, (_, j) => j);
  let currRow = new Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    currRow[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1, // deletion
        currRow[j - 1] + 1, // insertion
        prevRow[j - 1] + cost // substitution
      );
    }
    [prevRow, currRow] = [currRow, prevRow];
  }
  return prevRow[n];
}
