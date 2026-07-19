import { test, expect } from '@playwright/test';

// Drives the real production build in a real browser -- unlike the 217
// vitest unit tests (pure logic, no rendering), this is the only automated
// check that the actual form -> generate -> render pipeline works, and that
// this session's destination-autocomplete, zip-code-fallback, and
// print-button features work as real user interactions, not just as
// isolated function calls.

test.describe('Trip generation flow', () => {
  test('destination autocomplete -> generate -> packing list renders', async ({ page }) => {
    await page.goto('/');

    const destInput = page.getByPlaceholder(/e\.g\., London/i);
    await destInput.fill('Par');

    // Debounced (300ms) suggestions dropdown, backed by a real Open-Meteo
    // geocoding search -- not mocked.
    const listbox = page.locator('ul[role="listbox"]');
    await expect(listbox).toBeVisible({ timeout: 10000 });
    await expect(listbox.locator('li').first()).toContainText('Paris');

    await destInput.press('ArrowDown');
    await destInput.press('Enter');
    // Selection writes the safe "City, Country" format, not the richer
    // dropdown label -- see the App.jsx commit fixing the Montjean-sur-Loire
    // mis-geocode for why.
    await expect(destInput).toHaveValue('Paris, France');

    await page.getByRole('button', { name: 'Generate Optimized List' }).click();

    await expect(page.getByRole('heading', { name: 'Your Optimized List' })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Suitcase Optimization').first()).toBeVisible();
  });

  test('postal code Open-Meteo does not recognize resolves via Nominatim fallback', async ({ page }) => {
    await page.goto('/');

    // Open-Meteo's geocoder returns zero results for UK-style postcodes;
    // this only passes if the live Nominatim fallback in api.js actually
    // resolves it to real coordinates and weather comes back.
    await page.getByPlaceholder(/e\.g\., London/i).fill('SW1A 1AA');
    await page.getByRole('button', { name: 'Generate Optimized List' }).click();

    await expect(page.getByRole('heading', { name: 'Your Optimized List' })).toBeVisible({ timeout: 20000 });
  });

  test('print button triggers window.print without throwing', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/e\.g\., London/i).fill('Tokyo');
    await page.getByRole('button', { name: 'Generate Optimized List' }).click();
    await expect(page.getByRole('heading', { name: 'Your Optimized List' })).toBeVisible({ timeout: 20000 });

    // Stub window.print so headless Chromium doesn't hang on a native
    // print dialog with nothing available to dismiss it.
    await page.evaluate(() => { window.print = () => { window.__printed = true; }; });
    await page.getByRole('button', { name: 'Print / Export' }).click();
    expect(await page.evaluate(() => window.__printed)).toBe(true);
  });

  test('delete-all-data shows an in-app confirm dialog, not a native confirm()', async ({ page }) => {
    let nativeDialogFired = false;
    page.on('dialog', async (dialog) => { nativeDialogFired = true; await dialog.dismiss(); });

    await page.goto('/');
    await page.getByRole('button', { name: 'Delete All My Data' }).click();

    await expect(page.getByRole('dialog')).toContainText('Delete all data?');
    expect(nativeDialogFired).toBe(false);

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});
