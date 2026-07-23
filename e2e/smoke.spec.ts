import { test, expect } from '@playwright/test';
import { seedAuth } from '../tests/e2e/helpers';

test('boots to Discover, nav shows both domains, attach works on NaaS Connect', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/');
  await expect(page).toHaveTitle(/Cloud Connect/);
  const mainNav = page.getByLabel('Main navigation');
  // Layer-first: Discover is the only bare link; each layer is a dropdown
  // whose panel carries its four verbs. No verb label repeats in the bar.
  await expect(mainNav.getByRole('link', { name: 'Discover', exact: true })).toBeVisible();
  for (const layer of ['NaaS', 'AI Fabric']) {
    const trigger = mainNav.getByRole('button', { name: layer, exact: true });
    await expect(trigger).toBeVisible();
    await trigger.click();
    const menu = mainNav.getByRole('menu', { name: layer });
    for (const verb of ['Connect', 'Govern', 'Observe', 'Cost']) {
      await expect(menu.getByRole('menuitem', { name: new RegExp(`^${verb}\\b`) })).toBeVisible();
    }
    await trigger.click();
  }
  // Discover is a read view of the unified estate — no attach control here.
  // The rebuilt Discover tree exposes Expand/Collapse controls and per-row
  // connection-state indicators (via the AT&T fabric / public internet).
  await expect(page.getByRole('button', { name: /^Expand all$/i })).toBeVisible();
  await expect(page.getByText(/via the AT&T fabric|public internet/i).first()).toBeVisible();

  // Provisioning now lives on the Connect cloud fabric; provisioning a region
  // persists a visible state change (its edge flips public → private).
  await page.goto('/#/naas/connect', { waitUntil: 'domcontentloaded' });
  const usw2Edge = page.locator('[data-fabric-edge][data-region-id="usw2"]').first();
  await expect(usw2Edge).toHaveAttribute('data-path', 'public');
  await page.getByTestId('fabric-node-region-usw2').click();
  await page.getByTestId('open-provision-wizard').click();
  const dialog = page.getByRole('dialog');
  for (let i = 0; i < 3; i++) await dialog.getByRole('button', { name: /^Next$/i }).click();
  await dialog.getByTestId('provision-confirm').click();
  await expect(usw2Edge).toHaveAttribute('data-path', 'private');
});
