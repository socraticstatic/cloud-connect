import { describe, it, expect } from 'vitest';
import {
  allKeys,
  cloudVpcCount,
  cloudRegionCount,
  estateDomains,
  estateStats,
  openSummary,
  tagHex,
  toggleKey,
  regionKey,
  vpcKey,
  branchesOf,
  branchKey,
  isBranchKey,
  selectionMemberIds,
  selectionKind,
} from './discoveryModel';
import { CC } from '../../engine';

describe('discoveryModel', () => {
  it('derives per-cloud region and VPC counts from the engine', () => {
    expect(cloudRegionCount(CC, 'aws')).toBe(3); // use1 / usw2 / euw1
    expect(cloudVpcCount(CC, 'aws')).toBe(6); // 3 + 2 + 1 across the three regions
    expect(cloudRegionCount(CC, 'oci')).toBe(1);
  });

  it('estate tiles cover all three domains, flattened, and match counts()', () => {
    const stats = estateStats(CC);
    expect(stats.map(s => s.key)).toEqual([
      'sites',
      'onramps',
      'routes',
      'gateways',
      'clouds',
      'regions',
      'vpcs',
      'subnets',
      'workloads',
      'attached',
      'aiRegions',
      'models',
      'agents',
    ]);
    const c = CC.counts();
    expect(stats.find(s => s.key === 'clouds')!.value).toBe(c.clouds);
    expect(stats.find(s => s.key === 'routes')!.value).toBe(c.routes);
    expect(stats.find(s => s.key === 'gateways')!.value).toBe(c.gateways);
    expect(stats.find(s => s.key === 'workloads')!.value).toBe(c.workloads);
  });

  it('allKeys enumerates every cloud, region and VPC node once', () => {
    const keys = allKeys(CC);
    expect(new Set(keys).size).toBe(keys.length); // unique
    expect(keys).toContain('aws');
    expect(keys).toContain(regionKey('aws', 'use1'));
    expect(keys).toContain(vpcKey('aws', 'use1', 'vpcprod'));
    // one key per cloud + region + vpc
    const expected = CC.counts().clouds + CC.counts().regions + CC.counts().vpcs;
    expect(keys.length).toBe(expected);
  });

  it('toggleKey is immutable and flips membership', () => {
    const a = new Set<string>(['aws']);
    const b = toggleKey(a, 'aws/use1');
    expect(a.has('aws/use1')).toBe(false); // original untouched
    expect(b.has('aws/use1')).toBe(true);
    const c = toggleKey(b, 'aws/use1');
    expect(c.has('aws/use1')).toBe(false);
  });

  it('openSummary prefers resource maps over regions', () => {
    expect(openSummary(new Set())).toBe('collapsed view');
    expect(openSummary(new Set(['aws', 'aws/use1']))).toBe('1 region expanded');
    expect(openSummary(new Set(['aws', 'aws/use1', 'aws/use1/vpcprod']))).toBe('1 resource map expanded');
    expect(openSummary(new Set(['aws/use1/vpcprod', 'aws/use1/vpcdata']))).toBe('2 resource maps expanded');
  });

  it('tagHex neutralizes the amber finance tag but keeps other hues', () => {
    const tags = CC.TAGS as Record<string, { label: string; hex: string }>;
    expect(tagHex('finance-invoices', tags)).toBe('#64748b'); // de-ambered slate
    expect(tagHex('rd-helion', tags).toLowerCase()).not.toBe('#f2a23c');
    expect(tagHex('classified-helion', tags)).toBe(tags['classified-helion'].hex); // red kept
  });
});

/* Task E — branches are visible and selectable in Discover, and a selection
   turns into a group. The selection ids are tree paths; the engine's group
   members are estate ids, and the two are not the same string. */
