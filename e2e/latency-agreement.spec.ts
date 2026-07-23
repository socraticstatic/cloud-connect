import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { seedAuth } from '../tests/e2e/helpers';

/**
 * The cross-screen walk that found the divergence, run as a test so it cannot
 * silently come back.
 *
 * A region's latency used to be three different numbers depending on which
 * screen you were standing on: `fabricModel()`'s figure on /discover and
 * /naas/connect, the raw seed (and seed x 1.7) on /naas/observe's flow rows,
 * and a hand-typed `~12ms` in the network briefing. us-east-1 read 3ms on
 * Connect and 12ms on its AT&T-controlled flow row one click away.
 *
 * Everything now derives from `CC.regionLatency(regionId)`. This walks the
 * screens a viewer actually moves between and asserts one number — never a
 * pinned one: the expected value is read out of the engine each time.
 *
 * Routes are changed by assigning `location.hash`, not `page.goto`: the engine
 * is in-page state, and a reload between screens would hide exactly the drift
 * this test exists to catch.
 */

interface LatencyPair {
  privateMs: number;
  publicMs: number;
}
interface CCHandle {
  regionLatency(id: string): LatencyPair | null;
  activateOnramp(id: string): boolean;
}
async function goHash(page: Page, hash: string) {
  await page.evaluate(h => { window.location.hash = h; }, hash);
  await page.waitForTimeout(150);
}

const regionLatency = (page: Page, rid: string): Promise<LatencyPair> =>
  page.evaluate(id => (window as unknown as { CC: CCHandle }).CC.regionLatency(id)!, rid);

/** The Latency stat tile on /discover for one region, as rendered. */
async function discoverLatency(page: Page, cloudName: RegExp, regionName: string): Promise<string> {
  await goHash(page, '#/discover');
  const row = page.getByRole('button', { name: regionName, exact: true }).first();
  // The cloud may already be expanded; only toggle it when the region is hidden.
  if (!(await row.isVisible().catch(() => false))) {
    await page.getByRole('button', { name: cloudName }).first().click();
  }
  await expect(row).toBeVisible();
  const text = (await row.innerText()).replace(/\s+/g, ' ');
  const m = /(\d+)ms/.exec(text);
  expect(m, `no latency on the ${regionName} row: "${text}"`).not.toBeNull();
  return m![1];
}

/** Every /naas/observe flow row carried by the named path, and the ms it shows. */
async function observeRowLatencies(page: Page, pathName: string): Promise<string[]> {
  await goHash(page, '#/naas/observe');
  const rows = page.getByTestId('record-row');
  await expect(rows.first()).toBeVisible();
  const all = await rows.allInnerTexts();
  return all
    .filter(t => t.includes(pathName))
    .map(t => /(\d+)ms/.exec(t.replace(/\s+/g, ' '))?.[1] ?? '')
    .filter(Boolean);
}

test('us-east-1 states one latency on every screen a viewer moves between', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/#/naas/connect', { waitUntil: 'domcontentloaded' });
  const { privateMs } = await regionLatency(page, 'use1');

  // 1. Connect: the region node and its path card.
  await expect(page.getByTestId('fabric-node-region-use1')).toHaveAttribute('data-path', 'private');
  await page.getByTestId('fabric-node-region-use1').click();
  await expect(page.getByTestId('path-tenanted')).toContainText(`${privateMs}ms`);

  // 2. Discover: the Latency stat tile on the same region.
  expect(await discoverLatency(page, /^AWS/, 'us-east-1'), 'Discover disagrees with Connect')
    .toBe(String(privateMs));

  // 3. Observe: every flow row riding this region's AT&T path.
  const rowMs = await observeRowLatencies(page, 'NetBond · PE-IAD-02');
  expect(rowMs.length, 'no us-east-1 flow rows on the AT&T path').toBeGreaterThan(0);
  for (const ms of rowMs) {
    expect(ms, 'a flow row disagrees with the region tile it came from').toBe(String(privateMs));
  }

  // 4. The briefing quotes that figure and no hand-typed envelope, and says
  //    what the figure measures — so a region's RTT to its on-ramp and a
  //    flow's public-path latency are never read as the same claim.
  const briefing = page.getByTestId('briefing');
  await expect(briefing).toContainText(`${privateMs}ms`);
  await expect(briefing).not.toContainText(/~\s*\d+ms/);
  await expect(briefing).toContainText(/on-ramp/i);
});

test('attaching a region moves every screen to the same new number', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/#/naas/connect', { waitUntil: 'domcontentloaded' });

  // us-west-2 starts on public transit; dx1 is the on-ramp that reaches it.
  const before = await regionLatency(page, 'usw2');
  const publicRows = await observeRowLatencies(page, 'Public internet');
  expect(publicRows, 'us-west-2 flows should start on the public figure').toContain(String(before.publicMs));

  await goHash(page, '#/naas/connect');
  await page.evaluate(() => (window as unknown as { CC: CCHandle }).CC.activateOnramp('dx1'));

  await expect(page.getByTestId('fabric-node-region-usw2')).toHaveAttribute('data-path', 'private');
  const after = await regionLatency(page, 'usw2');
  expect(after.privateMs, 'attaching must move the figure').not.toBe(before.publicMs);

  await page.getByTestId('fabric-node-region-usw2').click();
  await expect(page.getByTestId('path-managed-direct')).toContainText(`${after.privateMs}ms`);

  expect(await discoverLatency(page, /^AWS/, 'us-west-2')).toBe(String(after.privateMs));

  const rowMs = await observeRowLatencies(page, 'Direct Connect · Equinix DC2');
  expect(rowMs.length, 'no us-west-2 flow rows on the newly-attached path').toBeGreaterThan(0);
  for (const ms of rowMs) {
    expect(ms, 'a flow row kept its old figure after the region attached').toBe(String(after.privateMs));
  }
});
