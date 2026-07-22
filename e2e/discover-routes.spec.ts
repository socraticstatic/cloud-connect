import { test, expect } from '@playwright/test';
import { seedAuth } from '../tests/e2e/helpers';

/* Routes as a discovered object type: the Discover estate header shows a
   Routes tile whose figure AGREES with the engine at that moment — a CC
   derivation, never a pinned number. Gateways is asserted alongside because
   this change un-hardcoded it; its displayed figure must not have moved. */
test('Discover shows a Routes estate tile derived from counts()', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const counts = await page.evaluate(
    () =>
      (window as unknown as { CC: { counts: () => { routes: number; gateways: number } } }).CC.counts(),
  );
  expect(counts.routes).toBeGreaterThan(0);
  expect(counts.gateways).toBe(38); // un-hardcoding must not move the figure

  // The Routes and Gateways tiles now live in the "Network" domain section,
  // not a flat row — locate the tile by its label, then assert the sibling
  // value div next to it, so the section split doesn't weaken the check.
  const network = page.getByTestId('estate-network');
  await expect(network).toBeVisible();

  const routesLabel = network.locator('div').filter({ hasText: /^Routes$/ });
  await expect(routesLabel).toHaveCount(1);
  await expect(routesLabel.locator('..')).toContainText(String(counts.routes));

  const gatewaysLabel = network.locator('div').filter({ hasText: /^Gateways$/ });
  await expect(gatewaysLabel).toHaveCount(1);
  await expect(gatewaysLabel.locator('..')).toContainText(String(counts.gateways));
});

/* Task B — Discover reads in three parts: network, cloud, AI workflows.
   Each section must actually be on screen, and a figure inside the network
   section must still agree with the live engine — never a pinned number. */
test('Discover reads in three domains', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/#/discover', { waitUntil: 'domcontentloaded' });

  for (const key of ['network', 'cloud', 'ai']) {
    await expect(page.getByTestId(`estate-${key}`)).toBeVisible();
  }

  const routes = await page.evaluate(
    () => (window as unknown as { CC: { counts(): { routes: number } } }).CC.counts().routes,
  );
  await expect(page.getByTestId('estate-network')).toContainText(String(routes));
});
