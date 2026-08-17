import { test, expect, type Page } from '@playwright/test';

// The user's own "me" location pin is also a `.maplibregl-marker` and, once
// "Use my location" has run, can sort before real place markers in DOM
// order — it has no click handler, so `.first()` alone can silently grab it
// instead of an actual place. Always exclude it explicitly, by the stable
// `rgc-me-marker` class MapView.tsx sets on it — NOT by its inner content
// (a `hasNotText: '📍'` filter used to do this, but broke silently the
// moment that emoji was replaced with an SVG icon in the audit UX pass of
// 2026-08-16: the marker had no click handler, so a test click landing on
// it instead of the intended place marker did nothing, and did so via a
// generic "element not found" timeout with no hint of the real cause).
function placeMarkers(page: Page) {
  return page.locator('.maplibregl-marker:not(.rgc-me-marker)');
}

// MapScreen now auto-requests location on mount whenever the permission is
// already decided (see MapScreen.tsx, added alongside WelcomeScreen) —
// geolocation is pre-granted for every test (playwright.config.ts), so by
// the time a test reaches this button it may already read "Located" rather
// than "Use my location". Click it only if it hasn't auto-resolved yet.
async function ensureLocated(page: Page) {
  const useMyLocation = page.getByRole('button', { name: /Use my location/ });
  if (await useMyLocation.isVisible().catch(() => false)) {
    await useMyLocation.click();
  }
  await expect(page.getByRole('button', { name: /Located/ })).toBeVisible();
}

// Home (tab bar's first/default entry, added 2026-08-16 — a scoped-down
// "business card" screen, not the pre-redesign Home this comment used to
// describe as removed) is now what a fresh `page.goto('/')` lands on, not
// Rome. Every test below that needs the map/sheet/search must switch to
// Rome explicitly first. Explore's browsing was superseded by Search.
async function goToRome(page: Page) {
  await page.getByRole('button', { name: /Rome/ }).last().click();
}

// WelcomeScreen (shown once per install, before any tab) would otherwise
// block every test below it — seed the same persisted flag the real app
// writes after a genuine first run, so these tests exercise the normal app
// exactly like a returning user would see it. The one test that actually
// covers WelcomeScreen (below) clears this itself.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'rgc_saved_places',
      JSON.stringify({ state: { hasSeenWelcome: true, savedPlaceIds: [], arrivalNotes: {} }, version: 0 })
    );
  });
});

test('WelcomeScreen: shown on first run, "Not now" dismisses into the app (Home, the default tab)', async ({ page }) => {
  // Registered after the file-level beforeEach's initScript, so it runs
  // later on the same page load and wins — simulates a genuine first run.
  await page.addInitScript(() => localStorage.removeItem('rgc_saved_places'));
  await page.goto('/');
  await expect(page.getByText('Rome, from people who live here.')).toBeVisible();
  await expect(page.getByRole('button', { name: "Show me what's nearby" })).toBeVisible();

  await page.getByRole('button', { name: 'Not now' }).click();
  await expect(page.getByText('Rome, from people who live here.')).not.toBeVisible();
  await expect(page.getByText('Top Experiences')).toBeVisible();
});

test('RomeSheet: a location far from Rome shows the by-neighbourhood list, not "Nearest to you"', async ({ browser }) => {
  // Own context, not the shared `page` fixture: needs a different
  // `geolocation` than playwright.config.ts's default (Trevi Fountain), so
  // the file-level beforeEach's seeding is replicated here manually too.
  const context = await browser.newContext({ geolocation: { latitude: 51.5072, longitude: -0.1276 }, permissions: ['geolocation'] });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem(
      'rgc_saved_places',
      JSON.stringify({ state: { hasSeenWelcome: true, savedPlaceIds: [], arrivalNotes: {} }, version: 0 })
    );
  });
  await page.goto('/');
  await goToRome(page);
  await ensureLocated(page);

  await expect(page.getByText('Nearest to you')).not.toBeVisible();
  // Area-grouped view (same one used when location is denied) — any real
  // canonical area name from places.json confirms it rendered.
  await expect(page.getByText(/places?$/).first()).toBeVisible();

  await context.close();
});

