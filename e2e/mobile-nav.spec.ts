import { test, expect, type Page } from '@playwright/test';

/* Below 1280px the horizontal nav (MainNav.tsx) disappears entirely — it's
   `hidden min-[1280px]:flex`. The hamburger next to the logo is the only way
   to reach any section, AI Fabric included, at those widths. It used to
   toggle a vertical-nav overlay (AdaptiveNavigation) that rendered as an
   empty panel clipped to the header's own height — a CSS containing-block
   bug from `<nav>`'s backdrop-blur-md, on top of never being wired to
   anything with real nav items. The fully-built MobileMenu drawer sat
   mounted and unreachable the whole time. This walks what a person hits at
   900x800: no AI Fabric in the bar, hamburger opens the real drawer, and the
   drawer actually gets you there. */

async function firstVisit(page: Page) {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/#/discover', { waitUntil: 'domcontentloaded' });

  // A genuine first visit may open the product tour / demo modal. Close
  // whichever is present rather than pre-seeding flags to hide them.
  const btn = page.getByRole('button', {
    name: /^(skip|skip tour|close|got it|maybe later|no thanks)$/i,
  });
  while (await btn.first().isVisible().catch(() => false)) {
    await btn.first().click();
    await page.waitForTimeout(150);
  }
  await page.keyboard.press('Escape').catch(() => {});
}

test.use({ viewport: { width: 900, height: 800 } });

test('neither domain is reachable from the horizontal nav, but the hamburger drawer gets you to both', async ({
  page,
}) => {
  await firstVisit(page);

  // At 900px the desktop nav block (`hidden min-[1280px]:flex`) never
  // renders — no section is an on-screen link, AI Fabric least of all.
  await expect(page.getByRole('link', { name: 'Connect', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Discover', exact: true })).toHaveCount(0);

  // The drawer is mounted (MobileMenu is always in the tree) but closed.
  await expect(page.getByLabel('Close menu')).not.toBeVisible();

  await page.locator('[data-nav-toggle="true"]').click();

  /* The drawer opened with real navigation in it — not an empty panel. Both
     domains carry the SAME four verb labels, so the drawer has to keep them
     apart: each is a named group, and "Govern" inside the AI Fabric group must
     go somewhere different from "Govern" inside NaaS. A drawer that flattened
     the two would send both to the same screen and pass a naive assertion. */
  const naas = page.getByRole('group', { name: 'NaaS' });
  const ai = page.getByRole('group', { name: 'AI Fabric' });
  await expect(naas).toBeVisible();
  await expect(ai).toBeVisible();
  for (const verb of ['Connect', 'Govern', 'Observe', 'Cost']) {
    await expect(naas.getByRole('button', { name: new RegExp(`^${verb}`) })).toBeVisible();
    await expect(ai.getByRole('button', { name: new RegExp(`^${verb}`) })).toBeVisible();
  }

  await ai.getByRole('button', { name: /^Govern/ }).click();

  // The route changed — to the AI Fabric's Govern, not NaaS's.
  await expect(page).toHaveURL(/#\/ai\/govern/);
  await expect(page.getByRole('heading', { name: /AI Fabric · Govern/i })).toBeVisible();

  // And the drawer closed itself after navigating.
  await expect(page.getByLabel('Close menu')).not.toBeVisible();

  // The other domain's same-named verb is a different screen.
  await page.locator('[data-nav-toggle="true"]').click();
  await page.getByRole('group', { name: 'NaaS' }).getByRole('button', { name: /^Govern/ }).click();
  await expect(page).toHaveURL(/#\/naas\/govern/);
});

test('the drawer panel and backdrop actually fill the viewport, not a clipped strip', async ({
  page,
}) => {
  // Reachability assertions (above, and in the rest of this file) confirm the
  // drawer's contents exist and respond to clicks — but that's exactly what
  // sailed past the real bug once: `<nav>` carries `backdrop-blur-md`, and
  // CSS backdrop-filter establishes a containing block for `position: fixed`
  // descendants. Any fixed-position drawer whose containing block resolves to
  // `<nav>` instead of the viewport renders as a strip clipped to the nav's
  // own ~64px height — fully present in the DOM, fully clickable via
  // Playwright's actionability checks (which don't require visible pixels
  // outside a clipped ancestor the way a human eye would), and totally
  // invisible as a rendered surface. This is the assertion that catches that
  // geometrically, against the actual viewport size rather than a hardcoded
  // pixel value.
  await firstVisit(page);

  await page.locator('[data-nav-toggle="true"]').click();
  await expect(page.getByLabel('Close menu')).toBeVisible();

  const viewport = page.viewportSize();
  if (!viewport) throw new Error('viewport size unavailable');

  const panel = page
    .getByLabel('Close menu')
    .locator('xpath=ancestor::div[contains(@class,"fixed")][1]');
  const panelBox = await panel.boundingBox();
  expect(panelBox).not.toBeNull();
  expect(panelBox!.height).toBeGreaterThan(viewport.height * 0.9);

  // Backdrop is the other `fixed inset-0` element the drawer renders — the
  // click-outside-to-close scrim. It must cover the full viewport too, or a
  // 64px containing-block clip would shrink it right alongside the panel.
  const backdrop = page.locator('.fixed.inset-0.bg-black\\/50');
  const backdropBox = await backdrop.boundingBox();
  expect(backdropBox).not.toBeNull();
  expect(backdropBox!.width).toBeGreaterThan(viewport.width * 0.9);
  expect(backdropBox!.height).toBeGreaterThan(viewport.height * 0.9);
});
