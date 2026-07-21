import { test, expect, type Page } from '@playwright/test';

/* The guided tour is the one artifact built to show the product off, and it
   is the thing a person clicks REPEATEDLY while rehearsing. Two properties
   matter and neither is provable by reading the step array:

   1. No dead beat. A step whose target is not in the DOM when its turn comes
      still renders a tooltip — ProductTour just falls back to a flat dark
      overlay. The spotlight cutout is the only thing that proves the target
      was actually found, so it is what this spec asserts, once per step.

   2. It survives a second run in the same session. Beats that mutate must be
      idempotent: the second pass must not fail, and must not leave a
      duplicate group or a duplicate rule behind. */

const TOUR_LAUNCH = /start guided tour/i;

async function firstVisit(page: Page) {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/#/discover', { waitUntil: 'domcontentloaded' });

  // A genuine first visit may open a demo modal. Close whichever is present
  // rather than pre-seeding flags to hide it. The tour launcher's own button
  // is excluded — that is the thing under test.
  const btn = page.getByRole('button', {
    name: /^(skip|skip tour|close|got it|maybe later|no thanks)$/i,
  });
  while (await btn.first().isVisible().catch(() => false)) {
    await btn.first().click();
    await page.waitForTimeout(150);
  }
  await page.keyboard.press('Escape').catch(() => {});
}

interface Beat {
  title: string;
  /** Everything the beat puts on screen: title, copy and action label. */
  text: string;
}

/** Walks the tour end to end, clicking each beat's action when it has one.
 *  Returns every beat, in order. */
async function runTour(page: Page): Promise<Beat[]> {
  await page.getByRole('button', { name: TOUR_LAUNCH }).click();

  const counter = page.getByTestId('tour-progress');
  await expect(counter).toBeVisible();
  const total = Number(/of (\d+)/.exec((await counter.textContent()) ?? '')![1]);
  expect(total).toBeGreaterThan(0);

  const beats: Beat[] = [];
  for (let i = 1; i <= total; i++) {
    await expect(counter).toHaveText(`Step ${i} of ${total}`);

    /* The proof that this beat is not dead. The cutout renders only when
       document.querySelector(step.targetSelector) returned an element on
       the route the step navigated to. */
    await expect(page.getByTestId('tour-spotlight')).toBeVisible();

    beats.push({
      title: ((await page.getByTestId('tour-title').textContent()) ?? '').trim(),
      text: (await page.getByTestId('tour-tooltip').innerText()) ?? '',
    });

    const action = page.getByTestId('tour-action');
    if (await action.count()) await action.click();

    await page
      .getByRole('button', { name: i === total ? /^finish$/i : /^next$/i })
      .click();
  }

  // Finishing closes the tour.
  await expect(page.getByTestId('tour-progress')).toHaveCount(0);
  return beats;
}

const groupBeatsIn = (beats: Beat[]) => beats.filter(b => /\bgroup/i.test(b.text));

interface Grp { id: string }
interface Rl { id: string; name: string }
type Win = {
  CC: {
    groupList: () => Grp[];
    ruleList: () => Rl[];
    ruleEnforced: (r: Rl) => boolean;
    resolveGroup: (id: string) => { count: number };
  };
};

const groupIds = (page: Page) =>
  page.evaluate(() => (window as unknown as Win).CC.groupList().map(g => g.id));

const ruleNames = (page: Page) =>
  page.evaluate(() => (window as unknown as Win).CC.ruleList().map(r => r.name));

test('the tour teaches groups, and every beat finds its target', async ({ page }) => {
  await firstVisit(page);

  const groupsBefore = await groupIds(page);
  expect(groupsBefore).not.toContain('all-branch-sites');

  const beats = await runTour(page);

  /* The arc the feature exists for has to be NARRATED across the tour, not
     compressed into one aside: naming a set in Discover, reading it back in
     Govern, and writing that name into a policy are three distinct beats. */
  const groupBeats = groupBeatsIn(beats);
  expect(
    groupBeats.length,
    `groups are narrated by too few beats; titles were: ${beats.map(b => b.title).join(' | ')}`,
  ).toBeGreaterThanOrEqual(3);

  /* …and they are spread through the arc rather than bolted onto the end. */
  const idx = groupBeats.map(b => beats.indexOf(b));
  expect(Math.min(...idx), 'the groups thread starts too late').toBeLessThan(3);
  expect(Math.max(...idx), 'the groups thread runs past the close').toBeLessThan(beats.length - 2);

  // The payoff beat states its dry-run in figures, and they are not zero.
  const payoffBeat = groupBeats.find(b => /dry-run/i.test(b.text))!;
  expect(payoffBeat, 'no beat dry-runs the group policy').toBeTruthy();
  const figures = payoffBeat.text.match(/\b\d+(?:\.\d+)?\b/g) ?? [];
  expect(figures.some(f => Number(f) > 0)).toBe(true);

  // …and the beats DID something. A beat that only points is weaker.
  expect(await groupIds(page)).toContain('all-branch-sites');

  const resolved = await page.evaluate(
    () => (window as unknown as Win).CC.resolveGroup('all-branch-sites').count,
  );
  expect(resolved).toBeGreaterThan(0);

  const names = await ruleNames(page);
  const payoff = names.filter(n => /branch sites/i.test(n) && /west workloads/i.test(n));
  expect(payoff, `no group-to-group rule authored; rules were: ${names.join(' | ')}`)
    .toHaveLength(1);

  const enforced = await page.evaluate(() => {
    const CC = (window as unknown as Win).CC;
    const r = CC.ruleList().find(x => /branch sites/i.test(x.name))!;
    return CC.ruleEnforced(r);
  });
  expect(enforced).toBe(true);
});

/* THE REHEARSAL CASE. addGroup returns null for an id that already exists,
   and addRule happily appends a second copy of the same rule — so a naive
   second pass either throws or silently doubles the estate. */
test('a second run in the same session completes, and duplicates nothing', async ({ page }) => {
  await firstVisit(page);

  await runTour(page);
  const afterFirst = {
    groups: await groupIds(page),
    rules: await ruleNames(page),
  };

  const beats = await runTour(page);
  expect(groupBeatsIn(beats).length).toBeGreaterThanOrEqual(3);

  const afterSecond = {
    groups: await groupIds(page),
    rules: await ruleNames(page),
  };

  // Not "still contains" — exactly the same multiset. One extra
  // "all-branch-sites" or one extra payoff rule is the failure this catches.
  expect(afterSecond.groups.slice().sort()).toEqual(afterFirst.groups.slice().sort());
  expect(afterSecond.rules.slice().sort()).toEqual(afterFirst.rules.slice().sort());

  expect(afterSecond.groups.filter(id => id === 'all-branch-sites')).toHaveLength(1);
  expect(
    afterSecond.rules.filter(n => /branch sites/i.test(n) && /west workloads/i.test(n)),
  ).toHaveLength(1);
});
