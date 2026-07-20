import { describe, it, expect } from 'vitest';
import { CC } from './index';

interface Flow { srcTag?: string; srcCloud?: string; srcBranch?: string; dst: string; dstVpc?: string; gbps: number; ports: string }

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
});
