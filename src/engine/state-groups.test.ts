import { describe, it, expect } from 'vitest';
import { CC } from './index';

describe('group resolution', () => {
  it('resolves literal members', () => {
    const r = CC.resolveGroup('west-branches');
    expect(r.branchIds).toEqual(expect.arrayContaining(['br-sjc', 'br-sfo', 'br-bkl']));
    expect(r.count).toBe(3);
  });

  it('resolves cloudTag predicates', () => {
    const r = CC.resolveGroup('west-workloads');
    expect(r.vpcIds).toContain('vpcprod');   // Project=xyz
    expect(r.vpcIds).toContain('vpcdata');   // Project=abc
    expect(r.vpcIds).not.toContain('vpcbak'); // Project=ops
  });

  it('collects CIDRs for branch members', () => {
    const r = CC.resolveGroup('west-branches');
    expect(r.cidrs).toContain('10.60.0.0/20');
  });

  it('returns an empty resolution for an unknown group', () => {
    const r = CC.resolveGroup('nope');
    expect(r.count).toBe(0);
    expect(r.vpcIds).toEqual([]);
  });

  it('reports which groups an object belongs to', () => {
    expect(CC.groupsFor('br-sjc')).toContain('west-branches');
    expect(CC.groupsFor('vpcprod')).toContain('west-workloads');
  });

  // Address-plan safety net: branch CIDRs (10.60-10.63/20) and VPC CIDRs
  // (10.0-10.34/16) are disjoint today by construction, not by guard. A
  // future seed edit could collide them silently and make group CIDR
  // resolution ambiguous (same address claimed by a branch and a VPC).
  it('has no overlap between branch CIDRs and VPC CIDRs', () => {
    function range(cidr: string): [number, number] {
      const [ip, bitsStr] = cidr.split('/');
      const bits = Number(bitsStr);
      const parts = ip.split('.').map(Number);
      const asInt = ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
      const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
      const start = (asInt & mask) >>> 0;
      const end = (start | (~mask >>> 0)) >>> 0;
      return [start, end];
    }
    function overlaps(a: string, b: string): boolean {
      const [as, ae] = range(a);
      const [bs, be] = range(b);
      return as <= be && bs <= ae;
    }

    const branchCidrs = CC.branches.flatMap((b: any) => b.cidrs as string[]);
    const vpcCidrs = Object.values(CC.vpcs).flat().map((v: any) => v.cidr as string);

    const collisions: string[] = [];
    branchCidrs.forEach((bc) => {
      vpcCidrs.forEach((vc) => {
        if (overlaps(bc, vc)) collisions.push(`${bc} <-> ${vc}`);
      });
    });
    expect(collisions).toEqual([]);
  });

  // Mutations last — the engine is a shared singleton within this file.
  it('adds and removes a group', () => {
    const g = CC.addGroup({ id: 'tmp-grp', label: 'Temp', kind: 'workload', members: ['vpcbak'], predicates: [] });
    expect(g).toBeTruthy();
    expect(CC.resolveGroup('tmp-grp').vpcIds).toEqual(['vpcbak']);
    expect(CC.removeGroup('tmp-grp')).toBe(true);
    expect(CC.resolveGroup('tmp-grp').count).toBe(0);
  });

  it('updates a group with a new predicate and re-resolves', () => {
    CC.addGroup({ id: 'upd-grp', label: 'Upd', kind: 'workload', members: [], predicates: [] });
    expect(CC.resolveGroup('upd-grp').count).toBe(0);
    CC.updateGroup('upd-grp', {
      predicates: [{ source: 'cloudTag', key: 'Env', values: ['stage'] }],
    });
    const r = CC.resolveGroup('upd-grp');
    expect(r.vpcIds).toContain('vnetapp');   // Env=stage
    expect(r.vpcIds).not.toContain('vpcprod'); // Env=prod
    CC.removeGroup('upd-grp');
  });

  it('returns null when updating an unknown group', () => {
    expect(CC.updateGroup('does-not-exist', { members: [] })).toBe(null);
  });
});
