import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Attivo solo con ANALYZE=true — non intralcia le build normali,
    // genera dist/bundle-analysis.html da aprire nel browser.
    process.env.ANALYZE && visualizer({
      filename: 'dist/bundle-analysis.html',
      gzipSize: true,
      brotliSize: true,
      open: false,
    }),
    // Attivo solo con HTTPS=true — serve a testare la vera geolocalizzazione
    // GPS da un telefono in rete locale: i browser mobili trattano
    // http://<ip-locale> come contesto non sicuro e bloccano/degradano
    // navigator.geolocation, che allora cade sul punto di default (Trevi
    // Fountain) invece della posizione reale. Certificato autofirmato —
    // il telefono chiederà di accettare l'avviso di sicurezza una volta.
    process.env.HTTPS === 'true' && basicSsl(),
  ].filter(Boolean),
  // maplibre-gl runs its GeoJSON clustering in a web worker (maplibre-gl-worker.mjs).
  // Vite's dependency pre-bundling doesn't handle that worker file correctly by
  // default, which silently breaks clustering (source stays "empty" forever,
  // with no error thrown). Excluding maplibre-gl from optimizeDeps fixes it.
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
})
