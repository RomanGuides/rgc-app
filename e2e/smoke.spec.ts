import { test, expect, type Page } from '@playwright/test';

// The user's own "me" location pin (📍) is also a `.maplibregl-marker` and,
// once "Use my location" has run, can sort before real place markers in DOM
// order — it has no click handler, so `.first()` alone can silently grab it
// instead of an actual place. Always exclude it explicitly.
function placeMarkers(page: Page) {
  return page.locator('.maplibregl-marker').filter({ hasNotText: '📍' });
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

// Home and Explore tabs were removed in the redesign's nav-shell phase
// (5 tabs → 3: Rome, Experiences, Saved). Home's content is staged for reuse
// elsewhere (email banner → Experience Detail) — re-add an equivalent test
// once that phase lands. Explore's browsing was superseded by Search (below).

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

test('WelcomeScreen: shown on first run, "Not now" dismisses into Rome', async ({ page }) => {
  // Registered after the file-level beforeEach's initScript, so it runs
  // later on the same page load and wins — simulates a genuine first run.
  await page.addInitScript(() => localStorage.removeItem('rgc_saved_places'));
  await page.goto('/');
  await expect(page.getByText('Rome, from people who live here.')).toBeVisible();
  await expect(page.getByRole('button', { name: "Show me what's nearby" })).toBeVisible();

  await page.getByRole('button', { name: 'Not now' }).click();
  await expect(page.getByText('Rome, from people who live here.')).not.toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
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

test('Rome tab (default) renders with markers and basemap', async ({ page }) => {
  await page.goto('/');
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

// The widget div hands off to Bokun's own script (BokunWidgetsLoader.js +
// their BokunWidgets bundle, loaded from widgets.bokun.io/static.bokun.io)
// to render the actual booking iframe — asserting on ITS loaded content
// would depend on that external infrastructure (same class of flakiness as
// the OpenRouteService-backed Directions tests). Only the app's own side of
// the contract is checked here: the placeholder div Bokun's script looks
// for is mounted with the right data-src, and opening/closing works.
test('Experiences: Discover Experience opens the in-app booking widget, close closes it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Experiences/ }).last().click();

  await page.getByRole('button', { name: /Discover Experience/ }).first().click();
  const widget = page.locator('div.bokunWidget');
  await expect(widget).toBeVisible();
  await expect(widget).toHaveAttribute('data-src', /widgets\.bokun\.io/);
  await expect(page.getByText('widgets.bokun.io')).toBeVisible();

  await page.getByRole('button', { name: /Close/ }).click();
  await expect(widget).not.toBeVisible();
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
  await page.waitForTimeout(1000);
  await placeMarkers(page).first().click();
  await expect(page.getByRole('button', { name: /Walk there/ })).toBeVisible();
});

test('Directions: Walk there draws a route and shows the Directions bar', async ({ page }) => {
  await page.goto('/');
  await ensureLocated(page);

  await placeMarkers(page).first().click();
  await page.getByRole('button', { name: /Walk there/ }).click();

  await expect(page.getByRole('button', { name: /Stop Route/ })).toBeVisible();
  await expect(page.getByText(/min/)).toBeVisible();
});

test('Search: typing filters results and selecting one opens its place card', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Search Rome/ }).click();
  // "Nearest to you" replaces "All places" once a location is known — see
  // ensureLocated's comment above on why that may already be true here.
  // .first(): RomeSheet underneath has its own "Nearest to you" heading too.
  await expect(page.getByText(/results|All places|Nearest to you/).first()).toBeVisible();

  await page.getByPlaceholder(/Search places/).fill('colosseum');
  await expect(page.getByText('Colosseum', { exact: true })).toBeVisible();

  await page.getByText('Colosseum', { exact: true }).click();
  await expect(page.getByRole('button', { name: /Walk there/ })).toBeVisible();
});

test('Rome sheet: Legal & About opens from the full-detent footer, back closes it', async ({ page }) => {
  await page.goto('/');
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
  await ensureLocated(page);

  await placeMarkers(page).first().click();
  await page.getByRole('button', { name: /Walk there/ }).click();
  await expect(page.getByRole('button', { name: /Stop Route/ })).toBeVisible();

  await page.getByRole('button', { name: /Stop Route/ }).click();
  await expect(page.getByRole('button', { name: /Stop Route/ })).not.toBeVisible();
});
