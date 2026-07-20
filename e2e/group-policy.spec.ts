import { test, expect, type Page } from '@playwright/test';

/* The task this whole feature exists for: a person opens Govern and writes
   "allow west-branches to talk to west-workloads", sees what it would hit
   before committing, adds it, reads it back in plain language, and enforces
   it. Every assertion below is a step of that one sentence.

   Storage is cleared before the first load — no seeded auth, no dismissed
   tour, no replayed share link. Whatever a first-time visitor meets, this
   spec meets too. */

const RULE_NAME = 'west branches to west workloads';

async function dismissFirstVisitOverlays(page: Page) {
  // A genuine first visit may open the product tour / demo modal. Close
  // whichever is present rather than pre-seeding flags to hide them: the
  // point of clearing storage is to walk the path a real person walks.
  for (const name of [/^(skip|skip tour|close|got it|maybe later|no thanks)$/i]) {
    const btn = page.getByRole('button', { name });
    // eslint-disable-next-line no-await-in-loop
    while (await btn.first().isVisible().catch(() => false)) {
      await btn.first().click();
      await page.waitForTimeout(150);
    }
  }
  await page.keyboard.press('Escape').catch(() => {});
}

test('a person can author, preview, read back and enforce a group-to-group policy', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await page.goto('/#/govern', { waitUntil: 'domcontentloaded' });
  await dismissFirstVisitOverlays(page);

  // --- open the rule builder ---
  await page.getByRole('button', { name: /^New rule$/i }).click();
  const name = page.getByLabel('Rule name');
  await expect(name).toBeVisible();
  await name.fill(RULE_NAME);

  // --- express west-branches → west-workloads, allow ---
  await page.getByLabel('Source group').selectOption('west-branches');
  await page.getByLabel('Destination').selectOption('group:west-workloads');
  await page.getByLabel('Action').selectOption('allow');

  // --- dry run: the blast radius, before anything changes ---
  await page.getByRole('button', { name: /^Dry run$/i }).click();
  const dryRun = page.getByTestId('dry-run-result');
  await expect(dryRun).toBeVisible();

  /* A group policy that silently matches nothing is the exact failure this
     feature was built to avoid — so the count is read off the screen and
     asserted greater than zero, never merely asserted present. */
  const summary = (await dryRun.textContent()) ?? '';
  const matched = Number(/(\d+)\s+flows?\s+matched/.exec(summary)?.[1] ?? '0');
  expect(matched).toBeGreaterThan(0);

  // and it NAMES what it matched — a count alone is not checkable
  const namedFlows = dryRun.locator('li');
  expect(await namedFlows.count()).toBeGreaterThan(0);
  await expect(namedFlows.first()).toContainText(/\S/);

  // the dry run must agree with the engine, not with itself
  const engineMatched = await page.evaluate(() =>
    (window as unknown as { CC: { dryRun: (r: unknown) => { matched: unknown[] } } }).CC.dryRun({
      src: { tag: 'any', cloud: 'any', group: 'west-branches' },
      dst: { group: 'west-workloads' },
      ports: 'any',
      action: 'allow',
      chain: [],
    }).matched.length,
  );
  expect(matched).toBe(engineMatched);

  // --- add it, and read it back in the table ---
  await page.getByRole('button', { name: /^Add rule$/i }).click();

  const row = page.locator('tbody tr', { hasText: RULE_NAME });
  await expect(row).toHaveCount(1);
  const rowText = (await row.textContent()) ?? '';
  expect(rowText).not.toContain('[object Object]');
  expect(rowText).not.toContain('undefined');
  await expect(row).toContainText('West branches');
  await expect(row).toContainText('West workloads');
  await expect(row).toContainText('Unenforced');

  // --- enforce it, and confirm the ENGINE moved, not just the badge ---
  const enforcedBefore = await page.evaluate(
    n =>
      !!(window as unknown as { CC: { ruleList: () => { name: string; enforced?: boolean }[] } }).CC
        .ruleList()
        .find(r => r.name === n)?.enforced,
    RULE_NAME,
  );
  expect(enforcedBefore).toBe(false);

  await row.getByRole('button', { name: /more options/i }).click();
  await page.getByRole('menu').getByRole('button', { name: /^Enforce$/i }).click();

  await expect(row).toContainText('Enforced');
  await expect
    .poll(async () =>
      page.evaluate(
        n =>
          !!(window as unknown as { CC: { ruleList: () => { name: string; enforced?: boolean }[] } })
            .CC.ruleList()
            .find(r => r.name === n)?.enforced,
        RULE_NAME,
      ),
    )
    .toBe(true);
});
