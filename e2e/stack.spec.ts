import { test, expect } from '@playwright/test';
import { seedAuth, openLayerVerb } from '../tests/e2e/helpers';

/* The layer-first IA, walked end to end as a person walks it:
   in through the Discover stack, across a layer with the dropdown,
   vertically with the rail, and out to the concept deck that explains
   why it is shaped this way. */

test('Discover stack → layer verbs → dropdown → rail hop', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/#/discover', { waitUntil: 'domcontentloaded' });

  // The stack panel draws every stratum, elevation order, vision bands inert.
  const panel = page.getByTestId('stack-panel');
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId('stack-band-ai')).toBeVisible();
  await expect(panel.getByTestId('stack-band-transport')).toBeVisible();
  // Transport is a vision stratum: media named, nothing to click.
  await expect(panel.getByTestId('stack-band-transport').getByRole('link')).toHaveCount(0);

  // Enter the network layer through its Connect verb.
  await panel.getByTestId('stack-band-naas').getByRole('link', { name: /^Connect\b/ }).click();
  await expect(page).toHaveURL(/#\/naas\/connect/);

  // Cross the layer with the dropdown: NaaS → Cost.
  await openLayerVerb(page, 'NaaS', 'Cost');
  await expect(page).toHaveURL(/#\/naas\/cost/);

  // Hop the stack: same verb, other layer, one click on the rail.
  const rail = page.getByTestId('stack-rail');
  await expect(rail).toBeVisible();
  await rail.getByRole('link', { name: /AI Fabric/ }).click();
  await expect(page).toHaveURL(/#\/ai\/cost/);

  // And back down — the rail keeps the verb both directions.
  await rail.getByRole('link', { name: /NaaS/ }).click();
  await expect(page).toHaveURL(/#\/naas\/cost/);
});

test('the concept deck explains the table and links only into live rows', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/#/stack', { waitUntil: 'domcontentloaded' });

  // The cover states the rule.
  await expect(page.getByText('Enter through the layer.')).toBeVisible();

  // The deck is standalone — no app bar on a document.
  await expect(page.getByLabel('Main navigation')).toHaveCount(0);

  // Every in-app link on the deck points at a route that exists.
  const LIVE = new Set([
    ...['connect', 'govern', 'observe', 'cost'].flatMap(v => [`#/ai/${v}`, `#/naas/${v}`]),
    '#/discover',
  ]);
  const hrefs = await page.locator('a[href^="#/"]').evaluateAll(as =>
    as.map(a => a.getAttribute('href')),
  );
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    expect(LIVE.has(href!), `deck links to a route that does not exist: ${href}`).toBe(true);
  }
});
