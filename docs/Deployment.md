# Deployment

This document describes the current state of building, running, and testing the app — and honestly states what is not yet set up.

## Current state: no CI/CD, no hosting configured, no store submission yet

There is no `.github/workflows`, `netlify.toml`, `vercel.json`, `Dockerfile`, or any other CI/deployment configuration anywhere in this repository. `README.md` is the unmodified default Vite template and contains no project-specific deployment instructions. Building and deploying the web app today is a fully manual process: run the build locally (or on whatever CI a future integration adds), and manually publish the resulting `dist/` folder to hosting of choice.

The app also has native iOS (`ios/`) and Android (`android/`) projects, generated via Capacitor (see below), but as of this writing neither has been submitted to the App Store or Play Store — no Apple Developer / Google Play Developer account work, signing, or store listing has been done yet. This is deliberate, tracked scope, not an oversight — see `ROADMAP.md`.

This is a deliberate gap being tracked, not an oversight — see the "CI/CD" item in `ROADMAP.md`.

## Local development

```
npm install
npm run dev
```

Starts the Vite dev server (default `http://localhost:5173`).

## Production build

```
npm run build
```

Runs `tsc -b` (strict TypeScript project build/typecheck) followed by `vite build`, outputting to `dist/`.

```
npm run build:check
```

Runs the build, then `scripts/check-bundle-size.mjs`, which measures `dist/`'s total size and prints a warning (does not fail the build) if it exceeds 1.5 MB. Current `dist/` is roughly 1.8 MB total — the main JS chunk alone is ~1.3 MB (single chunk, no code-splitting), plus the vendored MapLibre worker files (~0.5 MB) and CSS.

```
ANALYZE=true npm run build
```

Additionally generates `dist/bundle-analysis.html` via `rollup-plugin-visualizer`, for inspecting what contributes to bundle size.

## Testing on a real phone (HTTPS)

Mobile browsers only expose accurate GPS geolocation in a secure context (HTTPS or `localhost`). To test the app, including real geolocation, from a physical phone on the same local network:

```
HTTPS=true npm run dev -- --host
```

or for a production-like build:

```
HTTPS=true npm run preview -- --host
```

`--host` exposes the server on the LAN (not just `localhost`); `HTTPS=true` enables `@vitejs/plugin-basic-ssl`, which serves over a self-signed certificate (the phone's browser will show a certificate warning to accept once). Then open `https://<your-machine's-LAN-IP>:<port>` on the phone.

## End-to-end tests (Playwright)

```
npm run test:e2e
```

Runs the Playwright suite in `e2e/smoke.spec.ts` against a preview server that Playwright starts automatically (`webServer` config in `playwright.config.ts`, `npm run preview -- --port 4181`). Key configuration choices, documented in `playwright.config.ts`:
- `workers: 1` — tests run serially, not in parallel, to avoid WebGL/GPU and API resource contention between map instances.
- A fixed `geolocation`/`permissions` context (Trevi Fountain coordinates) so map/location-dependent tests are deterministic.
- Viewport locked to `390×844` (a common phone size), since this is a mobile-first app.

The suite covers 8 scenarios: Home renders, the email capture form's "Last name" field stays within the viewport (regression test), Map renders basemap + markers, Explore renders, My Rome renders, tapping a marker opens its place card, the full Directions flow (locate → select place → get route → route line drawn → live tracking), and stopping/clearing an active route.

Per the project's working process (see `CONTRIBUTING.md`), this suite must pass in full before any commit.

## Native builds (Capacitor)

The app is wrapped for native distribution via **Capacitor** (`capacitor.config.ts`: app id `com.romanguides.app`, `webDir: 'dist'`). The native projects (`ios/`, `android/`) load the same built web app (`dist/`) inside a native WebView — no app logic in `src/` was changed to add this; geolocation still uses the standard browser `navigator.geolocation` API rather than a native Capacitor plugin (see `docs/Map.md`).

Workflow:

```
npm run cap:sync      # build the web app, then copy it into both native projects
npm run cap:ios        # cap:sync, then open the project in Xcode
npm run cap:android    # cap:sync, then open the project in Android Studio
```

Building the actual native binaries requires the respective native toolchain: Xcode (macOS only) for iOS, Android Studio/Gradle for Android. Location permission strings are already declared: `NSLocationWhenInUseUsageDescription` in `ios/App/App/Info.plist`, and `ACCESS_COARSE_LOCATION`/`ACCESS_FINE_LOCATION` in `android/app/src/main/AndroidManifest.xml`.

### How updates reach users

Once distributed via an app store, the web bundle is baked into the native binary at build time — it is **not** fetched live. Any change under `src/`, including a content-only update (new/edited places, guides, etc. — see `docs/GoogleSheets.md`), requires: rebuild web → `npm run cap:sync` → rebuild the native binary → submit to the App Store / Play Store → pass review → users update the app. There is currently no OTA/live-update mechanism and no remote content fetching — content is compiled into the bundle just like it is for the web build today.

### Recommended workflow for native changes

1. Develop and iterate in the browser first (`npm run dev`) — fastest feedback loop.
2. `npm run build`, then `npm run cap:sync` to push the build into both native projects.
3. Build and test in Xcode/Android Studio (simulator/emulator, then a real device) in addition to the existing Playwright + manual mobile web testing from `CONTRIBUTING.md`, since a native WebView can behave subtly differently from a browser.
4. Before a store release, bump the version in all three places that must be kept in sync manually — there is no shared-versioning tooling yet: `package.json` (`version`), iOS `CFBundleShortVersionString`/`CFBundleVersion` (Xcode project settings), Android `versionName`/`versionCode` (`android/app/build.gradle`).

### Long-term maintenance implications

- Signing material (iOS provisioning profiles/certificates, an Android keystore) will be long-lived secrets once created — `.gitignore` already excludes common patterns (`*.jks`, `*.keystore`, `*.mobileprovision`, `*.p12`) so they are never committed.
- Native builds are manual for now (no CI) — the same gap already tracked for the web build.
- The installed native app size will exceed the ~1.8 MB web bundle by the Capacitor/WebView runtime overhead (typically tens of MB).
- Content-update velocity is slower than the current pure-web deployment: a Google Sheets content refresh that used to take effect on the next page load now requires a full store release cycle. If this becomes a real bottleneck, the fix is a separate future project (e.g. fetching content JSON remotely instead of bundling it) — tracked in `ROADMAP.md`, not implemented as part of this integration.
