import { describe, it, expect } from 'vitest';
import { CC } from './index';

interface Flow { srcTag?: string | null; dstTag?: string | null; srcCloud?: string; srcBranch?: string; dst: string; dstVpc?: string; gbps: number; ports: string }

describe('branch-originated flows', () => {
  it('emits flows whose source is a branch', () => {
    const branchFlows = (CC.flows() as Flow[]).filter(f => f.srcBranch);
    expect(branchFlows.length).toBeGreaterThan(0);
  });

  it('points every branch flow at a real VPC', () => {
    const vpcIds = new Set(Object.values(CC.vpcs).flat().map((v: { id: string }) => v.id));
    (CC.flows() as Flow[]).filter(f => f.srcBranch).forEach(f => {
      expect(vpcIds.has(f.dstVpc!), `flow to unknown vpc ${f.dstVpc}`).toBe(true);
    });
  });

  it('is deterministic across calls', () => {
    const a = JSON.stringify(CC.flows());
    const b = JSON.stringify(CC.flows());
    expect(a).toBe(b);
  });

  it('still emits the original VPC-originated flows', () => {
    const vpcFlows = (CC.flows() as Flow[]).filter(f => !f.srcBranch);
    expect(vpcFlows.length).toBeGreaterThan(0);
    expect(vpcFlows.some(f => f.dst === 'internet')).toBe(true);
  });

  // A customer branch carries no governance tag. srcTag on a branch flow
  // must be null so tag-based rules (pol-insp etc.) never mis-match a
  // branch as if it were the tagged, classified party - group membership
  // is the correct match mechanism for branches, added in a later task.
  it('sets srcTag to null on every branch flow - branches carry no governance tag', () => {
    const branchFlows = (CC.flows() as Flow[]).filter(f => f.srcBranch);
    expect(branchFlows.length).toBeGreaterThan(0);
    branchFlows.forEach(f => {
      expect(f.srcTag).toBe(null);
    });
  });

  // The destination VPC's tag is still useful information - it's carried
  // under its own honestly-named field instead of being discarded.
  it('carries the destination VPC\'s first governance tag as dstTag on every branch flow', () => {
    const vpcById: Record<string, { tags?: string[] }> = Object.values(CC.vpcs).flat()
      .reduce((acc: Record<string, { tags?: string[] }>, v: any) => { acc[v.id] = v; return acc; }, {});
    const branchFlows = (CC.flows() as Flow[]).filter(f => f.srcBranch);
    expect(branchFlows.length).toBeGreaterThan(0);
    branchFlows.forEach(f => {
      const dstVpc = vpcById[f.dstVpc!];
      expect(dstVpc, `no vpc found for ${f.dstVpc}`).toBeTruthy();
      const expected = (dstVpc.tags || [])[0] || null;
      expect(f.dstTag).toBe(expected);
    });
  });

  // pol-insp ("Inspect classified egress") matches src.tag === 'classified-helion'.
  // Branch flows must never match it via srcTag - only group membership
  // (a later task) is a valid way for a branch to be subject to a tag rule.
  it('never matches the seeded "Inspect classified egress" rule against a branch flow', () => {
    const rule = (CC.ruleList() as { id: string }[]).find(r => r.id === 'pol-insp')!;
    expect(rule).toBeTruthy();
    const result = CC.dryRun(rule) as { matched: { flow: Flow }[] };
    const branchMatches = result.matched.filter(m => m.flow.srcBranch);
    expect(branchMatches.length).toBe(0);
  });
});
