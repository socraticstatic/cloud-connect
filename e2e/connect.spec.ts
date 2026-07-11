import { test, expect } from '@playwright/test';
import { seedAuth } from '../tests/e2e/helpers';

test('Connect route renders topology + path table, and Steer moves a flow under AT&T control', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/#/connect', { waitUntil: 'domcontentloaded' });

  // Topology: at least one node rendered from the live scene graph.
  const nodes = page.locator('[data-node]');
  await expect(nodes.first()).toBeVisible();
  expect(await nodes.count()).toBeGreaterThan(0);

  // Path table: rows present.
  const rows = page.locator('table tbody tr');
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeGreaterThan(0);

  const controlledBadge = page.getByText(/AT&T-controlled/i);
  const before = await controlledBadge.count();

  const steerButton = page.getByRole('button', { name: /^Steer$/i }).first();
  await steerButton.click();

  await expect
    .poll(async () => controlledBadge.count())
    .toBeGreaterThan(before);
});
