# Architecture

This document describes the current implementation of Roman Guides Companion — how the app is actually built today, not planned or future changes.

## Stack

- **React 19** + **TypeScript**, built with **Vite 8**.
- **Zustand** (with its `persist` middleware) for application state — a single store, no context providers, no Redux.
- **MapLibre GL JS** for the map (see `docs/Map.md`).
- **OpenRouteService** for walking directions (see `docs/Routing.md`).
- **Oxlint** for linting (`npm run lint`), not ESLint.
- **Playwright** for end-to-end tests (`npm run test:e2e`).
- **Capacitor** wraps the web app in native iOS (`ios/`) and Android (`android/`) shells for App Store / Play Store distribution (see `docs/Deployment.md`). The web app itself is unmodified for this — it's the same React app, loaded in a native WebView. Geolocation still goes through the standard browser `navigator.geolocation` API (not a native Capacitor plugin) as of this writing.
- No UI framework (MUI, Tailwind, etc.) — every component is hand-styled with inline `style` objects and a small set of CSS custom properties (`src/design-system/tokens.css`).
- No backend. The app is a static single-page app; all content is bundled JSON (see `docs/DataModel.md`).

## App shell — no router

`src/App.tsx` holds the active tab in a plain `useState<Tab>`, where `Tab` is `'home' | 'map' | 'experiences' | 'explore' | 'myrome'`. There is no `react-router` or any URL-based routing — the app has no deep links, and the default tab on load is `'map'`. Screens are conditionally rendered (`{activeTab === 'home' && <HomeScreen />}`), not mounted/hidden — switching away from a tab unmounts it, so each screen's own `useEffect` re-runs its data load every time it's revisited.

Cross-tab navigation (e.g. tapping a place in Explore to view it on the Map) is done via a prop-drilled `onNavigate: (tab: Tab) => void` callback passed down from `App.tsx` to each screen — there is no separate navigation service or event bus.

## Folder structure

```
src/
  App.tsx, main.tsx            — app shell, entry point
  config/                      — constants and policy decisions (map provider, categories, routing, app-wide settings, external links)
  data/                        — TypeScript types + the static JSON content itself
  design-system/               — CSS tokens + shared presentational components (Card, Button, Chip, Badge, BottomSheet, SectionHeader, SocialIcons, EmailCaptureBanner, EmptyState)
  features/                    — one folder per screen/feature area (home, map, experiences, explore, myrome)
  hooks/                       — useGeolocation, useOnlineStatus
  services/                    — one file per data entity, each just wrapping its JSON import (see docs/DataModel.md)
  store/                       — the single Zustand store
  utils/                       — pure helper functions (distance, filterPlaces, performance, water fountain search link builder, Levenshtein distance)

ios/                            — native Xcode project (Capacitor-generated), wraps the built web app
android/                        — native Android Studio/Gradle project (Capacitor-generated), wraps the built web app
capacitor.config.ts             — Capacitor config: app id, app name, webDir ('dist')
```

## State boundary

This is a deliberate, documented convention (see comments in `src/store/usePlacesStore.ts` and `src/config/categories.config.ts`): the **store holds state, not logic**. Concretely:

- **Where content comes from** lives in `services/` (e.g. `placesService.getPlaces()`), never inline in a component or in the store.
- **Business logic** (filtering places by category/radius, formatting distances) lives in `utils/`, as pure functions.
- **The store** (`usePlacesStore`) holds: the loaded `places` array, active category filters, the search radius, the user's location, the currently-selected place (drives the map's bottom sheet), saved place ids, the active walking route, and a couple of UI signals (`arrivalMessageVisible`, `locateMeSignal` — see `docs/Routing.md` and `docs/Map.md` for why the latter exists).
- Only `savedPlaceIds` is persisted to `localStorage` (via Zustand's `persist` middleware, key `rgc_saved_places`, `partialize`d to just that one field) — everything else in the store resets on page reload.

## Configuration files (`src/config/`)

Each config file documents one specific decision, with the reasoning left in comments:

- `app.config.ts` — map center/zoom, the `DEFAULT_ME` geolocation fallback (Trevi Fountain), "Around Me" radius options, cluster size thresholds, the localStorage key for saved places.
- `categories.config.ts` — one source of truth for each place category's label/emoji/color, and its **tier** (`premium` vs `utility`), which decides which place-card component renders it (see `docs/Map.md`).
- `mapProvider.config.ts` — which basemap tile provider is active (see `docs/Map.md`).
- `routing.config.ts` — OpenRouteService endpoint, API key (from env), walking speed/arrival constants (see `docs/Routing.md`).
- `links.ts` — external URLs (social media, tours, team video) used across Home/My Rome.

## Build tooling

`vite.config.ts` wires in:
- `@vitejs/plugin-react` — standard React/JSX support.
- `optimizeDeps.exclude: ['maplibre-gl']` — required so MapLibre's web worker (`maplibre-gl-worker.mjs`) works correctly; without this, Vite's dependency pre-bundling silently breaks clustering (see `docs/Map.md`).
- `rollup-plugin-visualizer`, opt-in only with `ANALYZE=true` — generates `dist/bundle-analysis.html`.
- `@vitejs/plugin-basic-ssl`, opt-in only with `HTTPS=true` — serves the dev/preview server over a self-signed HTTPS certificate, needed to test real GPS geolocation from a phone (see `docs/Deployment.md` and `docs/Map.md`).

`scripts/check-bundle-size.mjs` measures `dist/`'s total size after a build and warns (never fails) above 1.5 MB — run via `npm run build:check`.
