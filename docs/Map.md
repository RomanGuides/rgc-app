# Map

This document describes the current implementation of the Map tab (`src/features/map/MapView.tsx` and related files). See `docs/Routing.md` for the Walking Directions feature layered on top of this map.

## Basemap

The map renders raw **OpenStreetMap raster tiles** via **MapLibre GL JS**, configured in `src/config/mapProvider.config.ts`. `MAP_PROVIDER` is currently hardcoded to `'osm'` — this is the only active option. Two other providers (`maptiler`, `mapbox`) are defined in the same config file but are explicitly inactive: both require an API key and are deferred pending a post-launch review, per the comment in that file.

## Style-loading guard

`MapView.tsx` sets up the map's layers (clustering + the directions route line, see below) in a function `ensureLayers()`, called both from MapLibre's `'load'` event and from an 800ms fallback `setTimeout` (belt-and-suspenders for slow style loads on some browsers/networks). This fallback timer can fire *before* the style has actually finished loading, and calling `map.addSource()` at that point throws `"Style is not done loading"`. The fix is a guard clause:

```ts
if (!map.isStyleLoaded()) {
  map.once('load', ensureLayers);
  return;
}
```

`ensureLayers()` also tracks a `layersReady` flag so it only runs its setup once, regardless of how many events/timers call it.

## Clustering

`setupClusterLayers()` (called from `ensureLayers()`) adds a single GeoJSON source named `'places'` with MapLibre's native clustering enabled (`cluster: true`, plus `clusterMaxZoom`/`clusterRadius` from `src/config/app.config.ts`), and the standard cluster-circle + cluster-count symbol layers on top of it.

Individual place markers are **not** MapLibre `Marker`s tied 1:1 to every place — they are synced from the cluster source's "leaf" (unclustered) features via `syncIndividualMarkers()`, which calls `map.querySourceFeatures('places', { filter: ['!', ['has', 'point_count']] })` and reconciles a set of HTML DOM `Marker` elements against that result. This runs on the map's `'sourcedata'`, `'moveend'`, and `'zoomend'` events, so markers appear/disappear correctly as the user pans/zooms in and out of clusters.

Each place marker's color/emoji is driven by `CATEGORY_META` (`src/config/categories.config.ts`); tapping one calls `selectPlace()` on the store, which opens `PlaceBottomSheet` (see `docs/DataModel.md` for the premium/utility tier split that decides which card renders).

## "Me" marker

The user's own location is rendered as a separate DOM marker (📍) added directly (not through the clustering source), with **no click handler** — it's a visual indicator only. This marker is added to the DOM only after `useGeolocation`'s `requestLocation()`/`startWatching()` resolves a position, and it's the reason the Playwright test helper `placeMarkers()` explicitly filters it out (see `docs/Deployment.md`'s testing section) — earlier test runs failed by clicking this marker expecting a place popup.

## Directions route layer

The same `setupClusterLayers()` function also creates the `'active-route'` GeoJSON source and `'active-route-line'` layer used to draw the walking-directions polyline. This is intentional co-location, not an accident — both the clustering setup and the route line depend on the style being fully loaded, so they share the one `ensureLayers()` guard. It also explains why the style-loading race condition above broke both clustering *and* Directions at the same time before it was fixed.

A separate `useEffect` in `MapView.tsx`, keyed on `activeRoute?.destinationId` (not the whole `activeRoute` object — see below), updates this source's data whenever the route's *destination* changes: it draws the line, dims all non-destination place markers to 0.35 opacity, highlights the destination marker, and calls `map.fitBounds()` to frame the full route.

This dependency is deliberately narrow. `updateRouteProgress` (in `useRouteTracking.ts`) creates a new `activeRoute` object on every location update while a route is active (only `remainingDistanceMeters`/`remainingDurationSeconds` change, not the destination). Keying this effect on the whole object meant `fitBounds()` re-ran on every single GPS tick — harmless indoors (few updates), but on a real device outdoors with frequent GPS updates this saturated the render thread badly enough to cause an ANR (app-not-responding) requiring a force-close. Keying on `destinationId` alone fixes this while still correctly re-running when a route starts, changes destination, or is cleared.

## Filtering, search, and geolocation UI (redesign v1, Phase 3)

The old black bar, `AroundMeBar` (category chips + "Around Me" radius filter), and `CategoryFilterBar` were removed and replaced by two new components in `src/features/map/`:

- **`RomeSheet.tsx`** — a persistent, draggable bottom sheet with three detents (peek/resting/full, tap the handle to cycle since drag-via-mouse could not be reliably verified in a desktop browser — real touch-drag support is still there but needs on-device confirmation). Contains the search entry field, a category filter popover (reusing `CATEGORY_META`, same filtering, different UI), the "Tonight" editorial pick, "Nearest to you", and — only at the full detent — compact utility rows (Get Around, Emergency, Find Water Nearby) migrated from the old Home tab.
- **`SearchScreen.tsx`** — new, full-screen, real-time filter by name/category/area (no submit button, no debounce). Supersedes the old Explore tab's browsing function.
- **`LocateButton.tsx`** — a floating circular button over the map (top-right), visually replacing `AroundMeBar`'s "Use my location" button; same underlying behavior.

The "Around Me" radius filter is gone entirely (redesign decision): places are no longer filterable by distance, only by category. `filterPlaces.ts` now only filters by `activeCategories`.

Geolocation lifecycle (previously in `AroundMeBar.tsx`) now lives directly in `MapScreen.tsx`: it calls `useGeolocation()`, pushes results into the store via `setUserLocation`, and starts/stops continuous tracking (`startWatching`/`stopWatching`) based on whether `activeRoute` is set.

## Geolocation

`src/hooks/useGeolocation.ts` wraps the browser Geolocation API:
- `requestLocation()` — one-shot `getCurrentPosition`, used for "Use my location" and for centering on load. Falls back to `DEFAULT_ME` (a hardcoded Trevi Fountain coordinate, `src/config/app.config.ts`) if geolocation is unsupported or errors. Uses a 15-second timeout — raised from an original 6 seconds, which reliably timed out (`GeolocationPositionError.code === 3`) on real phones before a first GPS/network fix completed, especially indoors.
- `startWatching()`/`stopWatching()` — a continuous `watchPosition` (`enableHighAccuracy: false`, `maximumAge: 5000`), used while a Directions route is active so the "me" marker and remaining-distance calculation update live (see `docs/Routing.md`). `enableHighAccuracy` was originally `true`, but on a real device with several other apps also requesting high-accuracy location in the background, this contributed to CPU/GPS contention severe enough to trigger an ANR (`Input dispatching timed out`) — lowered to reduce this app's own contribution to that contention, at the cost of slightly less precise live position during a walk.

Real GPS positioning on a phone browser requires a secure context (HTTPS or localhost) — see `docs/Deployment.md` for how this is tested locally.
