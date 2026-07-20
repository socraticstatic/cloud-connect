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

  // I4 — the governanceTag branch of matchesPredicate. `tags` is the AT&T
  // governance taxonomy; `cloudTags` is the hyperscaler key/value map. The
  // two must never be conflated, so the governance axis needs its own proof.
  it('resolves governanceTag predicates against the AT&T taxonomy', () => {
    CC.addGroup({
      id: 'gov-grp', label: 'Gov', kind: 'workload', members: [],
      predicates: [{ source: 'governanceTag', values: ['rd-helion'] }],
    });
    const r = CC.resolveGroup('gov-grp');
    expect(r.vpcIds).toContain('vpcprod');
    expect(r.vpcIds).toContain('vnetapp');
    expect(r.vpcIds).toContain('cwgpu');
    expect(r.vpcIds).not.toContain('vpcbak'); // carries no `tags` key at all
    CC.removeGroup('gov-grp');
  });

  // I5 — branches carry cloudTags, so a predicate can select premises.
  // governanceTag predicates match no branch (branches have no `tags`), which
  // is expected: governance taxonomy is a cloud-workload concept.
  it('resolves cloudTag predicates against branches, not just VPCs', () => {
    CC.addGroup({
      id: 'west-pred', label: 'West by predicate', kind: 'site', members: [],
      predicates: [{ source: 'cloudTag', key: 'Region', values: ['west'] }],
    });
    const r = CC.resolveGroup('west-pred');
    expect(r.branchIds.slice().sort()).toEqual(['br-bkl', 'br-sfo', 'br-sjc']);
    expect(r.vpcIds).toEqual([]);
    expect(r.count).toBe(3);
    CC.removeGroup('west-pred');
  });

  // I3 — a literal member id that names nothing real must not inflate count.
  it('drops literal member ids that match no real branch or VPC', () => {
    CC.addGroup({
      id: 'phantom-grp', label: 'Phantom', kind: 'workload',
      members: ['vpcbak', 'typo-vpc'], predicates: [],
    });
    const r = CC.resolveGroup('phantom-grp');
    expect(r.vpcIds).toEqual(['vpcbak']);
    expect(r.count).toBe(1);
    expect(r.cidrs).toEqual(['10.9.0.0/16']);
    expect(CC.groupsFor('typo-vpc')).not.toContain('phantom-grp');
    CC.removeGroup('phantom-grp');
  });

  // M6 — vnetapp and vpcgcp2 genuinely share 10.4.0.0/16 in the seed.
  it('deduplicates CIDRs shared by two members', () => {
    CC.addGroup({
      id: 'dup-grp', label: 'Dup', kind: 'workload',
      members: ['vnetapp', 'vpcgcp2'], predicates: [],
    });
    const r = CC.resolveGroup('dup-grp');
    expect(r.count).toBe(2);
    expect(r.cidrs.filter((c: string) => c === '10.4.0.0/16')).toHaveLength(1);
    CC.removeGroup('dup-grp');
  });

  // M8 — mutators must not hand back live internal references.
  it('returns copies, so a caller cannot silently rewrite a group', () => {
    const g = CC.addGroup({
      id: 'copy-grp', label: 'Copy', kind: 'workload',
      members: ['vpcbak'], predicates: [],
    });
    g.members.push('vpcprod');
    g.label = 'hijacked';
    expect(CC.resolveGroup('copy-grp').vpcIds).toEqual(['vpcbak']);
    expect(CC.groupList().find((x: any) => x.id === 'copy-grp').label).toBe('Copy');

    const listed = CC.groupList().find((x: any) => x.id === 'copy-grp');
    listed.members.push('vpcprod');
    expect(CC.resolveGroup('copy-grp').vpcIds).toEqual(['vpcbak']);
    CC.removeGroup('copy-grp');
  });

  // C2 — undo has to actually undo. A restore that leaves the group in place
  // while writing 'Undid · …' into the audit trail is worse than no undo.
  it('undo actually removes a created group', () => {
    CC.addGroup({ id: 'undo-grp', label: 'Undo me', kind: 'workload', members: ['vpcbak'], predicates: [] });
    expect(CC.groupList().some((g: any) => g.id === 'undo-grp')).toBe(true);
    expect(CC.undo()).toBe(true);
    expect(CC.groupList().some((g: any) => g.id === 'undo-grp')).toBe(false);
    expect(CC.resolveGroup('undo-grp').count).toBe(0);
  });

  it('undo restores a removed group', () => {
    CC.addGroup({ id: 'undo-rm', label: 'Undo remove', kind: 'workload', members: ['vpcbak'], predicates: [] });
    expect(CC.removeGroup('undo-rm')).toBe(true);
    expect(CC.groupList().some((g: any) => g.id === 'undo-rm')).toBe(false);
    expect(CC.undo()).toBe(true);
    expect(CC.resolveGroup('undo-rm').vpcIds).toEqual(['vpcbak']);
    CC.removeGroup('undo-rm');
    CC.undo(); // pop the remove we just pushed
    CC.removeGroup('undo-rm');
    CC.undo();
    CC.undo(); // pop the original create — leaves the store as we found it
    expect(CC.groupList().some((g: any) => g.id === 'undo-rm')).toBe(false);
  });

  it('undo reverts a group update', () => {
    CC.addGroup({ id: 'undo-upd', label: 'Undo update', kind: 'workload', members: ['vpcbak'], predicates: [] });
    CC.updateGroup('undo-upd', { members: ['vpcprod'], label: 'Renamed' });
    expect(CC.resolveGroup('undo-upd').vpcIds).toEqual(['vpcprod']);
    expect(CC.undo()).toBe(true);
    expect(CC.resolveGroup('undo-upd').vpcIds).toEqual(['vpcbak']);
    expect(CC.groupList().find((g: any) => g.id === 'undo-upd').label).toBe('Undo update');
    CC.removeGroup('undo-upd');
  });

  // C1 — THE defining property: resolution is derived at call time, never
  // stored. rescanAccount('gcp') discovers vpc-ml-suite (Project=xyz), and
  // west-workloads must pick it up with no re-registration of anything.
  //
  // MUST STAY LAST IN THIS FILE: rescanAccount permanently mutates the shared
  // singleton for every test that follows it.
  it('resolves live — a VPC discovered after group creation joins the group', () => {
    const before = CC.resolveGroup('west-workloads');
    expect(before.vpcIds).not.toContain('vpcml');

    expect(CC.rescanAccount('gcp')).toBe('vpc-ml-suite');

    const after = CC.resolveGroup('west-workloads');
    expect(after.vpcIds).toContain('vpcml');
    expect(after.count).toBe(before.count + 1);
    expect(after.cidrs).toContain('10.19.0.0/16');
    expect(CC.groupsFor('vpcml')).toContain('west-workloads');
  });
});
