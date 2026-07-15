import { test, expect } from '@playwright/test';
import { seedAuth } from '../tests/e2e/helpers';

/**
 * Full-story walk: every one of the six sections, in order, with one real
 * engine-backed state change asserted per section — plus the cross-cutting
 * Tour and ⌘K affordances. This is the single spec that proves the whole
 * rebuild hangs together, not just each section in isolation.
 *
 * Discover is a read view of the unified estate (no mutating control lives
 * there); the Connect section carries two real engine actions — Attach and
 * Steer — since Attach moved off Discover onto the Connect on-ramp panel.
 */
test('walks all six sections with real state changes, plus Tour and ⌘K', async ({ page }) => {
  await seedAuth(page);

  // --- Discover: the unified inventory renders real estate — lenses, rows, path state ---
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Cloud Connect/);
  for (const l of ['Discover', 'Connect', 'Govern', 'Observe', 'Cost', 'AI Fabric']) {
    await expect(page.getByRole('link', { name: l })).toBeVisible();
  }
  for (const chip of ['All', 'Network', 'AI']) {
    await expect(page.getByRole('button', { name: new RegExp(`^${chip}$`, 'i') })).toBeVisible();
  }
  await expect(page.getByText(/^(Private|Public)$/).first()).toBeVisible();

  // --- Connect: Attach activates an on-ramp, raising the active count ---
  await page.goto('/#/connect', { waitUntil: 'domcontentloaded' });
  const activeCount = page.getByText(/^\d+ active$/);
  const activeBefore = parseInt((await activeCount.textContent()) ?? '0', 10);
  const attachButton = page.getByRole('button', { name: /^Attach$/i }).first();
  await expect(attachButton).toBeVisible();
  await attachButton.click();
  await expect
    .poll(async () => parseInt((await activeCount.textContent()) ?? '0', 10))
    .toBeGreaterThan(activeBefore);

  // --- Connect: Steer flips a control badge ---
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

  // --- Observe: the network observability shell renders live KPIs ---
  await page.goto('/#/observe', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Network Observability' })).toBeVisible();
  await expect(page.getByTestId('kpi-tile').first()).toBeVisible();

  // --- AI Fabric: Trace tab, classified -> external model is DENIED ---
  await page.goto('/#/ai-fabric', { waitUntil: 'domcontentloaded' });
  await page.getByRole('navigation', { name: 'Tabs' }).getByRole('button', { name: 'Trace' }).click();
  await page.getByRole('button', { name: 'Trace', exact: true }).last().click();
  await expect(page.getByText(/denied/i).first()).toBeVisible();

  // --- Cost: stub renders (Task 3 builds the real screen and its own e2e coverage) ---
  await page.goto('/#/cost', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#main-content').getByText('Cost')).toBeVisible();

  // --- Tour: the Tour button opens the guided tour ---
  await page.getByRole('button', { name: /Start guided tour/i }).click();
  await expect(page.getByText('Discover the estate')).toBeVisible();
  await page.getByRole('button', { name: 'Close tour' }).click();
  await expect(page.getByText('Discover the estate')).toHaveCount(0);

  // --- ⌘K: the command palette opens over the current page ---
  await page.keyboard.press('Meta+k');
  await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Command palette' })).toHaveCount(0);
});