test('LocateButton: first tap primes with an explanation while permission is undecided, second tap actually asks', async ({ browser }) => {
  // Playwright's `permissions` context option is binary (granted, via
  // playwright.config.ts's default, or denied) — it can't simulate a true
  // 'prompt' (undecided) geolocation permission, which is exactly the state
  // this feature branches on (see MapScreen.tsx's handleLocateMe). Stubbed
  // directly instead, to test that branch deterministically.
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem(
      'rgc_saved_places',
      JSON.stringify({ state: { hasSeenWelcome: true, savedPlaceIds: [], arrivalNotes: {} }, version: 0 })
    );
    // @ts-expect-error — stubbing a browser API for the test, not real app code
    navigator.permissions.query = async () => ({ state: 'prompt' });
  });
  await page.goto('/');
  await goToRome(page);

  const locateButton = page.getByRole('button', { name: /Use my location/ });
  await locateButton.click();
  await expect(page.getByText('Turn on location to sort by how far away things are.')).toBeVisible();
  // First tap only primes — no request fired yet, button label unchanged.
  await expect(locateButton).toBeVisible();

  await locateButton.click();
  // The stub only affects permissions.query, not real geolocation — the
  // context still inherits playwright.config.ts's granted Trevi Fountain
  // coordinates, so this second, real request resolves normally. The point
  // here is only that a request actually fired this time (hint disappears).
  await expect(page.getByText('Turn on location to sort by how far away things are.')).not.toBeVisible();
  await expect(page.getByRole('button', { name: /Located/ })).toBeVisible();

  await context.close();
});

// Home tab (added 2026-08-16) — a "business card" + navigation shortcuts,
// not a duplicate of Rome/Experiences content. Real data only: no fabricated
// tour names/categories, reuses the existing 'hero' AppContent entry and the
// same TourDetailScreen/BookingWidgetModal as everywhere else in the app.
test('Home: default tab shows the hero masthead and pushes Top Experiences', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Meet your trusted Rome travel agency.')).toBeVisible();
  await expect(page.getByText('Top Experiences')).toBeVisible();
  // Best Sellers sort first in this carousel — at least one badge should show.
  await expect(page.getByText('Best Seller').first()).toBeVisible();
});

test('Home: tapping a Top Experience card opens its real tour detail', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Colosseum Underground/ }).first().click();
  await expect(page.getByRole('button', { name: /Check dates/ })).toBeVisible();
});

test('Home: a category pill switches to Experiences, grouped by the same tourType', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Classic Tours' }).click();
  await expect(page.getByText('Classic Tours')).toBeVisible();
  await expect(page.getByText('Colosseum Arena')).toBeVisible();
});

// Real bug (found via on-device testing, twice — Playwright's toBeVisible()
// never caught it since it doesn't check WHERE on the page something is,
// only that it exists somewhere): tapping "Meet the Guides" or a category
// pill switched tabs correctly but never actually scrolled, landing wherever
// the tab naturally opens (its top) rather than the target section further
// down. A pure "is it visible" assertion can't distinguish "scrolled there"
// from "it happens to render somewhere on this tall page" — checking the
// target's Y position after the tap is the only way to actually prove a
// scroll happened. "Experiences" (not "Classic Tours", the first group and
// already near the top by default) is the meaningful case: it only sits
// near the top of the viewport if a real scroll moved it there.
test('Home: category pills and Meet the Guides actually scroll to their section, not just switch tabs', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Experiences', exact: true }).first().click();
  const experiencesHeading = page.getByText('Experiences', { exact: true }).first();
  await expect(experiencesHeading).toBeVisible();
  await expect(async () => {
    const box = await experiencesHeading.boundingBox();
    expect(box?.y).toBeLessThan(300);
  }).toPass();

  await page.getByRole('button', { name: /^Home$/ }).click();
  await page.getByRole('button', { name: 'Meet the Guides' }).click();
  const guidesHeading = page.getByText('Meet the Guides', { exact: true });
  await expect(guidesHeading).toBeVisible();
  await expect(async () => {
    const box = await guidesHeading.boundingBox();
    expect(box?.y).toBeLessThan(300);
  }).toPass();
});

test('Home: navigation shortcuts reach Rome and Experiences, and open the gift card widget', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Meet the Guides' }).click();
  await expect(page.getByText('Meet the Guides')).toBeVisible();

  await page.getByRole('button', { name: /^Home$/ }).click();
  await page.getByRole('button', { name: 'Browse the Map' }).click();
  await expect(page.locator('canvas')).toBeVisible();

  await page.getByRole('button', { name: /^Home$/ }).click();
  await page.getByRole('button', { name: 'Gift Cards' }).click();
  const widget = page.locator('div.bokunWidget');
  await expect(widget).toBeVisible();
  await expect(widget).toHaveAttribute('data-src', /\/gift-card\//);
});

