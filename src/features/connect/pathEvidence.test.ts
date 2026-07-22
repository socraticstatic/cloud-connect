import { describe, it, expect } from 'vitest';
import { CC } from '../../engine';
import { CONNECTIVITY_PATHS, pathEvidence } from './pathEvidence';

const ev = (cloudId: string, regionId: string) => {
  const rows = pathEvidence(CC as never, cloudId, regionId);
  return {
    direct: rows.find(r => r.pathId === 'managed-direct')!,
    tenanted: rows.find(r => r.pathId === 'tenanted')!,
  };
};

/** The shaped region the rest of Connect renders from. */
const shaped = (cloudId: string, regionId: string) =>
  (CC as never as { fabricModel(): { regions: { cloudId: string; regionId: string; latencyMs: number; reliability: string }[] } })
    .fabricModel().regions.find(r => r.cloudId === cloudId && r.regionId === regionId)!;

/** The raw on-ramp seed, for asserting evidence is carried through verbatim. */
const seedOnramp = (id: string) =>
  (CC as never as { onramps: { id: string; sub: string; site: { name: string } }[] }).onramps.find(o => o.id === id)!;

describe('CONNECTIVITY_PATHS', () => {
  it('names exactly the two options the portal offers', () => {
    expect(CONNECTIVITY_PATHS.map(p => p.id)).toEqual(['managed-direct', 'tenanted']);
  });

  it('claims nothing about partner fabric or L3 — the engine carries neither', () => {
    const copy = CONNECTIVITY_PATHS.map(p => `${p.promise} ${p.underlay}`).join(' ');
    expect(copy).not.toMatch(/Equinix Fabric/i);
    expect(copy).not.toMatch(/\bL3\b/);
  });
});

describe('pathEvidence', () => {
  it('returns one row per path, in catalog order', () => {
    const rows = pathEvidence(CC as never, 'aws', 'use1');
    expect(rows.map(r => r.pathId)).toEqual(['managed-direct', 'tenanted']);
  });

  it("latency is fabricModel()'s, the same figure the region panel shows", () => {
    for (const [cloudId, regionId] of [['aws', 'use1'], ['aws', 'euw1'], ['azure', 'uks'], ['cw', 'cwe']] as const) {
      const expected = shaped(cloudId, regionId).latencyMs;
      const { direct, tenanted } = ev(cloudId, regionId);
      expect(direct.latencyMs).toBe(expected);
      expect(tenanted.latencyMs).toBe(expected);
    }
  });

  it('us-east-1: the tenanted path is live on an active on-ramp; the direct path has none', () => {
    const { direct, tenanted } = ev('aws', 'use1');
    expect(tenanted.availability).toBe('live');
    expect(tenanted.isolation).toBe('per-tenant');
    expect(tenanted.onrampName).toMatch(/NetBond/);
    // Nothing derives an available direct path here — no non-NetBond on-ramp reaches use1.
    expect(direct.availability).toBe('none');
    expect(direct.isolation).toBe('shared');
    expect(direct.onrampName).toBeNull();
    expect(direct.caveats.join(' ')).toMatch(/No Direct Connect or ExpressRoute on-ramp reaches this region/i);
  });

  it('availability never claims "live" for an on-ramp the engine has not activated', () => {
    const model = (CC as never as {
      fabricModel(): {
        regions: { cloudId: string; regionId: string; onrampIds: string[] }[];
        onramps: { id: string; active: boolean }[];
      };
    }).fabricModel();
    for (const r of model.regions) {
      const anyActive = r.onrampIds.some(id => model.onramps.find(o => o.id === id)?.active);
      const rows = pathEvidence(CC as never, r.cloudId, r.regionId);
      const live = rows.filter(row => row.availability === 'live');
      expect(live.length > 0).toBe(anyActive);
    }
  });

  it('a planned on-ramp reads provisionable and carries its own "not yet provisioned" text', () => {
    const { tenanted } = ev('cw', 'cwe');
    const nb2 = seedOnramp('nb2');
    expect(tenanted.availability).toBe('provisionable');
    expect(tenanted.capacityNote).toBe(nb2.sub);
    expect(tenanted.handoffSite).toBe(nb2.site.name);
    expect(tenanted.caveats.join(' ')).toMatch(/planned for this region/i);
  });

  it('an existing facility with unused capacity reads provisionable, worded differently from planned', () => {
    const { direct } = ev('aws', 'usw2');
    const dx1 = seedOnramp('dx1');
    expect(direct.availability).toBe('provisionable');
    expect(direct.capacityNote).toBe(dx1.sub);
    expect(direct.handoffSite).toBe(dx1.site.name);
    expect(direct.caveats.join(' ')).toMatch(/facility is in place/i);
    expect(direct.caveats.join(' ')).not.toMatch(/planned/i);
  });

  it('a path no on-ramp of its kind reaches reads "none", with nothing invented to fill it', () => {
    const { tenanted } = ev('azure', 'uks');
    expect(tenanted.availability).toBe('none');
    expect(tenanted.onrampName).toBeNull();
    expect(tenanted.handoffSite).toBeNull();
    expect(tenanted.capacityNote).toBeNull();
    expect(tenanted.caveats.join(' ')).toMatch(/No NetBond on-ramp targets this region/i);
  });

  it('the reliability caveat tracks fabricModel().reliability, not the raw spof seed', () => {
    for (const [cloudId, regionId] of [['aws', 'use1'], ['azure', 'uks'], ['cw', 'cwe']] as const) {
      const dual = shaped(cloudId, regionId).reliability === 'dual';
      const { direct, tenanted } = ev(cloudId, regionId);
      for (const row of [direct, tenanted]) {
        expect(row.caveats.some(c => /dual-path posture/i.test(c))).toBe(!dual);
      }
    }
  });

  it('never mentions Equinix Fabric or an L3 hand-off — the engine carries neither', () => {
    const model = (CC as never as { fabricModel(): { regions: { cloudId: string; regionId: string }[] } }).fabricModel();
    for (const r of model.regions) {
      const copy = pathEvidence(CC as never, r.cloudId, r.regionId).flatMap(row => row.caveats).join(' ');
      expect(copy).not.toMatch(/Equinix Fabric/i);
      expect(copy).not.toMatch(/\bL3\b/);
    }
  });

  it('an unknown region yields no rows rather than throwing', () => {
    expect(pathEvidence(CC as never, 'aws', 'nope')).toEqual([]);
  });

  it('an unknown cloud yields no rows, even with a real region id', () => {
    expect(pathEvidence(CC as never, 'nope', 'use1')).toEqual([]);
  });

  /* The engine is a shared singleton and mutations persist for the rest of
     this file — this one runs last on purpose. */
  it('re-derives when the estate moves: activating an on-ramp turns its path live', () => {
    expect(ev('aws', 'usw2').direct.availability).toBe('provisionable');

    const changed = (CC as never as { activateOnramp(id: string): boolean }).activateOnramp('dx1');
    expect(changed).toBe(true);

    const after = ev('aws', 'usw2').direct;
    expect(after.availability).toBe('live');
    expect(after.caveats.join(' ')).not.toMatch(/Not live here yet/i);
    // …and the sibling region the same on-ramp reaches moves with it.
    expect(ev('aws', 'euw1').direct.availability).toBe('live');
  });
});
