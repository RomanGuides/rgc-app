import { test, expect, type Page } from '@playwright/test';

// The user's own "me" location pin (📍) is also a `.maplibregl-marker` and,
// once "Use my location" has run, can sort before real place markers in DOM
// order — it has no click handler, so `.first()` alone can silently grab it
// instead of an actual place. Always exclude it explicitly.
function placeMarkers(page: Page) {
  return page.locator('.maplibregl-marker').filter({ hasNotText: '📍' });
}

// Home and Explore tabs were removed in the redesign's nav-shell phase
// (5 tabs → 3: Rome, Experiences, Saved). Home's content is staged for reuse
// elsewhere (email banner → Experience Detail) — re-add an equivalent test
// once that phase lands. Explore's browsing was superseded by Search (below).

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

test('Marker popup: clicking a place marker opens its card', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1000);
  await placeMarkers(page).first().click();
  await expect(page.getByRole('button', { name: /Walk there/ })).toBeVisible();
});

test('Directions: Walk there draws a route and shows the Directions bar', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Use my location/ }).click();
  await expect(page.getByRole('button', { name: /Located/ })).toBeVisible();

  await placeMarkers(page).first().click();
  await page.getByRole('button', { name: /Walk there/ }).click();

  await expect(page.getByRole('button', { name: /Stop Route/ })).toBeVisible();
  await expect(page.getByText(/min/)).toBeVisible();
});

test('Search: typing filters results and selecting one opens its place card', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Search Rome/ }).click();
  await expect(page.getByText(/results|All places/)).toBeVisible();

  await page.getByPlaceholder(/Search places/).fill('colosseum');
  await expect(page.getByText('Colosseum', { exact: true })).toBeVisible();

  await page.getByText('Colosseum', { exact: true }).click();
  await expect(page.getByRole('button', { name: /Walk there/ })).toBeVisible();
});

test('Clear Route: Stop Route removes the Directions bar', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Use my location/ }).click();
  await expect(page.getByRole('button', { name: /Located/ })).toBeVisible();

  await placeMarkers(page).first().click();
  await page.getByRole('button', { name: /Walk there/ }).click();
  await expect(page.getByRole('button', { name: /Stop Route/ })).toBeVisible();

  await page.getByRole('button', { name: /Stop Route/ }).click();
  await expect(page.getByRole('button', { name: /Stop Route/ })).not.toBeVisible();
});