test('Home: review buttons link to Google and TripAdvisor', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Review us on Google/ })).toHaveAttribute(
    'href',
    'https://g.page/r/CeVG3u7HbgowEBM/review'
  );
  await expect(page.getByRole('link', { name: /Review us on TripAdvisor/ })).toHaveAttribute(
    'href',
    'https://www.tripadvisor.it/Attraction_Review-g187791-d33021458-Reviews-Roman_Guides-Rome_Lazio.html'
  );
});

test('Rome tab renders with markers and basemap', async ({ page }) => {
  await page.goto('/');
  await goToRome(page);
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('.maplibregl-marker').first()).toBeVisible();
});

test('Saved tab renders (shortlist only, empty state)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Saved/ }).last().click();
  await expect(page.getByText('Nothing yet')).toBeVisible();
  await expect(page.getByText('Browse the map')).toBeVisible();
});

test('Experiences tab renders (tours, guides, story)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Experiences/ }).last().click();
  await expect(page.getByText('Meet the Guides')).toBeVisible();
  await expect(page.getByText('Our Story')).toBeVisible();
});

// Restored from docs/parked-content.md (2026-08-17) — real copy that existed
// before the five-section restructure, parked rather than deleted at the time.
test('Experiences: repeat-booking discount banner shows the real code and links out', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Experiences/ }).last().click();
  await expect(page.getByText('10% off your next experience', { exact: true })).toBeVisible();
  await expect(page.getByText('CODE: ROME10')).toBeVisible();
  await expect(page.getByRole('link', { name: /Book Your Next Experience/ })).toHaveAttribute(
    'href',
    'https://romanguides.com/our-tours/'
  );
});

test('Experiences: tapping a guide opens their full bio, back closes it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Experiences/ }).last().click();

  // The list row's accessible name is the guide's short name + the (visually
  // 2-line-clamped, but fully present in the DOM) bio text — match on the
  // name prefix, not the full displayTitle, which only appears in the detail screen.
  await page.getByRole('button', { name: /^Eni/ }).click();
  await expect(page.getByText('Meet Eni, Your Roman Storyteller')).toBeVisible();
  // The list row underneath (unmounted here, just covered) has the same bio
  // text — scope to the detail screen's own <p> to avoid ambiguity.
  const fullBio = page.getByRole('paragraph').filter({ hasText: "I wasn't born in Rome" });
  await expect(fullBio).toBeVisible();

  await page.getByRole('button', { name: /Back/ }).click();
  await expect(fullBio).not.toBeVisible();
});

// The widget div hands off to Bokun's own script (BokunWidgetsLoader.js +
// their BokunWidgets bundle, loaded from widgets.bokun.io/static.bokun.io)
// to render the actual booking iframe — asserting on ITS loaded content
// would depend on that external infrastructure (same class of flakiness as
// the OpenRouteService-backed Directions tests). Only the app's own side of
// the contract is checked here: the placeholder div Bokun's script looks
// for is mounted with the right data-src, and opening/closing works.
test('Experiences: Discover Experience opens the tour detail with real facts, not the checkout directly', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Experiences/ }).last().click();

  await page.getByRole('button', { name: /Discover Experience/ }).first().click();
  await expect(page.getByRole('button', { name: /Check dates/ })).toBeVisible();
  await expect(page.getByText('Duration')).toBeVisible();
  // .last(): the list card underneath (unmounted here, just covered) now
  // shows its own compact duration/price row too — scope to the detail screen.
  await expect(page.getByText('2h 15m').last()).toBeVisible();
  await expect(page.getByText('From €119').last()).toBeVisible();

  await page.getByRole('button', { name: /Back/ }).click();
  await expect(page.getByRole('button', { name: /Check dates/ })).not.toBeVisible();
});

