import { describe, it, expect, vi } from 'vitest';
import { cloudConnectTour, activeCloudConnectTour } from './cloudConnectTour';
import { readCopy } from '../../components/tour/ProductTour';
import { DEMO_BEATS } from '../demo/demoScript';
import { CC } from '../../engine';

/** A step's route may carry a query (`/govern?tab=groups`); the SECTION it
 *  belongs to is the path in front of it. */
const sectionOf = (route: string) => route.split('?')[0];

/** Sections in order of first appearance. */
function sections(): string[] {
  const seen: string[] = [];
  for (const step of cloudConnectTour) {
    const s = sectionOf(step.route);
    if (seen[seen.length - 1] !== s) seen.push(s);
  }
  return seen;
}

describe('cloudConnectTour', () => {
  /* The old form of this test compared step routes to DEMO_BEATS one for one,
     which forbade a second beat inside a section as much as it forbade a
     wrong section. The invariant that actually matters survives the groups
     thread: the tour visits the six demo sections in the demo's order and
     never leaves a section and comes back to it — a viewer is walked
     forward, never bounced.

     One section joined since: /ai/observe (the Insights screen), deliberately
     placed on the AI leg between Cost and the token-policy close — evidence
     first, then governance, mirroring the NaaS half. Stated here as the exact
     expected list, so an accidental extra section still fails. */
  it('visits the DEMO_BEATS sections in order — Insights added on the AI leg — and never doubles back', () => {
    const expected = DEMO_BEATS.map(b => b.route);
    expected.splice(expected.indexOf('/ai/govern'), 0, '/ai/observe');
    expect(sections()).toEqual(expected);
  });

  it('does not route to /netops (dropped from the MVP demo arc)', () => {
    expect(cloudConnectTour.map(s => sectionOf(s.route))).not.toContain('/netops');
  });

  it('binds the cost step title/description to the cost DEMO_BEAT', () => {
    const costStep = cloudConnectTour.find(s => sectionOf(s.route) === '/naas/cost');
    const costBeat = DEMO_BEATS.find(b => b.route === '/naas/cost')!;
    expect(costStep).toBeDefined();
    expect(costStep!.title).toBe(costBeat.title);
    expect(readCopy(costStep!.description)).toBe(costBeat.narration);
    expect(costStep!.targetSelector).toBe('[data-tour="cost-hero"]');
  });

  it('gives every step an id, a title, copy and a target', () => {
    const ids = cloudConnectTour.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of cloudConnectTour) {
      expect(s.title.length, `step ${s.id} has no title`).toBeGreaterThan(0);
      expect(readCopy(s.description).length, `step ${s.id} has no copy`).toBeGreaterThan(0);
      expect(s.targetSelector, `step ${s.id} points at nothing`).toBeTruthy();
    }
  });

  /* --------------------------- the groups thread --------------------------- */

  const beat = (id: string) => cloudConnectTour.find(s => s.id === id)!;

  it('narrates the whole groups arc, not just the existence of groups', () => {
    for (const id of ['discover-sites', 'govern-groups', 'group-policy']) {
      expect(beat(id), `missing beat "${id}"`).toBeTruthy();
    }
    // Discover names it; Govern reads it back; Policies writes it into a rule.
    expect(sectionOf(beat('discover-sites').route)).toBe('/discover');
    expect(beat('govern-groups').route).toBe('/naas/govern?tab=groups');
    expect(beat('group-policy').route).toBe('/naas/govern?tab=policies');
  });

  it('threads the groups beats inside the arc rather than appending them', () => {
    const at = (id: string) => cloudConnectTour.findIndex(s => s.id === id);
    // Naming happens while looking at the sites, before anything is attached.
    expect(at('discover-sites')).toBeLessThan(at('connect'));
    // The payoff lands before Cost and AI Fabric close the story.
    expect(at('group-policy')).toBeLessThan(at('cost'));
    expect(at('group-policy')).toBeLessThan(at('ai-fabric'));
  });

  it('makes the group beats DO something, not merely point', () => {
    expect(beat('discover-sites').action).toBeTruthy();
    expect(beat('group-policy').action).toBeTruthy();
  });

  /* Figures. A beat that says "12 flows" as literal copy is wrong the moment
     the estate moves — and the beats before this one move it deliberately. */
  it('derives every figure it speaks from the engine, at the moment it is shown', () => {
    const sitesCopy = beat('discover-sites').description;
    const policyCopy = beat('group-policy').description;
    expect(typeof sitesCopy, 'sites copy is frozen at module load').toBe('function');
    expect(typeof policyCopy, 'policy copy is frozen at module load').toBe('function');

    expect(readCopy(sitesCopy)).toContain(String((CC.branches as unknown[]).length));

    const dry = CC.dryRun({
      src: { group: 'all-branch-sites' },
      dst: { group: 'west-workloads' },
      ports: 'any',
      action: 'allow',
      chain: [],
    }) as { matched: unknown[]; gbps: number };
    const text = readCopy(policyCopy);
    expect(text).toContain(String(dry.matched.length));
    expect(text).toContain(String(dry.gbps));
  });

  /* THE REHEARSAL CASE, at the unit level. addGroup returns null on a
     duplicate id and addRule appends without deduping, so a second click of
     either action is where a naive implementation breaks. */
  it('is idempotent: running both mutating beats twice changes nothing the second time', () => {
    const ids = () => (CC.groupList() as { id: string }[]).map(g => g.id).sort();
    const names = () => (CC.ruleList() as { name: string }[]).map(r => r.name).sort();

    beat('discover-sites').action!.onClick();
    beat('group-policy').action!.onClick();
    const afterFirst = { groups: ids(), rules: names() };

    expect(afterFirst.groups).toContain('all-branch-sites');
    expect(afterFirst.rules.filter(n => /branch sites/i.test(n))).toHaveLength(1);

    beat('discover-sites').action!.onClick();
    beat('group-policy').action!.onClick();

    expect(ids()).toEqual(afterFirst.groups);
    expect(names()).toEqual(afterFirst.rules);
  });

  it('leaves the rule it authored enforced, and resolving to real objects', () => {
    // depends on the beat above having run — same file, same engine singleton.
    const rule = (CC.ruleList() as { id: string; name: string }[]).find(r =>
      /branch sites/i.test(r.name),
    )!;
    expect(rule).toBeTruthy();
    expect(CC.ruleEnforced(rule)).toBe(true);

    const resolved = CC.resolveGroup('all-branch-sites') as {
      branchIds: string[];
      vpcIds: string[];
      count: number;
    };
    expect(resolved.count).toBe((CC.branches as unknown[]).length);
    // kind:'site' — a site group must never absorb a VPC.
    expect(resolved.vpcIds).toEqual([]);
  });
});

