# Routing (Walking Directions)

This document describes the current implementation of the "Walking Directions" feature: getting a route from the user's location to a selected place, drawing it on the map, and tracking progress along it. See `docs/Map.md` for how the route is rendered.

## Provider

Directions are computed by **OpenRouteService (ORS)**, specifically its walking-directions endpoint. Configuration lives in `src/config/routing.config.ts`: the ORS endpoint URL, the API key (read from an environment variable, never hardcoded), and constants for average walking speed and the arrival-detection threshold.

## Request

Triggered from `src/features/map/DirectionsBar.tsx` via `startWalkingDirections.ts`, which:
1. Reads the user's current location (from the store, populated by `useGeolocation`) and the selected place's `lat`/`lng`.
2. Sends a `POST` request to `https://api.openrouteservice.org/v2/directions/foot-walking/geojson`, with the raw API key in the `Authorization` header and a body of `{ coordinates: [[userLng, userLat], [placeLng, placeLat]] }` — ORS expects `[lng, lat]` order, not `[lat, lng]`.

## Response

The response is a GeoJSON `FeatureCollection`. The code reads:
- `features[0].geometry.coordinates` — a `LineString`, an array of `[lng, lat]` pairs, used directly as the route line's GeoJSON geometry.
- `features[0].properties.summary.distance` and `.duration` — used for the initial ETA/distance display.

## State

A successful response is stored in the Zustand store as `activeRoute` (`src/store/usePlacesStore.ts`), holding at minimum the route geometry, the destination place, and the initial distance/duration summary. Setting/clearing `activeRoute` is what `MapView.tsx`'s `useEffect` (see `docs/Map.md`) reacts to for drawing/removing the route line and dimming non-destination markers.

## Live tracking during a route

`src/features/map/useRouteTracking.ts` runs while a route is active:
- It does **not** call ORS again as the user moves. Instead, on every update to the user's live location (from `useGeolocation`'s `startWatching()`), it recalculates the remaining straight-line distance/duration itself, using a haversine helper (`distMeters()` in `src/utils/`) against the destination coordinates.
- When the remaining distance drops below `ARRIVAL_THRESHOLD_METERS` (25 meters), it treats the user as arrived: the route is automatically cleared and `arrivalMessageVisible` is set true on the store for 2 seconds (rendered as a toast), then hidden again.

This means the displayed distance/ETA after the initial request is a local approximation (straight-line, not the original walking-path shape), not a live re-routed ORS call — acceptable for the "am I getting close" use case this feature targets, but not a turn-by-turn navigation replacement.

## Stopping a route

The "Stop Route" control (and the automatic arrival-clear above) both just clear `activeRoute` on the store, which `MapView.tsx` reacts to the same way as a normal state change — no separate "cancel request" logic exists since ORS is a single request/response call, not a stream.

## Error handling

If the ORS request fails (network error, non-2xx response, missing API key), `startWalkingDirections.ts` surfaces a failure state without setting `activeRoute`, so the map and markers remain in their normal (non-route) state — there is no retry logic or offline queueing.
