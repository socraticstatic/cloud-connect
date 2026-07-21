import { test, expect, type Page } from '@playwright/test';
import { seedAuth } from '../tests/e2e/helpers';

/**
 * Govern's first move: the screen must name ONE rule to enforce next, state
 * what enforcing it does before anyone commits, and re-point at a different
 * rule once that one is live.
 *
 * The expected figures are computed in the test from the engine itself
 * (`window.CC`) rather than read back out of the DOM — reading the DOM would
 * only prove the band is self-consistent, not that it tells the truth.
 */

const BAND = '[data-testid="govern-next-move"]';

/** Independently ranks unenforced rules the way the product claims to:
 *  violations cleared first, projected before unprojected, then posture,
 *  then rule priority. Deliberately a second implementation. */
async function expectedNextMove(page: Page) {
  return page.evaluate(() => {
    const CC = (window as unknown as { CC: any }).CC;
    const openNow = CC.violations().length;
    const posture = CC.posture();
    const scored = CC.ruleList()
      .filter((r: any) => !CC.ruleEnforced(r))
      .map((r: any) => {
        const p = r.fix ? CC.previewFix(r.fix) : null;
        if (p) {
          return {
            id: r.id,
            name: r.name,
            cleared: openNow - p.violations,
            postureAfter: p.posture,
            projected: 1,
            pri: r.pri,
          };
        }
        const own = CC.violations().filter((v: any) => v.policy === r.id).length;
        return { id: r.id, name: r.name, cleared: own, postureAfter: null, projected: 0, pri: r.pri };
      });
    scored.sort(
      (a: any, b: any) =>
        b.cleared - a.cleared ||
        b.projected - a.projected ||
        (b.postureAfter ?? posture) - (a.postureAfter ?? posture) ||
        a.pri - b.pri,
    );
    return { best: scored[0] ?? null, openNow, posture, remaining: scored.length };
  });
}

test('Govern recommends one rule to enforce, states its effect, and re-points once enforced', async ({
  page,
}) => {
  await seedAuth(page);
  // A first-time viewer, not a returning one: no saved engine or tour state.
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('att_nb_user', JSON.stringify({ email: 'test@att.com' }));
    localStorage.setItem('tour-main-app-completed', 'true');
    localStorage.setItem('product-tour-completed', 'true');
    localStorage.setItem('e2e-skip-demo-modal', 'true');
  });

  await page.goto('/#/govern', { waitUntil: 'domcontentloaded' });

  const band = page.locator(BAND);
  await expect(band).toBeVisible();

  // --- the recommendation names a SPECIFIC rule ---
  const first = await expectedNextMove(page);
  expect(first.best).not.toBeNull();
  await expect(page.locator('[data-testid="govern-next-move-rule"]')).toHaveText(first.best.name);

  // --- the projected delta shown matches what the engine reports ---
  await expect(page.locator('[data-testid="govern-next-move-cleared"]')).toHaveText(
    String(first.best.cleared),
  );
  await expect(band).toContainText(`of the ${first.openNow} open violation`);
  // Posture is only claimed to move when the engine says it does — a rule can
  // clear a violation and leave the rounded posture where it was.
  if (first.best.postureAfter !== null && first.best.postureAfter !== first.posture) {
    await expect(band).toContainText(`posture ${first.posture} → ${first.best.postureAfter}`);
  } else {
    await expect(band).not.toContainText(`${first.posture} → ${first.posture}`);
  }
  await expect(band).toContainText(`${first.remaining} unenforced rule`);

  // --- enforce it THROUGH THE UI, from the row's overflow menu ---
  const row = page.locator('table tbody tr').filter({ hasText: first.best.name }).first();
  await row.getByRole('button', { name: /more options/i }).click();
  await page.getByRole('menu').getByRole('button', { name: /^Enforce$/ }).click();

  // --- the recommendation now names a DIFFERENT rule, with fresh figures ---
  await expect(page.locator('[data-testid="govern-next-move-rule"]')).not.toHaveText(
    first.best.name,
  );

  const second = await expectedNextMove(page);
  expect(second.best).not.toBeNull();
  expect(second.best.id).not.toBe(first.best.id);
  await expect(page.locator('[data-testid="govern-next-move-rule"]')).toHaveText(second.best.name);
  await expect(page.locator('[data-testid="govern-next-move-cleared"]')).toHaveText(
    String(second.best.cleared),
  );
  await expect(band).toContainText(`of the ${second.openNow} open violation`);
  expect(second.remaining).toBe(first.remaining - 1);
  await expect(band).toContainText(`${second.remaining} unenforced rule`);
});

test('Govern shows a designed finished state once every rule is enforced', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/#/govern', { waitUntil: 'domcontentloaded' });
  await expect(page.locator(BAND)).toBeVisible();

  await page.evaluate(() => {
    const CC = (window as unknown as { CC: any }).CC;
    CC.ruleList().forEach((r: any) => CC.enforceAny(r.id));
  });

  const band = page.locator(BAND);
  await expect(band).toContainText(/Nothing left to enforce/i);
  const total = await page.evaluate(
    () => (window as unknown as { CC: any }).CC.ruleList().length,
  );
  await expect(band).toContainText(`All ${total} rules are enforced`);
  await expect(page.locator('[data-testid="govern-next-move-rule"]')).toHaveCount(0);
});
