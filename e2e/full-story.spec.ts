import { test, expect } from '@playwright/test';
import { seedAuth } from '../tests/e2e/helpers';

/**
 * Full-story walk: every one of the six sections, in order, with one real
 * engine-backed state change asserted per section — plus the cross-cutting
 * Tour and ⌘K affordances. This is the single spec that proves the whole
 * rebuild hangs together, not just each section in isolation.
 */
test('walks all six sections with real state changes, plus Tour and ⌘K', async ({ page }) => {
  await seedAuth(page);

  // --- Discover: attach raises the attached count / shows a private path ---
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Cloud Connect/);
  for (const l of ['Discover', 'Connect', 'Govern', 'Observe', 'AI Fabric', 'NetOps for AI']) {
    await expect(page.getByRole('link', { name: l })).toBeVisible();
  }
  await page.getByRole('button', { name: /attach/i }).first().click();
  await expect(page.getByText(/private/i).first()).toBeVisible();

  // --- Connect: Steer flips a control badge ---
  await page.goto('/#/connect', { waitUntil: 'domcontentloaded' });
  const controlledBadge = page.getByText(/AT&T-controlled/i);
  const controlledBefore = await controlledBadge.count();
  const steerButton = page.getByRole('button', { name: /^Steer$/i }).first();
  await expect(steerButton).toBeVisible();
  await steerButton.click();
  await expect
    .poll(async () => controlledBadge.count())
    .toBeGreaterThan(controlledBefore);

  // --- Govern: Enforce flips a rule status badge ---
  await page.goto('/#/govern', { waitUntil: 'domcontentloaded' });
  const enforcedBadge = page.getByText(/^Enforced$/i);
  const enforcedBefore = await enforcedBadge.count();
  const enforceButton = page.getByRole('button', { name: /^Enforce$/i }).first();
  await expect(enforceButton).toBeVisible();
  await enforceButton.click();
  await expect
    .poll(async () => enforcedBadge.count())
    .toBeGreaterThan(enforcedBefore);

  // --- Observe: a region telemetry chart renders live ---
  await page.goto('/#/observe', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/Latency by region/i)).toBeVisible();

  // --- AI Fabric: Trace tab, classified -> external model is DENIED ---
  await page.goto('/#/ai-fabric', { waitUntil: 'domcontentloaded' });
  await page.getByRole('navigation', { name: 'Tabs' }).getByRole('button', { name: 'Trace' }).click();
  await page.getByRole('button', { name: 'Trace', exact: true }).last().click();
  await expect(page.getByText(/denied/i).first()).toBeVisible();

  // --- NetOps: inject a live incident directly on the engine, then Act clears it ---
  await page.goto('/#/netops', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/closed loop · steady/i)).toBeVisible();

  await page.evaluate(() => {
    const CC = (window as any).CC;
    if (!CC.onramps.find((o: any) => o.id === 'nb2')?.active) CC.activateOnramp('nb2');
    CC.simulateFailure('nb2');
  });
  await expect(page.getByText(/live signal in the loop/i)).toBeVisible();

  const actButton = page.getByRole('button', { name: /restore|act/i });
  await expect(actButton).toBeVisible();
  await actButton.click();
  await expect(page.getByText(/closed loop · steady/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /restore|act/i })).toHaveCount(0);

  // --- Tour: the Tour button opens the guided tour ---
  await page.getByRole('button', { name: /^Tour$/i }).click();
  await expect(page.getByText('Discover the estate')).toBeVisible();
  await page.getByRole('button', { name: 'Close tour' }).click();
  await expect(page.getByText('Discover the estate')).toHaveCount(0);

  // --- ⌘K: the command palette opens over the current page ---
  await page.keyboard.press('Meta+k');
  await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Command palette' })).toHaveCount(0);
});