/* --------------------------- review-fix regression tests --------------------------- */

describe('cloudConnectTour — review fixes', () => {
  const beat = (id: string) => cloudConnectTour.find(s => s.id === id)!;

  it('derives "spanning N clouds" from resolveGroup(west-workloads), not a hardcoded figure', () => {
    const original = CC.resolveGroup.bind(CC);
    const real = original('west-workloads') as { vpcIds: string[] };

    // A fake resolution confined to AWS vpcs only. If the copy still says
    // "spanning three clouds" against this fake, it isn't reading
    // resolveGroup at all — it's a literal.
    const regions = CC.regions as Record<string, { id: string }[]>;
    const vpcsByRegion = CC.vpcs as Record<string, { id: string }[]>;
    const awsVpcIds = new Set(
      (regions.aws || []).flatMap(r => (vpcsByRegion[r.id] || []).map(v => v.id)),
    );
    const awsOnly = real.vpcIds.filter(id => awsVpcIds.has(id));
    expect(awsOnly.length, 'fixture needs at least one AWS vpc in west-workloads').toBeGreaterThan(0);

    const spy = vi.spyOn(CC, 'resolveGroup').mockImplementation((id: string) =>
      id === 'west-workloads'
        ? { vpcIds: awsOnly, branchIds: [], cidrs: [], count: awsOnly.length }
        : original(id),
    );
    try {
      const text = readCopy(beat('group-policy').description);
      expect(text).toMatch(/spanning 1 cloud\b/);
      expect(text).not.toContain('spanning three clouds');
    } finally {
      spy.mockRestore();
    }
  });

  it('splits the live-resolution claim from "All branch sites" — attaches it to the predicate group instead', () => {
    const text = readCopy(beat('govern-groups').description);
    // The claim belongs to West workloads (a predicate group), not to the
    // hand-picked sites group.
    expect(text).toMatch(/West workloads.*predicate/i);
    // "All branch sites" is described as a picked set, not as something
    // that re-resolves on its own.
    expect(text).toMatch(/All branch sites.*you named it/i);
  });

  it('says "in Discover", not a positional "N beats ago"', () => {
    const text = readCopy(beat('govern-groups').description);
    expect(text).toContain('in Discover');
    expect(text).not.toMatch(/beats? ago/i);
  });

  it('ensurePayoffRule never calls addRule when west-workloads is missing — guards before authoring rather than relying on the discarded null', () => {
    const savedWest = (CC._ as { groups: Record<string, unknown> }).groups['west-workloads'];
    expect(savedWest, 'west-workloads must be seeded for this test to mean anything').toBeTruthy();

    // Clear out any payoff rule left by earlier tests so ensurePayoffRule
    // takes the "author a new rule" branch, not "re-enforce the existing
    // one" — the branch where the discarded addRule() return lives.
    const existingPayoff = (CC.ruleList() as { id: string; name: string }[]).find(
      r => /branch sites/i.test(r.name) && /west workloads/i.test(r.name),
    );
    if (existingPayoff) CC.removeRule(existingPayoff.id);

    const addRuleSpy = vi.spyOn(CC, 'addRule');
    try {
      delete (CC._ as { groups: Record<string, unknown> }).groups['west-workloads'];
      expect(() => beat('group-policy').action!.onClick()).not.toThrow();
      expect(addRuleSpy).not.toHaveBeenCalled();
    } finally {
      (CC._ as { groups: Record<string, unknown> }).groups['west-workloads'] = savedWest;
      addRuleSpy.mockRestore();
    }

    // Restored: the same click now succeeds without throwing.
    expect(() => beat('group-policy').action!.onClick()).not.toThrow();
  });

  it('self-heals: reading govern-groups or group-policy never reports the sites group as empty, even if it was never named', () => {
    const savedSites = (CC._ as { groups: Record<string, unknown> }).groups['all-branch-sites'];
    try {
      delete (CC._ as { groups: Record<string, unknown> }).groups['all-branch-sites'];

      const govText = readCopy(beat('govern-groups').description);
      expect(govText).not.toMatch(/All branch sites.*holds 0\b/);

      // group-policy's thunk self-heals independently of govern-groups above.
      delete (CC._ as { groups: Record<string, unknown> }).groups['all-branch-sites'];
      const policyText = readCopy(beat('group-policy').description);
      const figures = policyText.match(/\bmatches (\d+) modelled flows/);
      expect(figures, 'no dry-run figure found in the payoff beat').toBeTruthy();
      expect(Number(figures![1])).toBeGreaterThan(0);
    } finally {
      if (savedSites) {
        (CC._ as { groups: Record<string, unknown> }).groups['all-branch-sites'] = savedSites;
      }
    }
  });

  it('does not instruct a gesture the action never performs ("tick the ones that belong together")', () => {
    const text = readCopy(beat('discover-sites').description);
    expect(text).not.toMatch(/tick the ones/i);
  });

  it('does not claim the viewer wrote the rule sentence by clicking a button', () => {
    const text = readCopy(beat('group-policy').description);
    expect(text).not.toMatch(/sentence you wrote/i);
  });

  it('beat 4 (govern) foreshadows that the rule grammar widens from tag to name, so beat 5 does not contradict it', () => {
    const govText = readCopy(beat('govern').description);
    expect(govText).toMatch(/FROM a tag.*name/i);
  });
});