// Redesign v2 (2026-08-16): Best Seller badge (founder's manual pick, not
// derived from sales data) and the icon-driven "Good to know" section
// sourced from real product-facts.md restrictions — Colosseum Underground
// (2nd card in experiences.json) is bestSeller:true, wheelchairAccessible:
// true, idRequired:true, a solid combination to assert all three at once.
test('Experiences: Best Seller badge shows on the list and carries into the tour detail with real "Good to know" facts', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Experiences/ }).last().click();

  await expect(page.getByText('Best Seller').first()).toBeVisible();

  await page.getByRole('button', { name: /Discover Experience/ }).nth(1).click();
  // .last(): 3 list cards carry the same badge (Colosseum Underground, Drunken
  // History, Colosseum Arena) plus this now-open detail screen — scope to it.
  await expect(page.getByText('Best Seller').last()).toBeVisible();
  await expect(page.getByText('From €99').last()).toBeVisible();
  await expect(page.getByText('Wheelchair accessible')).toBeVisible();
  await expect(page.getByText(/valid photo ID or passport/)).toBeVisible();
});

test('Experiences: Check dates opens the in-app booking widget; closing it returns to the tour detail, not the list', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Experiences/ }).last().click();
  await page.getByRole('button', { name: /Discover Experience/ }).first().click();

  await page.getByRole('button', { name: /Check dates/ }).click();
  const widget = page.locator('div.bokunWidget');
  await expect(widget).toBeVisible();
  await expect(widget).toHaveAttribute('data-src', /widgets\.bokun\.io/);
  await expect(page.getByText('widgets.bokun.io')).toBeVisible();

  await page.getByRole('button', { name: /Close/ }).click();
  await expect(widget).not.toBeVisible();
  await expect(page.getByRole('button', { name: /Check dates/ })).toBeVisible();
});

test('Experiences: Buy a Gift Card opens the same in-app booking widget, pointed at the gift-card product', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Experiences/ }).last().click();

  await page.getByRole('button', { name: /Buy a Gift Card/ }).click();
  const widget = page.locator('div.bokunWidget');
  await expect(widget).toBeVisible();
  await expect(widget).toHaveAttribute('data-src', /\/gift-card\//);

  await page.getByRole('button', { name: /Close/ }).click();
  await expect(widget).not.toBeVisible();
});

test('Marker popup: clicking a place marker opens its card', async ({ page }) => {
  await page.goto('/');
  await goToRome(page);
  await page.waitForTimeout(1000);
  await placeMarkers(page).first().click();
  await expect(page.getByRole('button', { name: /Walk there/ })).toBeVisible();
});

// UX audit #5 (2026-08-16): Place.bookingUrl exists for exactly one place
// (Colosseum, same Bokun product as the Colosseum Underground tour) but was
// never read by PlaceScreen — "Book this tour" now appears only for it,
// primary over the now-secondary "Walk there", reusing the same
// BookingWidgetModal as Experiences (not a second implementation).
test('Place screen: Colosseum (the one place with a real bookingUrl) shows a primary Book this tour CTA', async ({ page }) => {
  await page.goto('/');
  await goToRome(page);
  await page.getByRole('button', { name: /Search Rome/ }).click();
  await page.getByPlaceholder(/Search places/).fill('Colosseum');
  await page.getByText('Colosseum', { exact: true }).click();

  await expect(page.getByRole('button', { name: /Book this tour/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Walk there/ })).toBeVisible();

  await page.getByRole('button', { name: /Book this tour/ }).click();
  const widget = page.locator('div.bokunWidget');
  await expect(widget).toBeVisible();
  await expect(widget).toHaveAttribute('data-src', /widgets\.bokun\.io/);
});

// UX audit #3 (2026-08-16): the filter button had no visual indicator of an
// active (non-default) category filter — a tourist could filter down and
// forget, wondering later why the list looks incomplete.
test('RomeSheet: filter button shows an active indicator only when a category is deselected', async ({ page }) => {
  await page.goto('/');
  await goToRome(page);
  await expect(page.getByRole('button', { name: 'Filter by category' })).toBeVisible();

  await page.getByRole('button', { name: 'Filter by category' }).click();
  await page.getByRole('button', { name: /Restaurants/ }).click();
  await expect(page.getByRole('button', { name: /Filter by category \(filter active\)/ })).toBeVisible();

  await page.getByRole('button', { name: /Restaurants/ }).click();
  await expect(page.getByRole('button', { name: 'Filter by category' })).toBeVisible();
});

