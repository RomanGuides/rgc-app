import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

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
  ].filter(Boolean),
  // maplibre-gl runs its GeoJSON clustering in a web worker (maplibre-gl-worker.mjs).
  // Vite's dependency pre-bundling doesn't handle that worker file correctly by
  // default, which silently breaks clustering (source stays "empty" forever,
  // with no error thrown). Excluding maplibre-gl from optimizeDeps fixes it.
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
})
