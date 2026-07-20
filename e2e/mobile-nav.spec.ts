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

test('AI Fabric is unreachable from the horizontal nav, but the hamburger drawer gets you there', async ({
  page,
}) => {
  await firstVisit(page);

  // At 900px the desktop nav block (`hidden min-[1280px]:flex`) never
  // renders — confirm the specific claim this bug report makes: AI Fabric,
  // the item most likely to be trimmed, is not an on-screen link.
  await expect(page.getByRole('link', { name: /^AI Fabric$/ })).toHaveCount(0);

  // The drawer is mounted (MobileMenu is always in the tree) but closed.
  await expect(page.getByLabel('Close menu')).not.toBeVisible();

  await page.locator('[data-nav-toggle="true"]').click();

  // The drawer opened with real navigation in it — not an empty panel.
  const drawerAiFabric = page.getByRole('button', { name: /^AI Fabric/ });
  await expect(drawerAiFabric).toBeVisible();

  await drawerAiFabric.click();

  // The route changed.
  await expect(page).toHaveURL(/#\/ai-fabric/);
  await expect(page.getByRole('heading', { name: /AI Fabric/i })).toBeVisible();

  // And the drawer closed itself after navigating.
  await expect(page.getByLabel('Close menu')).not.toBeVisible();
});
