# Release Notes — v1.0.0

This is the first version baseline of Roman Guides Companion considered **stable**. It marks the switch from active feature-building to long-term maintenance.

## What's included

### Home
- Hero section, social links (Instagram, Facebook, TikTok, YouTube), "Roman Guides Recommends" editorial pick, community photo gallery, latest video experiences, local tips grid, "Get Around" practical info, email capture banner (10% off code), emergency numbers.

### Map
- Real OpenStreetMap basemap (raster tiles) rendered via MapLibre GL JS, with native clustering (89 real places).
- Category filters (Restaurants, Pasta, Pizza, Gelato, Rooftop Bars, Cocktail Bars, Visit on Your Own).
- "Around Me" radius filter (300m / 500m / 1km / Entire Rome) and "Use my location" geolocation.
- Place cards (Premium and Utility tiers) in a bottom sheet on marker tap, with save-to-My-Rome.
- **Walking Directions**: real-time route calculation via OpenRouteService, route line drawn on the map, live ETA/distance, destination highlighting, live position tracking while a route is active, arrival detection, and a "Stop Route" control.
- "Find Water Nearby" quick link.

### Experiences
- Video-based highlighted experiences tied to specific guides.

### Explore
- "Visit on Your Own" curated photo gallery (66 places); tapping a place opens its card on the Map rather than leaving the app.

### My Rome
- Saved places list, guide bios with direct WhatsApp contact, testimonials, review links (Google/TripAdvisor).

### Data
- Six content entities (Places, Guides, Experiences, Testimonials, AppContent, and a modeled-but-unused Collection type — see `docs/DataModel.md`), sourced from Google Sheets via an external export pipeline (see `docs/GoogleSheets.md`) and checked into the app as static JSON.

### Testing
- First Playwright suite for this app (8 tests): Home, Map (basemap + markers), Explore, My Rome, marker popup, Directions end-to-end, Clear Route, and a layout-regression check for the email capture form.

## Fixed in this baseline

- **Map style-loading race condition**: a fallback timer could call `map.addSource()` before the style finished loading, throwing "Style is not done loading" — this also silently broke clustering and the Directions route line, since both are set up in the same function. Fixed by checking `map.isStyleLoaded()` before proceeding.
- **Real basemap tiles not rendering**: traced to a MapLibre worker/bundler integration issue plus a demo style with no city-level map data; not applicable to this app's OSM raster setup, but the underlying worker-loading fix carries over.
- **Email capture form**: the "Last name" field was clipped on narrow phone screens (flexbox `min-width` default) — fixed, now covered by a regression test.
- **Geolocation always falling back to Trevi Fountain**: the one-shot location request timed out at 6 seconds, too short for a real first GPS/network fix on a physical device (especially indoors) — raised to 15 seconds and confirmed working on a real phone.

## Known issues / caveats (not fixed in this release — see `ROADMAP.md`)

- ~~"Our Story" copy on My Rome is a draft.~~ **Resolved** — the founder has confirmed the copy (see `src/config/story.ts`), which is now the single source of truth for this text.
- No CI/CD or hosting is configured yet (see `docs/Deployment.md`).
- The `Collection` data model entity is defined but has no service, no data, and no UI consumer (Explore/Collections style browsing was never wired up).
- Total `dist/` is ~1.8 MB — main JS chunk ~1.3 MB (single chunk, no code-splitting yet) plus vendored MapLibre worker files and CSS.
- Two independent `UserLocation` interfaces exist (`src/store/usePlacesStore.ts` and `src/hooks/useGeolocation.ts`) — structurally identical today, but not shared, so they can drift.

## Not included

- No "Settings" screen — verified against every planning document (Vision, PRD, Architettura, Design System, Roadmap v1–v20) and the codebase itself: it was never specified or built.
