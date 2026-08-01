import { test, expect, type Page } from '@playwright/test';

// The user's own "me" location pin (📍) is also a `.maplibregl-marker` and,
// once "Use my location" has run, can sort before real place markers in DOM
// order — it has no click handler, so `.first()` alone can silently grab it
// instead of an actual place. Always exclude it explicitly.
function placeMarkers(page: Page) {
  return page.locator('.maplibregl-marker').filter({ hasNotText: '📍' });
}

test('Home tab renders', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Home/ }).click();
  await expect(page.getByText('Meet your trusted Rome travel agency.')).toBeVisible();
});

test('Home: Last name field in the email capture form stays within the viewport', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Home/ }).click();
  const lastNameBox = await page.getByPlaceholder('Last name (optional)').boundingBox();
  const viewportWidth = page.viewportSize()!.width;
  expect(lastNameBox).not.toBeNull();
  expect(lastNameBox!.x + lastNameBox!.width).toBeLessThanOrEqual(viewportWidth);
});

test('Map tab renders with markers and basemap', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('.maplibregl-marker').first()).toBeVisible();
});

test('Explore tab renders', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Explore/ }).click();
  await expect(page.getByText(/places curated by locals/)).toBeVisible();
});

test('My Rome tab renders', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /My Rome/ }).last().click();
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
