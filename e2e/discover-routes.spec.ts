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

  const estate = page.locator('[data-tour="discover-estate"]');
  const routesTile = estate.locator('> div').filter({ hasText: 'Routes' });
  await expect(routesTile).toHaveCount(1);
  await expect(routesTile).toContainText(String(counts.routes));

  const gatewaysTile = estate.locator('> div').filter({ hasText: 'Gateways' });
  await expect(gatewaysTile).toContainText(String(counts.gateways));
});
