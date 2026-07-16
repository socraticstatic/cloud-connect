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

/** Tree node keys are path-joined: `aws`, `aws/use1`, `aws/use1/vpcprod`. */
export const cloudKey = (cloudId: string) => cloudId;
export const regionKey = (cloudId: string, regionId: string) => `${cloudId}/${regionId}`;
export const vpcKey = (cloudId: string, regionId: string, vpcId: string) => `${cloudId}/${regionId}/${vpcId}`;

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
