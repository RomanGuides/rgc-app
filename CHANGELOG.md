# Changelog

All notable changes to this project are documented in this file, starting from the v1.0.0 baseline. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- Capacitor native wrapper for iOS and Android (`ios/`, `android/`, `capacitor.config.ts`), enabling native App Store/Play Store builds of the existing web app. No app logic changed — geolocation still uses the standard browser API, not a native plugin (deferred to a future change). Location permission strings declared on both platforms (`NSLocationWhenInUseUsageDescription` on iOS, `ACCESS_COARSE_LOCATION`/`ACCESS_FINE_LOCATION` on Android).
- `npm run cap:sync` / `cap:ios` / `cap:android` scripts for the native build workflow.
- `.gitignore` hardened for native signing material (`*.jks`, `*.keystore`, `*.mobileprovision`).
- `@capacitor/dialog` dependency, used in place of `window.alert()` (see Fixed below).

### Fixed
- Found only by testing a real installed Android build (not caught by Playwright or browser testing): the bottom tab bar and the Map screen's top black bar had no safe-area padding, so on a device with a 3-button navigation bar and a standard status bar, both were rendered underneath system UI — the tab bar became untappable, and the top bar sat behind the clock/signal icons. Fixed with `env(safe-area-inset-bottom)` / `env(safe-area-inset-top)` padding in `src/App.tsx` and `src/features/map/MapScreen.tsx`.
- Also found only on a real device: `startWalkingDirections.ts` used `window.alert()` for its two user-facing error messages (no location set, route request failed). In Capacitor's native Android WebView this caused the app to freeze, requiring a force-close — a known incompatibility between raw browser dialogs and native WebViews. Replaced with `@capacitor/dialog`'s `Dialog.alert()`, which has an identical web fallback (no change in browser/Playwright behavior) but uses a proper native dialog on Android/iOS.
- The route-line effect in `MapView.tsx` depended on the whole `activeRoute` object, which gets a new reference on every location update while a route is active (`updateRouteProgress`) — this re-ran `map.fitBounds()` on every GPS tick, which was harmless indoors but saturated the render thread outdoors with frequent real GPS updates, causing an ANR requiring a force-close. Narrowed the dependency to `activeRoute?.destinationId`.
- `useGeolocation.ts`'s continuous `watchPosition` (used during an active route) briefly went through `enableHighAccuracy: false` as an attempted mitigation for the ANR above, on the theory that our own high-accuracy request was contributing to device-wide CPU/GPS contention. On a real device this produced a ~200m position error (WiFi/cell-based positioning instead of real GPS) — enough to break arrival detection (25m threshold). Reverted to `enableHighAccuracy: true`: the ANR's actual CPU breakdown showed other background apps and `system_server` as the dominant load, not this app's own accuracy setting, so the precision cost wasn't justified by the marginal ANR benefit.
- Starting a walking route froze the app immediately on a real device (confirmed via `adb logcat`: a brand-new GPS watch registered with the OS every ~15-20ms, non-stop). Root cause was the same class of bug as the `MapView.tsx` fix above, in a different effect: `MapScreen.tsx`'s tracking effect (`startWatching`/`stopWatching`) depended on the whole `activeRoute` object, which gets a new reference on every position update — each new reference re-ran the effect's cleanup and body, registering a fresh `watchPosition` in a tight loop, made worse by the `enableHighAccuracy: true` revert above producing far more frequent real position updates than before. Narrowed the dependency to `activeRoute?.destinationId`, same fix as `MapView.tsx`.

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
