# Release Notes

## Redesign v1 — 2026-08-05 (Unreleased)

A substantial redesign since the v1.0.0 baseline below — nav shell, screens, and visual language all changed. Everything here supersedes the "What's included" section under v1.0.0; that section is kept as a historical record of what v1.0.0 actually shipped, not a description of the app today.

### App shell
- Capacitor native wrapper for iOS and Android — the app now ships as a real native binary, not just a web page. Geolocation still uses the standard browser API, not a native plugin.
- Tab bar cut from 5 tabs to 3: **Rome** (replaces Home + Map + Explore), **Experiences**, **Saved** (replaces My Rome).

### Rome (was Map, plus relevant parts of Home)
- Full-bleed map with `RomeSheet`, a persistent bottom sheet with three detents, dragged via a real spring-physics simulation (not a fixed-duration CSS transition).
- Search, real-time, full-screen — with suggestion pills when a query matches nothing (nearest-matching category and area, computed from the bundle).
- Category filter popover with outline icons (no more emoji) and a fixed z-index/clipping bug that let `LocateButton` cover it.
- "Tonight" (was Tip of the Day), "Nearest to you" — replaced by a by-neighbourhood grouped list when location access is explicitly denied, rather than just going blank.
- "Around Me" radius filter removed entirely — sorting is always by walking distance now, category filters remain.
- Get Around, Emergency, and Find Water Nearby, migrated here from the old Home tab (visible at the sheet's full detent).
- Offline handling: a non-blocking banner when connectivity drops, and map tiles that fail to load leave a plain neutral background instead of a broken/grey checkerboard look.

### Place screen (new; replaces the old marker popup card)
- Full-screen "push" instead of a bottom-sheet popup, one template for every place instead of separate premium/utility card types.
- Save toggle (heart icon, fills red when saved) and a free-text arrival note ("ring the left bell"), local-only.
- Header photo falls back to a category-specific placeholder photo (for gastronomic categories) or a plain neutral background — never the category's marker color, which for pasta/restaurant read as a red error state.

### Experiences (restructured; now also "who we are")
- New order: a short masthead, all seven bookable tours immediately, Meet the Guides, guest quotes, and Our Story — absorbing content that used to live on My Rome.
- Guide names/bios and Our Story are the founder's real August 2026 copy, not placeholder text.
- **Booking now happens inside the app.** "Discover Experience" opens Bokun's checkout in a full-screen in-app view instead of handing off to the system browser — no more fully leaving the app to pay. Bokun still handles the entire booking and payment flow (see `docs/BokunIntegration.md`).

### Saved (was My Rome)
- Reduced to just the shortlist: title, count, and the saved-places list, now sorted by distance instead of save order.
- Meet the Guides, Our Story, testimonials, and review links moved to Experiences (above); a WhatsApp-per-guide button and a second (TripAdvisor) review link were retired for now rather than carried over — see `docs/parked-content.md`.

### Fixed (found only through real-device testing)
- Safe-area padding for the tab bar and map header on edge-to-edge Android devices.
- `window.alert()` froze the app in the native WebView — replaced with `@capacitor/dialog`.
- Two separate ANR (app-not-responding) bugs from effects re-running on every GPS tick during an active route, in both the map's route-line drawing and the location-watching lifecycle.
- Geolocation accuracy tuning after a real-device ANR investigation (see `CHANGELOG.md` for the full back-and-forth).

### Known issues / caveats
- Full native Bokun checkout (own UI, live pricing/availability, in-app payment) was researched and architected in depth but deliberately not built — the in-app widget above already avoids the external-browser handoff at zero backend/PCI cost, and the added UI control wasn't judged worth taking on a backend and payment compliance burden for at current volume. See `docs/BokunIntegration.md`.
- **App Store screenshots are now out of date.** Any reference mockups predate this redesign (new nav shell, new Place/Experiences/Saved screens, in-app booking) — fresh real-device captures are needed before any store submission, tracked in `ROADMAP.md`.
- Caveats already listed under v1.0.0 below that are still true: no CI/CD or hosting configured, the `Collection` data model entity still has no UI, and the two independent `UserLocation` interfaces still haven't been unified.

## v1.0.0 — 2026-08-01

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
