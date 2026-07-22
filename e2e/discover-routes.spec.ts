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

  /* The heading and the blurb ARE the deliverable — the section wrappers on
     their own satisfy the testids while saying nothing at all. Assert both
     are on screen, with real text, per section. */
  const headings: Record<string, string> = {
    network: 'Network',
    cloud: 'Cloud',
    ai: 'AI workflows',
  };
  for (const [key, heading] of Object.entries(headings)) {
    const section = page.getByTestId(`estate-${key}`);
    await expect(section).toBeVisible();
    await expect(section.getByRole('heading', { level: 2, name: heading })).toBeVisible();
    const blurb = section.locator('p').first();
    await expect(blurb).toBeVisible();
    expect(((await blurb.textContent()) ?? '').trim().length).toBeGreaterThan(30);
  }

  const routes = await page.evaluate(
    () => (window as unknown as { CC: { counts(): { routes: number } } }).CC.counts().routes,
  );
  await expect(page.getByTestId('estate-network')).toContainText(String(routes));
});

/* The On-ramps tile used to read `onramps.length` — 4 — beside a sentence
   about "the paths already under your control", while only one circuit was
   active and two were seeded "unused capacity" / "not yet provisioned". It
   now reads the engine's own `active / available` idiom, and it MOVES when
   the estate does. */
test('the on-ramps tile reads active over available, and moves when a circuit is activated', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/#/discover', { waitUntil: 'domcontentloaded' });

  type Ramps = {
    CC: { activeOnramps(): number; onramps: unknown[]; activateOnramp(id: string): boolean };
  };
  const before = await page.evaluate(() => {
    const cc = (window as unknown as Ramps).CC;
    return { active: cc.activeOnramps(), total: cc.onramps.length };
  });
  expect(before.active).toBeLessThan(before.total); // the finding this tile now states honestly

  const network = page.getByTestId('estate-network');
  const label = network.locator('div').filter({ hasText: /^Active on-ramps$/ });
  await expect(label).toHaveCount(1);
  await expect(label.locator('..')).toContainText(`${before.active} / ${before.total}`);

  await page.evaluate(() => (window as unknown as Ramps).CC.activateOnramp('dx1'));

  await expect(label.locator('..')).toContainText(`${before.active + 1} / ${before.total}`);
});
