import { test, expect } from '@playwright/test';
import { seedAuth } from '../tests/e2e/helpers';

test('boots to Discover, nav shows six sections, attach works', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/');
  await expect(page).toHaveTitle(/Cloud Connect/);
  for (const l of ['Discover', 'Connect', 'Govern', 'Observe', 'AI Fabric', 'NetOps for AI'])
    await expect(page.getByRole('link', { name: l })).toBeVisible();
  await page.getByRole('button', { name: /attach/i }).first().click();
  // an attach persists a visible state change (green/private marker)
  await expect(page.getByText(/private/i).first()).toBeVisible();
});
