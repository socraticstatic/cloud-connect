import type { CloudControl } from '../../engine/types';

/**
 * Pure derivations for the Discover drill-down tree — the counts, keys and
 * expand/collapse state logic, kept out of the component so they can be
 * unit-tested. All read from the engine handle (`window.CC`) or from a plain
 * open-set; none touch the DOM or React.
 */

export interface Cloud {
  id: string;
  name: string;
  color: string;
  mk: string;
  workloads: number;
  attached: boolean;
  ai?: boolean;
  partial?: boolean;
}
export interface Region {
  id: string;
  name: string;
  sub: string;
  subnets: number;
  /** Fixed per-region seeds; counts() sums them into the estate figures. */
  routes: number;
  gateways: number;
  lat: number;
  attached: boolean;
  spof?: boolean;
  ai?: boolean;
  /** [lat, lon] of the region, used to estimate on-ramp→region latency by distance */
  geo?: readonly [number, number];
}
export interface Vpc {
  id: string;
  name: string;
  cidr: string;
  azs: number;
  subnets: number;
  attached: boolean;
  role: string;
  tags?: string[];
  vnet?: boolean;
  ai?: boolean;
}
export interface Tag {
  label: string;
  hex: string;
  desc?: string;
}
/** A customer premises. Distinct from `onramps[].site`, which is the AT&T
 *  colo facility an on-ramp lives in — a branch is the customer's own
 *  building, and is what the stakeholder note means by "San Jose". */
export interface Branch {
  id: string;
  name: string;
  city: string;
  cidrs: string[];
  onrampId?: string;
  cloudTags?: Record<string, string>;
}

/** Tree node keys are path-joined: `aws`, `aws/use1`, `aws/use1/vpcprod`. */
export const cloudKey = (cloudId: string) => cloudId;
export const regionKey = (cloudId: string, regionId: string) => `${cloudId}/${regionId}`;
export const vpcKey = (cloudId: string, regionId: string, vpcId: string) => `${cloudId}/${regionId}/${vpcId}`;

/* --------------------------- selection --------------------------- */

/* Selection is a SECOND set, deliberately not the open-set: expanding a
   region to look inside it is not the same act as choosing it, and
   overloading toggleKey would make every drill-down silently claim
   something. The two sets share the same path vocabulary so a selected node
   is identifiable no matter how the tree is expanded. */

/** Sites live outside the cloud tree, so their key is namespaced rather
 *  than path-joined — `site/br-sjc` can never collide with a cloud id. */
export const branchKey = (branchId: string) => `site/${branchId}`;
export const isBranchKey = (key: string) => key.startsWith('site/');

export const branchesOf = (cc: CloudControl): Branch[] => ((cc.branches || []) as Branch[]);

/** Selection keys are tree paths; the engine's group `members` are estate
 *  ids. The estate id is always the last path segment — `aws/usw2/vpcwest`
 *  names the VPC `vpcwest`, `site/br-sjc` names the branch `br-sjc`. */
export function selectionMemberIds(sel: ReadonlySet<string>): string[] {
  return [...sel].map(k => k.slice(k.lastIndexOf('/') + 1));
}

/* `kind` is what the engine's resolver checks literal members against, so
   getting it wrong drops half a selection with nothing on screen saying
   why. A selection spanning both estates therefore becomes 'mixed' — the
   only kind that can hold a branch and a VPC at once. It is stated
   explicitly rather than left to addGroup's inference so the selection bar
   can show the person which estate their group will cover before they
   commit to it. */
export function selectionKind(sel: ReadonlySet<string>): 'workload' | 'site' | 'mixed' {
  const keys = [...sel];
  if (keys.length === 0) return 'mixed';
  const hasSite = keys.some(isBranchKey);
  const hasVpc = keys.some(k => !isBranchKey(k));
  if (hasSite && hasVpc) return 'mixed';
  return hasSite ? 'site' : 'workload';
}

