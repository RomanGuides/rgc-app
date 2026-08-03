import { test, expect, type Page } from '@playwright/test';

// The user's own "me" location pin (📍) is also a `.maplibregl-marker` and,
// once "Use my location" has run, can sort before real place markers in DOM
// order — it has no click handler, so `.first()` alone can silently grab it
// instead of an actual place. Always exclude it explicitly.
function placeMarkers(page: Page) {
  return page.locator('.maplibregl-marker').filter({ hasNotText: '📍' });
}

// Home and Explore tabs were removed in the redesign's nav-shell phase
// (5 tabs → 3: Rome, Experiences, Saved). Their content is staged for reuse
// elsewhere (Home's email banner → Experience Detail; Explore's browsing →
// the new Search screen) — re-add equivalent tests once those phases land.

test('Rome tab (default) renders with markers and basemap', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('.maplibregl-marker').first()).toBeVisible();
});

test('Saved tab renders', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Saved/ }).last().click();
  await expect(page.getByText('Nothing saved yet')).toBeVisible();
  await expect(page.getByText('Meet the Guides')).toBeVisible();
});

test('Marker popup: clicking a place marker opens its card', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1000);
  await placeMarkers(page).first().click();
  await expect(page.getByRole('button', { name: /Get Directions/ })).toBeVisible();
});

test('Directions: Get Directions draws a route and shows the Directions bar', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Use my location/ }).click();
  await expect(page.getByRole('button', { name: /Located/ })).toBeVisible();

  await placeMarkers(page).first().click();
  await page.getByRole('button', { name: /Get Directions/ }).click();

  await expect(page.getByRole('button', { name: /Stop Route/ })).toBeVisible();
  await expect(page.getByText(/min/)).toBeVisible();
});

test('Clear Route: Stop Route removes the Directions bar', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Use my location/ }).click();
  await expect(page.getByRole('button', { name: /Located/ })).toBeVisible();

  await placeMarkers(page).first().click();
  await page.getByRole('button', { name: /Get Directions/ }).click();
  await expect(page.getByRole('button', { name: /Stop Route/ })).toBeVisible();

  await page.getByRole('button', { name: /Stop Route/ }).click();
  await expect(page.getByRole('button', { name: /Stop Route/ })).not.toBeVisible();
});
