import { test, expect } from '@playwright/test';
import { seedAuth } from '../tests/e2e/helpers';

test('Govern rules enforce, and Observe telemetry + Applications sub-view render', async ({ page }) => {
  await seedAuth(page);

  // --- Govern: rules render, Enforce flips a status badge ---
  await page.goto('/#/govern', { waitUntil: 'domcontentloaded' });

  const rows = page.locator('table tbody tr');
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeGreaterThan(0);

  const unenforcedBadge = page.getByText(/^Unenforced$/i);
  const enforcedBadge = page.getByText(/^Enforced$/i);
  const enforcedBefore = await enforcedBadge.count();

  const enforceButton = page.getByRole('button', { name: /^Enforce$/i }).first();
  await expect(enforceButton).toBeVisible();
  await enforceButton.click();

  await expect
    .poll(async () => enforcedBadge.count())
    .toBeGreaterThan(enforcedBefore);
  void unenforcedBadge;

  // --- Observe: telemetry region renders, Applications tab shows app cards ---
  await page.goto('/#/observe', { waitUntil: 'domcontentloaded' });

  const telemetryHeading = page.getByText(/Latency by region/i);
  await expect(telemetryHeading).toBeVisible();

  await page.getByRole('button', { name: /^Applications$/i }).click();

  const appHeading = page.getByText(/^Applications$/i).last();
  await expect(appHeading).toBeVisible();
  // at least one app card renders with real engine-derived content
  await expect(page.getByText(/Workloads/i).first()).toBeVisible();
});