export const regionsOf = (cc: CloudControl, cloudId: string): Region[] => (cc.regions[cloudId] || []) as Region[];
export const vpcsOf = (cc: CloudControl, regionId: string): Vpc[] => (cc.vpcs[regionId] || []) as Vpc[];

export const cloudRegionCount = (cc: CloudControl, cloudId: string): number => regionsOf(cc, cloudId).length;
export const cloudVpcCount = (cc: CloudControl, cloudId: string): number =>
  regionsOf(cc, cloudId).reduce((n, r) => n + vpcsOf(cc, r.id).length, 0);

export interface EstateStat {
  key: string;
  label: string;
  value: number;
}

/** The estate header tiles, in display order, from the engine's counts(). */
export function estateStats(cc: CloudControl): EstateStat[] {
  const c = cc.counts();
  return [
    { key: 'clouds', label: 'Clouds', value: c.clouds },
    { key: 'regions', label: 'Regions', value: c.regions },
    { key: 'vpcs', label: 'VPC · VNet', value: c.vpcs },
    { key: 'subnets', label: 'Subnets', value: c.subnets },
    { key: 'routes', label: 'Routes', value: c.routes },
    { key: 'gateways', label: 'Gateways', value: c.gateways },
    { key: 'workloads', label: 'Workloads', value: c.workloads },
    { key: 'attached', label: 'Attached', value: c.attached },
  ];
}

/** Every expandable key in the tree — used by Expand-all. */
export function allKeys(cc: CloudControl): string[] {
  const keys: string[] = [];
  for (const c of cc.clouds as Cloud[]) {
    keys.push(cloudKey(c.id));
    for (const r of regionsOf(cc, c.id)) {
      keys.push(regionKey(c.id, r.id));
      for (const v of vpcsOf(cc, r.id)) keys.push(vpcKey(c.id, r.id, v.id));
    }
  }
  return keys;
}

/** Immutable toggle: returns a new Set with `key` flipped. */
export function toggleKey(open: ReadonlySet<string>, key: string): Set<string> {
  const next = new Set(open);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

/**
 * Port of the original `updateScope()` — a human summary of how deep the tree
 * is currently expanded. Resource maps (depth-3 keys) win over regions.
 */
export function openSummary(open: ReadonlySet<string>): string {
  let maps = 0;
  let regions = 0;
  open.forEach(k => {
    const depth = k.split('/').length;
    if (depth === 3) maps++;
    else if (depth === 2) regions++;
  });
  if (maps) return `${maps} resource map${maps > 1 ? 's' : ''} expanded`;
  if (regions) return `${regions} region${regions > 1 ? 's' : ''} expanded`;
  return 'collapsed view';
}

/**
 * Tag chip color. The engine ships `finance-invoices` with an amber hex, but
 * the light Flywheel theme forbids amber, so that one policy tag renders in
 * neutral slate (its meaning — "no direct internet" — reads as an attention
 * tag, not a warm alert). Every other tag keeps its own hue.
 */
const TAG_HEX_OVERRIDE: Record<string, string> = { 'finance-invoices': '#64748b' };
export function tagHex(id: string, tags: Record<string, Tag>): string {
  return TAG_HEX_OVERRIDE[id] ?? tags[id]?.hex ?? '#64748b';
}
export function tagLabel(id: string, tags: Record<string, Tag>): string {
  return tags[id]?.label ?? id;
}

/** Gateway accent colors — de-ambered (NAT moves from amber to slate). */
export const GW_COLOR: Record<string, string> = {
  igw: '#0057b8', // cobalt — internet gateway
  nat: '#64748b', // slate — NAT (was amber in the original)
  dx: '#00a862', // green — Direct Connect / ExpressRoute
  s3: '#af29bb', // purple — service endpoint
  tgw: '#0891b2', // teal — transit / vWAN hub
  fw: '#c70032', // red — inspection firewall
};
