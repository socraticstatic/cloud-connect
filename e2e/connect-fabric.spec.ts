import { test, expect } from '@playwright/test';
import { seedAuth } from '../tests/e2e/helpers';

test('Connect is one cloud fabric: select a region, provision it, it joins the fabric', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/#/connect', { waitUntil: 'domcontentloaded' });

  // The fabric hero renders with region nodes.
  const hero = page.getByTestId('fabric-hero');
  await expect(hero).toBeVisible();

  // us-west-2 starts public (unattached) — its edge encodes public.
  const usw2Edge = page.locator('[data-fabric-edge][data-region-id="usw2"]').first();
  await expect(usw2Edge).toHaveAttribute('data-path', 'public');

  // Click the region node → its panel opens with a Provision action.
  await page.getByTestId('fabric-node-region-usw2').click();
  const provision = page.getByTestId('open-provision-wizard');
  await expect(provision).toBeVisible();
  await provision.click();

  // Walk the wizard: attach type → on-ramp → resiliency → confirm.
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await dialog.getByRole('button', { name: /^Next$/i }).click();
  }
  await dialog.getByTestId('provision-confirm').click();

  // The region flips to connected/private on the fabric.
  await expect(page.locator('[data-fabric-edge][data-region-id="usw2"]').first())
    .toHaveAttribute('data-path', 'private');
  await expect(page.getByTestId('fabric-node-region-usw2')).toHaveAttribute('data-path', 'private');

  // The steerable Paths table is NOT on Connect — it lives on Observe.
  await expect(page.getByText('Flows & paths')).toHaveCount(0);
});

test('the steerable Paths table lives on Observe, not Connect', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/#/observe', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Flows & paths')).toBeVisible();
});
