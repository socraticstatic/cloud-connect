import { test, expect } from '@playwright/test';
import { seedAuth } from '../tests/e2e/helpers';

test('boots to Discover, nav shows six sections, attach works on Connect', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/');
  await expect(page).toHaveTitle(/Cloud Connect/);
  const mainNav = page.getByLabel('Main navigation');
  for (const l of ['Discover', 'Connect', 'Govern', 'Observe', 'Cost', 'AI Fabric'])
    await expect(mainNav.getByRole('link', { name: l })).toBeVisible();
  // Discover is a read view of the unified estate — no attach control here.
  // The rebuilt Discover tree exposes Expand/Collapse controls and per-row
  // connection-state indicators (via the AT&T fabric / public internet).
  await expect(page.getByRole('button', { name: /^Expand all$/i })).toBeVisible();
  await expect(page.getByText(/via the AT&T fabric|public internet/i).first()).toBeVisible();

  // Provisioning now lives on the Connect cloud fabric; provisioning a region
  // persists a visible state change (its edge flips public → private).
  await page.goto('/#/connect', { waitUntil: 'domcontentloaded' });
  const usw2Edge = page.locator('[data-fabric-edge][data-region-id="usw2"]').first();
  await expect(usw2Edge).toHaveAttribute('data-path', 'public');
  await page.getByTestId('fabric-node-region-usw2').click();
  await page.getByTestId('open-provision-wizard').click();
  const dialog = page.getByRole('dialog');
  for (let i = 0; i < 3; i++) await dialog.getByRole('button', { name: /^Next$/i }).click();
  await dialog.getByTestId('provision-confirm').click();
  await expect(usw2Edge).toHaveAttribute('data-path', 'private');
});
