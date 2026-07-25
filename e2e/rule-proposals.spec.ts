import { test, expect } from '@playwright/test';
import { seedAuth } from '../tests/e2e/helpers';

/**
 * What Andi spotted, above the rules table on Govern. Each row states a
 * behavioral finding and what enforcing its rule would touch; "Enforce it"
 * stages that rule into the /discover review tray for a human to commit.
 *
 * The single most important behavior under test: a finding's `active`
 * predicate is recomputed from live estate state, so once its rule is
 * enforced the proposal disappears on its own - nothing dismisses it, the
 * estate just no longer matches.
 */

test('Govern shows what Andi spotted, and enforcing retires the proposal', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/#/naas/govern', { waitUntil: 'domcontentloaded' });

  const band = page.getByTestId('proposal-band');
  await expect(band).toBeVisible();
  const rowsBefore = await page.getByTestId('proposal-row').count();
  expect(rowsBefore).toBeGreaterThan(0);

  // Enforce the first proposal: it stages, a human commits, the row retires.
  await band.getByTestId('proposal-enforce').first().click();
  await expect(page).toHaveURL(/#\/discover/);
  await expect(page.getByTestId('proposal-note')).toContainText('Proposed by Andi');
  await page.getByTestId('design-commit').click();

  await page.goto('/#/naas/govern', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('proposal-row')).toHaveCount(rowsBefore - 1);
});

test('the Andi badge counts the same proposals the band shows', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/#/naas/govern', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('proposal-band')).toBeVisible();

  const rows = await page.getByTestId('proposal-row').count();
  await expect(page.getByTestId('andi-proposal-badge')).toHaveText(String(rows));
});
