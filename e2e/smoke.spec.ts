import { test, expect } from '@playwright/test';
import { seedAuth } from '../tests/e2e/helpers';

test('boots to Discover, nav shows six sections, attach works on Connect', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/');
  await expect(page).toHaveTitle(/Cloud Connect/);
  for (const l of ['Discover', 'Connect', 'Govern', 'Observe', 'Cost', 'AI Fabric'])
    await expect(page.getByRole('link', { name: l })).toBeVisible();
  // Discover is a read view of the unified estate — no attach control here.
  // The rebuilt Discover tree exposes Expand/Collapse controls (the old
  // All/Network/AI lens chips are gone) and Private/Public path badges.
  await expect(page.getByRole('button', { name: /^Expand all$/i })).toBeVisible();
  await expect(page.getByText(/^(Private|Public)$/).first()).toBeVisible();

  // Attach now lives on the Connect on-ramp panel; an attach persists a
  // visible state change (the active on-ramp count going up).
  await page.goto('/#/connect', { waitUntil: 'domcontentloaded' });
  const activeCount = page.getByText(/^\d+ active$/);
  const activeBefore = parseInt((await activeCount.textContent()) ?? '0', 10);
  const attachButton = page.getByRole('button', { name: /^Attach$/i }).first();
  await expect(attachButton).toBeVisible();
  await attachButton.click();
  await expect
    .poll(async () => parseInt((await activeCount.textContent()) ?? '0', 10))
    .toBeGreaterThan(activeBefore);
});
