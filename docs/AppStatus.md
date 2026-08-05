# Roman Guides Companion — App Status (for design continuity)

**Last updated: 2026-08-06.** This is a point-in-time snapshot for handing off to design work happening outside this codebase — it summarizes what's actually built and shipped versus what's still open, so design decisions stay grounded in reality instead of an earlier plan. It is not a maintained doc: if you're reading this much later, treat `CHANGELOG.md`, `RELEASE_NOTES.md`, and `ROADMAP.md` in the repo as the sources of truth, and ask for a fresh version of this file instead of trusting an old one.

## What this app is

Roman Guides Companion is a mobile app (Capacitor-wrapped web app, real native iOS/Android binaries) for a boutique Rome tour company. Three tabs: **Rome** (map + place discovery), **Experiences** (bookable tours, guides, testimonials, story), **Saved** (shortlist). It went through a substantial visual/structural redesign in the first days of August 2026 (nav shell cut from 5 tabs to 3, every major screen rebuilt); that redesign is what's described below, not the original v1.0.0 baseline.

## Shipped and working

**Rome tab** — full-bleed map (MapLibre GL, real OpenStreetMap tiles, 89 real places) with a persistent draggable bottom sheet (three heights: peek/resting/full, real spring physics, not a CSS transition). Category filter popover with custom outline icons. Real-time full-screen search with "did you mean" suggestion pills when nothing matches. Walking directions with a live route line, ETA, and arrival detection. Explicit handling for denied-location (by-neighbourhood list instead of a blank "nearest to you") and offline (banner + neutral map background instead of broken grey tiles).

**Place screen** — one full-screen template for every place (no more separate premium/utility card types). Save toggle, free-text arrival note, category-specific placeholder photo when a place has no real image (never the marker color, which reads as an error state for red categories like pasta/restaurant).

**Experiences tab** — masthead, all seven bookable tours, Meet the Guides, guest quotes, Our Story (the founder's real copy, not placeholder text — this also absorbed content that used to live on the old My Rome tab).

**In-app booking — fully working, including real payment.** Tapping a tour's booking action opens Bokun's checkout inside a full-screen in-app view (no browser handoff, no address bar). This was finished and debugged this week: it now uses Bokun's actual official embed mechanism (an earlier version used a bare iframe, which silently broke past the "add to cart" step — root-caused via live on-device debugging, documented in detail in `docs/BokunIntegration.md`). **A real booking with a real European card, including 3-D Secure, was completed end-to-end on a physical Android device on 2026-08-05.** The same verification still needs doing on iOS once a small native gap is closed there (see Known gaps below) — no reason to expect a different result, just unverified.

The checkout view has a proper loading state (skeleton + progress bar, never a blank screen), an error state with three recovery actions (retry / open in system browser / contact support), a domain/lock trust row so the person entering a card has some visible signal the page is real, and closes cleanly via an X button or the Android hardware back button.

**Saved tab** — just the shortlist now: title, count, list sorted by distance.

**Real-device bugs found and fixed this week** (none of these were catchable by browser testing or the emulator, only a physical phone): a Bokun booking flow blocker (above), the app freezing on `window.alert()` inside the native WebView, two separate app-freeze (ANR) bugs from GPS-tick-driven re-renders during an active walking route, a geolocation accuracy regression, and — most recently — two map layout overlaps: the zoom control rendering underneath the status bar/battery icons, and the category filter button getting visually covered by the location button when the bottom sheet is dragged to its tallest position.

## Known gaps / open risk (worth knowing before proposing new design work)

- **iOS is behind Android.** This whole project has been built and tested without a Mac/Xcode available. The native wrapper exists and builds, but a couple of small native-code fixes that exist on Android (handling a popup opened from inside the booking widget, e.g. for 3-D Secure/PayPal/Apple Pay) don't have an iOS equivalent yet, and the real-card payment test above hasn't been repeated on iOS. Any design work assuming iOS parity with what's described here as "verified" should flag that iOS verification is still pending.
- **App Store screenshots are stale.** Anything captured before this week's redesign (old nav shell, old screens, no in-app booking) no longer reflects the app and shouldn't be reused for a store listing.
- **Support contact address is a placeholder.** The booking error state's "Contact us" action points at a `mailto:` placeholder, not a real monitored address yet.
- **No native REST-API Bokun integration** (i.e., a fully custom-branded checkout UI instead of Bokun's own widget look) — this was researched in depth and deliberately deferred, not forgotten. The current embedded-widget approach already gets full in-app booking at zero backend/payment-compliance cost; a fully custom checkout UI would require standing up a backend and taking on PCI/payment operational responsibility, which wasn't judged worth it at current booking volume. If there's ever a strong design reason to want pixel-level control over the checkout screens specifically (not just the surrounding app), that's the trade-off to revisit — see `docs/BokunIntegration.md`.
- **No CI/CD, no hosting configured, no App/Play Store submission started yet** — purely operational, not a design concern, but relevant to any "when can this ship" conversation.

## Where to look for more detail

- `RELEASE_NOTES.md` — the narrative version of what shipped and when.
- `CHANGELOG.md` — granular, dated entries for every change, including exact root causes for the real-device bugs mentioned above.
- `ROADMAP.md` — deferred/future work, grouped by priority, with the reasoning for each deferral.
- `docs/BokunIntegration.md` — the full booking-integration story: options considered, why the embedded widget was chosen, and the detailed "Go to cart" bug investigation and fix.
- `docs/parked-content.md` — copy/content that existed before the redesign but didn't fit anywhere in the new structure (kept here rather than deleted, in case it's wanted again).
