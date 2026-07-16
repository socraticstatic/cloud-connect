import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { seedAuth } from '../tests/e2e/helpers';

/**
 * The exquisite gate. For each of the six MVP screens this asserts, in one
 * pass: the screen renders real engine-backed content (mustSee), an axe scan
 * finds no serious/critical a11y violations, the console logs zero errors, and
 * a full-page screenshot lands in test-results/ for design review.
 *
 * Axe (and the mustSee query) are scoped to `#main-content` — the region every
 * one of our six screens renders into (see App.tsx). The inherited AT&T NetBond
 * top-nav / header chrome that wraps every route is out of this rebuild's scope;
 * scoping keeps the gate honest about OUR surface without weakening the ruleset
 * (no rules disabled, full serious+critical bar) and without letting pre-existing
 * chrome violations mask or fail our screens. Scoping mustSee also stops nav
 * labels (Cost, Connect, …) from satisfying an assertion by accident.
 *
 * Determinism: the suite runs under prefers-reduced-motion AND seeds the
 * Discover reveal's once-per-session "already revealed" flag
 * (`cc-discover-revealed`), so the staggered entrance never samples mid-fade.
 * Recharts already render with isAnimationActive={false}.
 */
test.use({ reducedMotion: 'reduce' });

async function prep(page: Page) {
  await seedAuth(page);
  // Skip the Discover reveal choreography so opacity is settled when axe scans.
  await page.addInitScript(() => sessionStorage.setItem('cc-discover-revealed', '1'));
}

const SCREENS = [
  // Discover: the amber public-exposure finding strip (Task 5) — real estate rollup.
  { route: '/discover', mustSee: /workloads? reachable over the public internet/i },
  // Connect: the cloud-fabric copy (section description) — the steerable Paths
  // table moved to Observe.
  { route: '/connect', mustSee: /AT&T fabric|on-ramps?/i },
  // Govern: policy & segmentation surface.
  { route: '/govern', mustSee: /polic(y|ies)|enforce|rules?/i },
  // Observe: network observability KPIs (throughput / latency / egress series).
  { route: '/observe', mustSee: /latency|egress|throughput/i },
  // Cost: arbitrage hero — the two-bill savings band, verified real.
  { route: '/cost', mustSee: /on the AT&T fabric/i },
  // AI Fabric: token policies + model catalog.
  { route: '/ai-fabric', mustSee: /token|model/i },
];

for (const s of SCREENS) {
  test(`${s.route} renders, is accessible, and logs no errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));

    await prep(page);
    await page.goto(`/#${s.route}`, { waitUntil: 'domcontentloaded' });

    const main = page.locator('#main-content');
    await expect(main.getByText(s.mustSee).first()).toBeVisible();
    // Let any one-shot entrance transitions settle before scan + screenshot.
    await page.waitForTimeout(500);

    const axe = await new AxeBuilder({ page }).include('#main-content').analyze();
    const serious = axe.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    expect(
      serious,
      JSON.stringify(serious.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })), null, 2),
    ).toEqual([]);

    expect(errors, errors.join('\n')).toEqual([]);
    await page.screenshot({ path: `test-results/screen${s.route.replace(/\//g, '-')}.png`, fullPage: true });
  });
}

/**
 * Cause-and-effect across screens — the demo's core proof. Read the Cost hero
 * savings figure, cross to Observe (where the Paths table now lives), steer a
 * flow onto an AT&T path (which pulls egress off the public internet), cross back
 * to Cost, and assert the headline moved. Navigation is via the SPA nav links
 * (not page.goto) so the seeded engine state survives the trip.
 */
test('cause-and-effect: steering on Observe moves the Cost savings headline', async ({ page }) => {
  await prep(page);
  await page.goto('/#/cost', { waitUntil: 'domcontentloaded' });

  // The arbitrage hero's "save $X (Y%)" pill — moves as egress leaves public.
  const savingsValue = page.getByTestId('hero-savings');
  const before = (await savingsValue.innerText()).trim();
  expect(before).toMatch(/save \$[\d.]+k? \(\d+%\)/);

  // The steerable Paths table lives on Observe (relocated from Connect). "Observe"
  // is a link in both the top nav and the flow stepper — use the nav (first in DOM)
  // to avoid a strict-mode collision.
  await page.getByRole('link', { name: 'Observe' }).first().click();
  // Wait for the lazy ObservePage + Paths table to render before probing for
  // steerable flows — otherwise the count races the route transition.
  await expect(page.getByText('Flows & paths')).toBeVisible();
  // A steer lever MUST exist — the demo's core proof depends on it. Asserting
  // (not guarding) here means a regression that removes every steer control
  // fails this test instead of silently passing as a no-op.
  const steer = page.getByRole('button', { name: /^Steer$/i });
  await expect(steer.first()).toBeVisible();
  expect(await steer.count()).toBeGreaterThan(0);

  await steer.first().click();
  await page.getByRole('link', { name: 'Cost' }).first().click();
  await expect(savingsValue).toBeVisible();
  await expect
    .poll(async () => (await savingsValue.innerText()).trim())
    .not.toEqual(before);
});
