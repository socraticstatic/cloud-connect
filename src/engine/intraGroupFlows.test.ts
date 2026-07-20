import { describe, it, expect } from 'vitest';
import { CC } from './index';

interface Flow { srcVpc?: string; dstVpc?: string; dst: string; srcGroups?: string[]; dstGroups?: string[] }

describe('workload-to-workload intra-group', () => {
  it('gives every intra-tag flow a concrete destination VPC', () => {
    const intra = (CC.flows() as Flow[]).filter(f => f.dst === 'intra-tag' && f.srcVpc);
    expect(intra.length).toBeGreaterThan(0);
    intra.forEach(f => expect(f.dstVpc, `${f.srcVpc} intra-tag flow has no dstVpc`).toBeTruthy());
  });

  it('never points a VPC flow at itself', () => {
    (CC.flows() as Flow[]).filter(f => f.srcVpc && f.dstVpc)
      .forEach(f => expect(f.dstVpc).not.toBe(f.srcVpc));
  });

  it('populates dstGroups for VPC-originated flows', () => {
    const tagged = (CC.flows() as Flow[]).filter(f => f.srcVpc && (f.dstGroups || []).length > 0);
    expect(tagged.length).toBeGreaterThan(0);
  });

  it('matches a workload-to-workload intra-group rule across regions', () => {
    const rule = { src: { group: 'west-workloads' }, dst: 'intra-group', ports: 'any', action: 'allow', chain: [] };
    const matched = CC.dryRun(rule).matched as { flow: Flow }[];
    expect(matched.length).toBeGreaterThan(0);
    // the point of the whole feature: same group, different regions, one rule
    const regions = new Set(matched.map(m => m.flow.srcVpc));
    expect(regions.size).toBeGreaterThan(1);
  });

  it('is deterministic', () => {
    expect(JSON.stringify(CC.flows())).toBe(JSON.stringify(CC.flows()));
  });
});