/* ------------------- this week's surfaces: four new beats ------------------- */

describe('cloudConnectTour — assessment, intents, Andi, Insights', () => {
  const at = (id: string) => cloudConnectTour.findIndex(s => s.id === id);
  const beat = (id: string) => cloudConnectTour.find(s => s.id === id)!;

  it('threads each surface where the arc carries its subject, not onto the end', () => {
    // The assessment answers the question the Discover opener raises.
    expect(at('assessment')).toBe(at('discover') + 1);
    // Intents follow naming: you named what you have, now declare what must
    // stay true of it. Andi follows intents, because the intents band's own
    // empty state says "tell Andi the outcome you want".
    expect(at('intents')).toBe(at('discover-sites') + 1);
    expect(at('andi')).toBe(at('intents') + 1);
    // All three land before anything attaches.
    expect(at('andi')).toBeLessThan(at('connect'));
    // Insights opens the AI leg; the token-policy close stays the close.
    expect(at('insights')).toBe(cloudConnectTour.length - 2);
    expect(cloudConnectTour[cloudConnectTour.length - 1].id).toBe('ai-fabric');
  });

  it('anchors each beat to a surface that renders without preconditions', () => {
    expect(beat('intents').targetSelector).toBe('[data-testid="intent-threads"]');
    expect(beat('andi').targetSelector).toBe('[data-testid="andi-toggle"]');
    expect(beat('assessment').targetSelector).toBe('[data-testid="assessment-banner"]');
    expect(beat('insights').targetSelector).toBe('[data-tour="insights-kpis"]');
    expect(beat('insights').route).toBe('/ai/observe');
  });

  it('the new beats point, never mutate — no action, and no thunk, because none of them speaks a figure', () => {
    for (const id of ['assessment', 'intents', 'andi', 'insights']) {
      expect(beat(id).action, `${id} must not mutate the estate`).toBeUndefined();
      expect(typeof beat(id).description, `${id} speaks no figure`).toBe('string');
    }
  });

  /* The e2e position guard (tour.spec.ts) treats every beat whose text says
     "group" as part of the groups thread, and exempts only the FINAL beat
     from its placement rule. Insights sits one before the final beat, so the
     word would put it exactly on the boundary the guard exists to catch. */
  it('keeps the word "group" out of the insights beat', () => {
    const text = beat('insights').title + ' ' + readCopy(beat('insights').description);
    expect(text).not.toMatch(/\bgroup/i);
  });

  /* The skip mechanism. The assessment banner is the one anchor that can be
     absent for good (stage 'closed'); its beat must leave the run rather
     than spotlight nothing. */
  it('drops the assessment beat — and only it — when the assessment is closed', () => {
    expect(activeCloudConnectTour().map(s => s.id)).toEqual(cloudConnectTour.map(s => s.id));

    const spy = vi
      .spyOn(CC, 'assessment')
      .mockReturnValue({ stage: 'closed', day: 14, startedAt: null });
    try {
      const active = activeCloudConnectTour().map(s => s.id);
      expect(active).not.toContain('assessment');
      expect(active).toEqual(cloudConnectTour.map(s => s.id).filter(id => id !== 'assessment'));
    } finally {
      spy.mockRestore();
    }
  });

  /* The dismissal inference. A missing banner only means "dismissed" when
     the Discover surface is actually rendered — /discover is a lazy route,
     and at launch time its chunk may not have mounted yet. The intents band
     is the always-present sibling that proves the page is really there. */
  it('keeps the assessment beat when Discover is not mounted, drops it only when Discover renders without the banner', () => {
    const ids = () => activeCloudConnectTour().map(s => s.id);
    try {
      // Discover rendered, banner dismissed: the beat leaves the run.
      document.body.innerHTML = '<section data-testid="intent-threads"></section>';
      expect(ids()).not.toContain('assessment');

      // Discover rendered with the banner: the beat runs.
      document.body.innerHTML =
        '<div data-testid="assessment-banner"></div><section data-testid="intent-threads"></section>';
      expect(ids()).toContain('assessment');

      // Nothing of Discover in the DOM (lazy chunk not mounted, or another
      // page): navigation will remount it fresh, so the beat stays in.
      document.body.innerHTML = '';
      expect(ids()).toContain('assessment');
    } finally {
      document.body.innerHTML = '';
    }
  });

  it('speaks the shipped vocabulary: 14 days, the three intent verdicts, drafts-never-commits, the sankey', () => {
    expect(readCopy(beat('assessment').description)).toMatch(/14 days/);
    expect(readCopy(beat('assessment').description)).toMatch(/nothing is blocked or routed/i);
    expect(readCopy(beat('intents').description)).toMatch(/aligned, drifting, or violated/i);
    expect(readCopy(beat('andi').description)).toMatch(/drafts, never commits/i);
    expect(readCopy(beat('insights').description)).toMatch(/derives from the engine/i);
    expect(readCopy(beat('insights').description)).toMatch(/sankey/i);
  });
});
