import { describe, it, expect } from 'vitest';
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
    const costStep = cloudConnectTour.find(s => sectionOf(s.route) === '/cost');
    const costBeat = DEMO_BEATS.find(b => b.route === '/cost')!;
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
    expect(beat('govern-groups').route).toBe('/govern?tab=groups');
    expect(beat('group-policy').route).toBe('/govern?tab=policies');
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