describe('discovery selection', () => {
  it('branchesOf reads the six seeded customer sites off the engine', () => {
    const b = branchesOf(CC);
    expect(b.map(x => x.name)).toContain('San Jose campus');
    expect(b.length).toBe(CC.branches.length);
  });

  it('branchKey namespaces a site so it can never collide with a cloud id', () => {
    expect(branchKey('br-sjc')).toBe('site/br-sjc');
    expect(isBranchKey(branchKey('br-sjc'))).toBe(true);
    expect(isBranchKey(vpcKey('aws', 'usw2', 'vpcwest'))).toBe(false);
  });

  it('selectionMemberIds turns tree paths back into the estate ids addGroup stores', () => {
    const sel = new Set([branchKey('br-sjc'), vpcKey('aws', 'usw2', 'vpcwest')]);
    expect(selectionMemberIds(sel).sort()).toEqual(['br-sjc', 'vpcwest']);
  });

  it('selectionKind is site for branches only, workload for VPCs only, mixed for both', () => {
    expect(selectionKind(new Set([branchKey('br-sjc'), branchKey('br-sfo')]))).toBe('site');
    expect(selectionKind(new Set([vpcKey('aws', 'usw2', 'vpcwest')]))).toBe('workload');
    expect(selectionKind(new Set([branchKey('br-sjc'), vpcKey('aws', 'usw2', 'vpcwest')]))).toBe('mixed');
    expect(selectionKind(new Set())).toBe('mixed');
  });

  it('a selection resolves through the engine to exactly what was picked', () => {
    const sel = new Set([branchKey('br-sjc'), branchKey('br-sfo'), branchKey('br-bkl')]);
    const r = CC.resolveGroupSpec({
      kind: selectionKind(sel),
      members: selectionMemberIds(sel),
      predicates: [],
    });
    expect(r.branchIds.slice().sort()).toEqual(['br-bkl', 'br-sfo', 'br-sjc']);
    expect(r.vpcIds).toEqual([]);
  });

  it('a mixed selection keeps BOTH estates — neither half is silently dropped', () => {
    const sel = new Set([branchKey('br-sjc'), vpcKey('aws', 'usw2', 'vpcwest')]);
    const r = CC.resolveGroupSpec({
      kind: selectionKind(sel),
      members: selectionMemberIds(sel),
      predicates: [],
    });
    expect(r.branchIds).toEqual(['br-sjc']);
    expect(r.vpcIds).toEqual(['vpcwest']);
    expect(r.count).toBe(2);
  });
});

/* Task B — Discover reads in three parts: the network already in place, the
   cloud estate on the other side of it, and the AI workloads riding both. */
describe('estateDomains', () => {
  it('returns the three discovery domains in order', () => {
    expect(estateDomains(CC as never).map(d => d.key)).toEqual(['network', 'cloud', 'ai']);
  });

  it('network carries sites, on-ramps, routes and gateways from the engine', () => {
    const net = estateDomains(CC as never)[0];
    expect(net.stats.map(s => s.key)).toEqual(['sites', 'onramps', 'routes', 'gateways']);
    const c = (CC as never as { counts(): { routes: number; gateways: number } }).counts();
    expect(net.stats.find(s => s.key === 'routes')!.value).toBe(c.routes);
    expect(net.stats.find(s => s.key === 'gateways')!.value).toBe(c.gateways);
    expect(net.stats.find(s => s.key === 'sites')!.value).toBe(
      (CC as never as { branches: unknown[] }).branches.length,
    );
  });

  it('cloud carries the hyperscaler estate', () => {
    const cloud = estateDomains(CC as never)[1];
    expect(cloud.stats.map(s => s.key)).toEqual([
      'clouds', 'regions', 'vpcs', 'subnets', 'workloads', 'attached',
    ]);
  });

  it('ai counts only the AI regions, plus models and agents', () => {
    const ai = estateDomains(CC as never)[2];
    expect(ai.stats.map(s => s.key)).toEqual(['aiRegions', 'models', 'agents']);
    const aiRegions = Object.values(
      (CC as never as { regions: Record<string, { ai?: boolean }[]> }).regions,
    ).flat().filter(r => r.ai).length;
    expect(ai.stats.find(s => s.key === 'aiRegions')!.value).toBe(aiRegions);
    expect(ai.stats.find(s => s.key === 'models')!.value).toBe(
      (CC as never as { modelCatalog(): unknown[] }).modelCatalog().length,
    );
  });

  it('estateStats stays the flattening of every domain', () => {
    const flat = estateDomains(CC as never).flatMap(d => d.stats);
    expect(estateStats(CC as never)).toEqual(flat);
  });
});
