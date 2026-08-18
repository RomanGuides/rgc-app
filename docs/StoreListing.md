# Store listing copy — Google Play

Draft copy for the Play Console store listing, written from what the app actually does (see `CHANGELOG.md`/`RELEASE_NOTES.md`) — nothing invented. Character counts are Google Play's actual limits. Update this file whenever the listing text changes, so it stays the single source of truth instead of living only inside Play Console.

## App name (max 30 characters)

```
Roman Guides Companion
```
(22 characters)

## Short description (max 80 characters)

```
Rome, from people who live here — 89 real places, real guides, real tours.
```
(74 characters)

## Full description (max 4000 characters)

```
Rome, from people who live here.

Roman Guides Companion is the official app of Roman Guides, a real, licensed local travel agency in Rome — not a generic listings app. Every place, tour, and guide inside comes from people who actually live and work in this city.

WHAT'S INSIDE

★ 89 handpicked places — restaurants, pizza, pasta, gelato, rooftop bars, cocktail bars, and unmissable sights, all personally chosen by our local guides. No paid placements, no algorithm — just the places we actually send our friends to.

★ A real map, not a list — browse by category, search by name or neighbourhood, and get real walking directions with live distance and ETA.

★ Save your favourites — build your own shortlist as you go, sorted automatically by how close you are.

★ Book real experiences, right in the app — Classic Tours, Food Tours, Cooking Classes, and full-day trips to Pompeii and beyond. See what's included, meeting points, and prices before you book — no surprises.

★ Meet your guides — real people, real bios, real photos. Eni, Arjan, Giovanni, Realda, and Said are the guides you'll actually meet in Rome.

★ No account needed — open the app and start exploring immediately. Your saved places live on your device, nothing more.

★ Rated 5.0 by over 10,000 travelers on Google and TripAdvisor.

Whether it's your first time in Rome or your fifth, Roman Guides Companion is built to feel like a local friend showing you around — not another booking platform.
```
(~1,400 characters)

## Category

**Travel & Local** (Google Play's standard category for this kind of app).

## Content rating

Google determines this via their IARC questionnaire inside Play Console (no violence, no mature content, location access disclosed) — expect **Everyone** based on actual app content, but the questionnaire itself is what officially sets it, not this doc.

## Notes for whoever fills in Play Console

- **Screenshots**: needed fresh, post-brand-evolution (2026-08-17) — see `ROADMAP.md`'s note. Not yet captured.
- **Feature graphic** (1024×500px banner) and **app icon** (512×512px): not yet produced — check with the founder's brand assets first (`src/assets/brand/`) before designing a new one from scratch.
- **Data Safety form**: fill in based on what the app actually does — location (for distance sorting/directions), no accounts, no analytics/tracking, third parties are Bokun (booking/payment) and OpenRouteService (directions). Cross-check against `src/config/legal.ts` so the two don't drift apart.
- **Privacy policy URL**: Play Console requires a public URL, not just an in-app screen — the current Legal & About screen is in-app only (`src/features/legal/LegalScreen.tsx`); a publicly reachable URL (e.g. a page on romanguides.com) will be needed too.
