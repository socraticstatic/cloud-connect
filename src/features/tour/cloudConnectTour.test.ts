import { describe, it, expect, vi } from 'vitest';
import { cloudConnectTour } from './cloudConnectTour';
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
     forward, never bounced. */
  it('visits the DEMO_BEATS sections in order, and never doubles back', () => {
    expect(sections()).toEqual(DEMO_BEATS.map(b => b.route));
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
