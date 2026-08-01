# Changelog

All notable changes to this project are documented in this file, starting from the v1.0.0 baseline. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] — 2026-08-01

### Added
- First Playwright end-to-end test suite for this app: Home, Map (basemap + markers), Explore, My Rome, marker popup, Directions (full flow: locate → select place → get directions → route drawn → stop route), and a layout-regression test for the email capture form's "Last name" field.
- Optional HTTPS-enabled local preview (`HTTPS=true npm run preview -- --host`), via `@vitejs/plugin-basic-ssl`, needed to test real GPS geolocation from a phone on the local network (mobile browsers require a secure context for the Geolocation API).
- `.gitignore` entries for Playwright artifacts (`playwright-report`, `test-results`, `blob-report`) and for common credential/certificate file patterns.

### Fixed
- Map: a fallback timer could call `map.addSource()` before the style finished loading, throwing "Style is not done loading." This silently broke both marker clustering and the Walking Directions route line, since both are set up in the same function. Fixed by checking `map.isStyleLoaded()` before proceeding, deferring to the real `load` event otherwise.
- Email capture form: the "Last name" input was clipped on narrow phone screens, a standard flexbox `min-width: auto` issue on two `flex: 1` inputs in a row. Fixed with explicit `minWidth: 0`.
- Geolocation: the one-shot `requestLocation()` call used a 6-second timeout, too short for a real first GPS/network fix on a physical device (especially indoors) — it reliably timed out and silently fell back to the hardcoded Trevi Fountain reference point. Raised to 15 seconds; confirmed fixed on a real phone.

### Removed
- Dead code, verified unreferenced anywhere in the codebase before removal: `src/services/collectionsService.ts`, `src/data/collections.json`, `src/utils/directions.ts`, `src/assets/` (unused template assets: `hero.png`, `react.svg`, `vite.svg`), `public/icons.svg`.
- Unused `catch` binding in `scripts/check-bundle-size.mjs`.

### Documentation
- Added `RELEASE_NOTES.md`, `docs/` (Architecture, Data Model, Map, Routing, Google Sheets, Deployment), `CONTRIBUTING.md`, and `ROADMAP.md`.
