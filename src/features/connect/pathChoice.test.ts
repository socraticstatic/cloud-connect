import { describe, it, expect } from 'vitest';
import { CC } from '../../engine';
import { CONNECTIVITY_PATHS, pathEvidence } from './pathChoice';

const ev = (cloudId: string, regionId: string) => {
  const rows = pathEvidence(CC as never, cloudId, regionId);
  return {
    direct: rows.find(r => r.pathId === 'managed-direct')!,
    tenanted: rows.find(r => r.pathId === 'tenanted')!,
  };
};

describe('CONNECTIVITY_PATHS', () => {
  it('names exactly the two options the portal offers', () => {
    expect(CONNECTIVITY_PATHS.map(p => p.id)).toEqual(['managed-direct', 'tenanted']);
  });
});

describe('pathEvidence', () => {
  it('returns one row per path, in catalog order', () => {
    const rows = pathEvidence(CC as never, 'aws', 'use1');
    expect(rows.map(r => r.pathId)).toEqual(['managed-direct', 'tenanted']);
  });

  it('us-east-1: both paths available, direct is shared, tenanted is per-tenant', () => {
    const { direct, tenanted } = ev('aws', 'use1');
    expect(direct.available).toBe(true);
    expect(direct.isolation).toBe('shared');
    expect(direct.viaPartnerFabric).toBe(false);
    expect(tenanted.available).toBe(true);
    expect(tenanted.isolation).toBe('per-tenant');
    expect(tenanted.onrampName).toMatch(/NetBond/);
  });

  it('latency is the region seed, not a literal', () => {
    const region = (CC as never as { regions: Record<string, { id: string; lat: number }[]> })
      .regions.aws.find(r => r.id === 'euw1')!;
    expect(ev('aws', 'euw1').direct.latencyMs).toBe(region.lat);
  });

  it('CoreWeave: the direct path extends over partner fabric and says so', () => {
    const { direct } = ev('cw', 'cwe');
    expect(direct.available).toBe(true);
    expect(direct.viaPartnerFabric).toBe(true);
    expect(direct.caveats.join(' ')).toMatch(/Equinix Fabric/);
    expect(direct.caveats.join(' ')).toMatch(/L3/);
  });

  it('UK South: the single-path region carries a reliability caveat on both paths', () => {
    const { direct, tenanted } = ev('azure', 'uks');
    expect(direct.caveats.join(' ')).toMatch(/single path/i);
    expect(tenanted.caveats.join(' ')).toMatch(/single path/i);
  });

  it('UK South: no NetBond on-ramp targets it, so the tenanted path is unavailable and explains why', () => {
    const { tenanted } = ev('azure', 'uks');
    expect(tenanted.available).toBe(false);
    expect(tenanted.onrampName).toBeNull();
    expect(tenanted.caveats.join(' ')).toMatch(/No NetBond on-ramp/i);
  });

  it('an unknown region yields no rows rather than throwing', () => {
    expect(pathEvidence(CC as never, 'aws', 'nope')).toEqual([]);
  });
});
