#!/usr/bin/env node
// Roman Guides Companion — Bundle size check
//
// Controllo semplice: dopo la build, misura la dimensione totale di dist/
// e avvisa se supera una soglia. Non blocca la build (exit 0 sempre) — è
// un segnale per chi sta sviluppando, non un gate rigido. Se in futuro si
// vuole farlo bloccare in CI, cambiare l'exit code sotto la soglia.

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const DIST_DIR = 'dist';
const WARN_THRESHOLD_KB = 1500; // 1.5 MB — generoso per una PWA con mappa, da rivedere con dati reali di utilizzo

function getDirSizeBytes(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      total += getDirSizeBytes(fullPath); // ricorsione in byte, mai in KB — evita la doppia conversione
    } else {
      total += statSync(fullPath).size;
    }
  }
  return total;
}

try {
  const sizeKB = getDirSizeBytes(DIST_DIR) / 1024;
  const sizeLabel = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(2)} MB` : `${sizeKB.toFixed(0)} KB`;

  if (sizeKB > WARN_THRESHOLD_KB) {
    console.warn(`⚠️  Bundle size: ${sizeLabel} — supera la soglia di avviso (${WARN_THRESHOLD_KB} KB)`);
  } else {
    console.log(`✅ Bundle size: ${sizeLabel} — entro la soglia di avviso (${WARN_THRESHOLD_KB} KB)`);
  }
} catch (err) {
  console.error(`Impossibile leggere ${DIST_DIR}/ — hai eseguito 'npm run build' prima?`);
  process.exit(1);
}
