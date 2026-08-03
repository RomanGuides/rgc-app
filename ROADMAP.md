# Roadmap

Future work under consideration, grouped by priority. Nothing in this document is implemented — it exists to track deferred decisions and known gaps so they aren't lost or rediscovered from scratch. Per `CONTRIBUTING.md`, anything here should be discussed before implementation begins.

## High priority

- **CI/CD pipeline.** No `.github/workflows` or equivalent exists. At minimum: run `npm run build` and `npm run test:e2e` automatically on every push/PR, so a broken build or failing test can't reach `main` unnoticed.
- **Hosting/deployment configuration.** No hosting target (Netlify, Vercel, static bucket, etc.) is configured. `dist/` is currently published manually, if at all.
- **Move the OpenRouteService API key server-side before any public store launch.** The key lives client-side today (`src/config/routing.config.ts`), fine for local/private testing, but once the app is distributed via the App Store/Play Store it ships inside the public binary, extractable by anyone — a real cost/abuse risk at public scale. Needs a small proxy/backend before a real public launch.
- **App Store / Play Store submission.** The native wrapper exists (`ios/`, `android/`, via Capacitor — see `docs/Deployment.md`), but no developer accounts, signing, or store listings have been set up yet. Real next step whenever store distribution is prioritized; needs its own discussion given the account/compliance work involved (privacy policy, Data Safety form, screenshots, etc.).

## Medium priority

- **Content update workflow.** Updating place/guide/experience data currently requires manually re-running an external export script and hand-copying JSON into this repo (see `docs/GoogleSheets.md`). Worth revisiting once content changes often enough for the manual step to become a bottleneck — this gets more pressing once the app is store-distributed, since a content-only update would then also require a full native rebuild + store review to reach users (see `docs/Deployment.md`).
- **Bundle size / code-splitting.** Total `dist/` output is ~1.8 MB, with the main JS chunk (~1.3 MB) as a single bundle. Route- or tab-based code-splitting (e.g. lazy-loading the Map tab's MapLibre dependency) could meaningfully reduce initial load time.
- **Unify `UserLocation` types.** `src/store/usePlacesStore.ts` and `src/hooks/useGeolocation.ts` each define their own `UserLocation` interface. They're structurally identical today but not shared, so they can silently drift apart. Worth consolidating into one shared type once either file changes for another reason.
- **Dependency review.** TypeScript has a new major version available (project is currently pinned to `~6.0.2`); worth a deliberate, tested upgrade pass rather than an incidental one. No other dependency was found duplicated or clearly obsolete as of this writing.

## Low priority

- **`Collection` entity.** A `Collection` type is defined in `src/data/types.ts` with a corresponding (currently unused) `collectionsService.ts` stub removed in the v1.0.0 cleanup — no JSON data, no UI. If a themed "Collections" browsing mode (grouping places beyond category/tier) is ever wanted, this is the natural starting shape; if not, the type itself is a candidate for removal.
- **Settings screen.** Not present in any planning document or the codebase today, and explicitly confirmed as out of scope during this maintenance pass. Listed here only so a future decision to add one is deliberate, not assumed.
- **`maptiler`/`mapbox` map providers.** Defined as inactive options in `src/config/mapProvider.config.ts`, pending a post-launch review of whether OSM raster tiles remain sufficient (styling, rate limits, attribution requirements).
