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

/** Walks the tour end to end pressing only Next — never clicking a beat's
 *  action. This is the path the existing `runTour` helper can't see: it
 *  clicks every action, so it can't catch a beat that narrates something
 *  that never happened because no action ever ran. */
async function runTourNextOnly(page: Page): Promise<Beat[]> {
  await page.getByRole('button', { name: TOUR_LAUNCH }).click();

  const counter = page.getByTestId('tour-progress');
  await expect(counter).toBeVisible();
  const total = Number(/of (\d+)/.exec((await counter.textContent()) ?? '')![1]);
  expect(total).toBeGreaterThan(0);

  const beats: Beat[] = [];
  for (let i = 1; i <= total; i++) {
    await expect(counter).toHaveText(`Step ${i} of ${total}`);
    await expect(page.getByTestId('tour-spotlight')).toBeVisible();

    beats.push({
      title: ((await page.getByTestId('tour-title').textContent()) ?? '').trim(),
      text: (await page.getByTestId('tour-tooltip').innerText()) ?? '',
    });

    // Deliberately never click tour-action — this is the skip path.
    await page
      .getByRole('button', { name: i === total ? /^finish$/i : /^next$/i })
      .click();
  }

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

  /* …and they are spread through the arc rather than bolted onto the end.

     ONE deliberate exception: the FINAL beat (ai-fabric) names the group on
     purpose — the stakeholder ask is that the grouping vocabulary reaches
     the token layer, and the closing beat says so out loud. So the final
     beat is exempt from the position guard, and ONLY the final beat: a
     group beat landing at beats.length - 2 is still the bolted-on-epilogue
     failure this assertion exists to catch. */
  const idx = groupBeats.map(b => beats.indexOf(b));
  const threadIdx = idx.filter(i => i !== beats.length - 1);
  expect(Math.min(...threadIdx), 'the groups thread starts too late').toBeLessThan(3);
  expect(Math.max(...threadIdx), 'the groups thread runs past the close').toBeLessThan(beats.length - 2);

  // The exception is load-bearing, not vestigial: the closing beat MUST be
  // a group beat — grouping reaching the AI Fabric is part of the close,
  // visible to this guard rather than phrased around it.
  expect(idx, 'the closing beat no longer names the group').toContain(beats.length - 1);
  expect(beats[beats.length - 1].text).toContain('west-workloads');

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

/* THE SKIP-PATH CASE. `runTour` clicks every action, so it can never see a
   viewer who presses Next through discover-sites without naming the group —
   which used to leave govern-groups and group-policy narrating "holds 0"
   and "matches 0 modelled flows" for a group that was never made. */
test('pressing only Next never narrates a group that was never named', async ({ page }) => {
  await firstVisit(page);

  const groupsBefore = await groupIds(page);
  expect(groupsBefore).not.toContain('all-branch-sites');

  const beats = await runTourNextOnly(page);

  const groupBeats = groupBeatsIn(beats);
  expect(
    groupBeats.length,
    `groups are narrated by too few beats; titles were: ${beats.map(b => b.title).join(' | ')}`,
  ).toBeGreaterThanOrEqual(3);

  // The beat that reads the sites group back must not report it empty.
  const readBackBeat = groupBeats.find(b => /holds/i.test(b.text));
  expect(readBackBeat, 'no beat reads a group\'s membership back').toBeTruthy();
  expect(readBackBeat!.text).not.toMatch(/holds 0\b/);

  // The dry-run beat must not report zero flows/zero Gbps for a group
  // nobody named.
  const payoffBeat = groupBeats.find(b => /dry-run/i.test(b.text));
  expect(payoffBeat, 'no beat dry-runs the group policy').toBeTruthy();
  const figures = payoffBeat!.text.match(/\b\d+(?:\.\d+)?\b/g) ?? [];
  expect(figures.some(f => Number(f) > 0)).toBe(true);
  expect(payoffBeat!.text).not.toMatch(/matches 0 modelled flows/);

  /* The closing beat names west-workloads at the token layer on this path
     too — and it must stay TRUE here: pressing only Next never authored a
     Govern policy referencing west-workloads (ensurePayoffRule never ran),
     so the beat may speak of the group itself, which is seeded and was read
     back by govern-groups, but never of a policy the viewer supposedly
     wrote. */
  const closing = beats[beats.length - 1];
  expect(closing.text, 'the closing beat no longer names the group').toContain('west-workloads');
  expect(closing.text).not.toMatch(/polic\w* (?:that )?you (?:wrote|authored|named|enforced)/i);
});

/* The Discover beat's spotlight is a cutout the size of its anchor. When the
   anchor was the wrapper around all three domain sections it measured 364px
   at 1280x800 and 708px in an 812px-tall viewport — 87% of a phone screen,
   which highlights nothing — and ProductTour's `Math.max(16, …)` on-screen
   clamp (ProductTour.tsx:142) then dropped the 'top'-placed tooltip onto the
   spotlight it should sit above. The anchor is now the Cloud section alone,
   which is what the beat's copy actually speaks about ("clouds, regions, and
   VPCs"). Asserted as a fraction of the viewport, so it stays a guard rather
   than a pinned pixel count. */
test('the Discover spotlight highlights one section, not the whole estate header', async ({ page }) => {
  await firstVisit(page);
  await page.getByRole('button', { name: TOUR_LAUNCH }).click();
  await expect(page.getByTestId('tour-progress')).toHaveText(/Step 1 of/);

  const spotlight = page.getByTestId('tour-spotlight');
  await expect(spotlight).toBeVisible();
  await page.waitForTimeout(600); // ProductTour scrolls, then measures at +300ms

  const vh = page.viewportSize()!.height;
  const box = (await spotlight.boundingBox())!;
  const tip = (await page.getByTestId('tour-tooltip').boundingBox())!;

  expect(
    box.height / vh,
    `spotlight covers ${Math.round((box.height / vh) * 100)}% of the viewport — it should highlight a section, not the screen`,
  ).toBeLessThan(0.3);

  // The cutout is the Cloud section, not the wrapper around all three.
  const cloudBox = (await page.getByTestId('estate-cloud').boundingBox())!;
  expect(Math.abs(box.height - cloudBox.height)).toBeLessThan(40); // highlightPadding is 12 a side

  /* How much of the tooltip still lands on the cutout. ProductTour's 366px
     tooltip cannot fit above ANY element `scrollIntoView({block:'center'})`
     centres in a 720px viewport, so the `Math.max(16, …)` clamp fires
     whatever the anchor is — that is a ProductTour placement concern, not an
     anchor one. What the anchor controls is how BAD it gets: the old
     three-section wrapper was 388px of cutout, this is ~135px. Asserted as a
     ceiling that the old anchor would have blown through. */
  /* `overlap < box.height` was a geometric identity, not a guard: an
     interval's intersection with the spotlight can never exceed the
     spotlight's own height, so it could only ever fail on exact full
     coverage. Measured against the OLD wrapper anchor it was also true
     (overlap 215.5 < box.height 387.5) — the "ceiling the old anchor would
     have blown through" claim that used to sit here was false.

     What actually matters is how much of the TOOLTIP itself the spotlight
     eats — asserted here as a fraction of the tooltip's own height, which a
     future placement regression (e.g. the `Math.max(16, …)` clamp pinning
     the tooltip flush against a taller cutout) can genuinely fail. */
  const overlap = Math.min(box.y + box.height, tip.y + tip.height) - Math.max(box.y, tip.y);
  const overlapFraction = overlap / tip.height;
  expect(
    overlapFraction,
    `${Math.round(overlapFraction * 100)}% of the tooltip's own height sits on the spotlight (${Math.round(overlap)}px of ${Math.round(tip.height)}px)`,
  ).toBeLessThan(0.5);
});