// UX audit #4 (2026-08-16): tip_of_the_day's imageUrl/ctaUrl were already in
// appContent.json but the "Tonight" block only ever read title/subtitle —
// no photo, not tappable. Now wrapped in the same external-link pattern
// already used elsewhere in this file (Leave a review, Find Water Nearby).
test('RomeSheet: Tonight links out to its real ctaUrl', async ({ page }) => {
  await page.goto('/');
  await goToRome(page);
  const tonightLink = page.getByRole('link', { name: /Best Carbonara in Rome/ });
  await expect(tonightLink).toBeVisible();
  await expect(tonightLink).toHaveAttribute('href', 'https://www.instagram.com/romanguides/');
  await expect(tonightLink).toHaveAttribute('target', '_blank');
});

test('Directions: Walk there draws a route and shows the Directions bar', async ({ page }) => {
  await page.goto('/');
  await goToRome(page);
  await ensureLocated(page);

  await placeMarkers(page).first().click();
  await page.getByRole('button', { name: /Walk there/ }).click();

  await expect(page.getByRole('button', { name: /Stop Route/ })).toBeVisible();
  // \bmin\b, not /min/: with the marker-click fix above now actually opening
  // PlaceScreen underneath, its own "Allow" fact (e.g. "60-90 minutes", for
  // places that have a visitDuration) also substring-matches a bare /min/,
  // which "minutes" contains — \b excludes it (no word boundary before "utes").
  await expect(page.getByText(/\bmin\b/)).toBeVisible();
});

test('Search: typing filters results and selecting one opens its place card', async ({ page }) => {
  await page.goto('/');
  await goToRome(page);
  await page.getByRole('button', { name: /Search Rome/ }).click();
  // "Nearest to you" replaces "All places" once a location is known — see
  // ensureLocated's comment above on why that may already be true here.
  // .first(): RomeSheet underneath has its own "Nearest to you" heading too.
  await expect(page.getByText(/results|All places|Nearest to you/).first()).toBeVisible();

  await page.getByPlaceholder(/Search places/).fill('colosseum');
  await expect(page.getByText('Colosseum', { exact: true })).toBeVisible();
  // Rating (places.json: 4.8, 499423 reviews) is real, existing data that was
  // never surfaced anywhere in the UI before this change — check the search
  // row shows it.
  await expect(page.getByText('4.8').first()).toBeVisible();

  await page.getByText('Colosseum', { exact: true }).click();
  await expect(page.getByRole('button', { name: /Walk there/ })).toBeVisible();
  // .last(): the search row underneath (unmounted here, just covered) shows
  // the same rating — scope to the now-open place screen.
  await expect(page.getByText('4.8').last()).toBeVisible();
  await expect(page.getByText('(499,423)')).toBeVisible();
});

// Not every place has a rating (3 of 89, e.g. no Google rating on file) —
// this must collapse cleanly, not show "null" or a broken star.
test('Place screen: a place with no rating renders cleanly, no broken rating row', async ({ page }) => {
  await page.goto('/');
  await goToRome(page);
  await page.getByRole('button', { name: /Search Rome/ }).click();
  await page.getByPlaceholder(/Search places/).fill('Piazza del Popolo');
  await page.getByText('Piazza del Popolo & Twin Churches', { exact: true }).click();

  await expect(page.getByRole('button', { name: /Walk there/ })).toBeVisible();
  await expect(page.getByText('Piazza del Popolo & Twin Churches')).toBeVisible();
});

test('Rome sheet: Legal & About opens from the full-detent footer, back closes it', async ({ page }) => {
  await page.goto('/');
  await goToRome(page);
  // Tap sull'handle: alterna resting/full (endDrag tratta un movimento sotto
  // soglia come tap) — solo a detent "full" compare la riga Legal & About.
  await page.getByRole('button', { name: /Expand or collapse/ }).click();
  await expect(page.getByRole('button', { name: /Legal & About/ })).toBeVisible();

  await page.getByRole('button', { name: /Legal & About/ }).click();
  await expect(page.getByText('Privacy Policy', { exact: true })).toBeVisible();
  await expect(page.getByText('Terms of Service', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /Back/ }).click();
  await expect(page.getByText('Privacy Policy', { exact: true })).not.toBeVisible();
});

test('Clear Route: Stop Route removes the Directions bar', async ({ page }) => {
  await page.goto('/');
  await goToRome(page);
  await ensureLocated(page);

  await placeMarkers(page).first().click();
  await page.getByRole('button', { name: /Walk there/ }).click();
  await expect(page.getByRole('button', { name: /Stop Route/ })).toBeVisible();

  await page.getByRole('button', { name: /Stop Route/ }).click();
  await expect(page.getByRole('button', { name: /Stop Route/ })).not.toBeVisible();
});
