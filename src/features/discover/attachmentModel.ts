import type { CloudControl } from '../../engine/types';
import { buildMap } from './buildMap';
import {
  regionsOf, vpcsOf, regionLatencyMap, regionLatencyPathMap,
  type Cloud, type Region, type Vpc,
} from './discoveryModel';

/**
 * Pure derivations for the Attachment Map — the chain from a workload through
 * its cloud gateways and AT&T circuit to the fabric, and the map-wide model
 * the layout consumes. Deterministic: VLANs come from seeded array indices,
 * ASNs are constants, latency comes from the ONE derivation
 * (`regionLatencyMap`/`regionLatencyPathMap`) and nothing else.
 */

export const MAP_CLOUDS = ['aws', 'azure'] as const;

export const CUSTOMER_ASN = 65000;
/** Provider-side BGP ASN, per reality: Azure MSEE is fixed 12076; AWS 64512
 *  is the Amazon default for a private VIF on a DX gateway. */
export const PROVIDER_ASN: Record<string, number> = { aws: 64512, azure: 12076 };

export interface ChainHop { id: string; name: string; type: string }
export interface ChainCircuit {
  onrampId: string;
  name: string;
  type: string;
  site: string;
  bandwidth: string;
  vlan: number;
  bgp: { customerAsn: number; providerAsn: number };
}
export interface AttachmentChain {
  workload: {
    id: string; name: string; cidr: string; role: string;
    tags: string[]; vnet: boolean; ai: boolean;
    endpoints: { enis: number; serviceEndpoints: string[] };
  };
  gateways: ChainHop[];
  circuit: ChainCircuit | null;
  /** The ramp that WOULD serve this workload — the drawer's attach CTA target
   *  when `circuit` is null. */
  candidateOnrampId: string | null;
  path: { kind: 'private' | 'public'; latencyMs: number };
  internet: { egressNote: string } | null;
}

interface RampLike {
  id: string; name: string; type: string; sub: string; active?: boolean;
  site: { name: string }; targets: [string, string][];
}

const rampsOf = (cc: CloudControl): RampLike[] =>
  ((cc as unknown as { onramps?: RampLike[] }).onramps ?? []);

/** On-ramps whose targets reach this cloud/region (the engine's rampsFor logic). */
export function servingRamps(cc: CloudControl, cloudId: string, regionId: string): RampLike[] {
  return rampsOf(cc).filter(o => o.targets.some(([c, r]) => c === cloudId && r === regionId));
}

/** Bandwidth as the on-ramp seed states it — '—' when the seed makes no claim. */
export function bandwidthOf(sub: string): string {
  const m = sub.match(/(\d+\s*[GM]bps)/i);
  return m ? m[1].replace(/\s+/, '') : '—';
}

export function vlanFor(regionIndex: number, vpcIndex: number): number {
  return 100 + regionIndex * 10 + vpcIndex;
}

/** Short product label — mirrors FabricHero's onrampShort without a
 *  cross-feature import. */
export function rampShort(type: string): string {
  if (/direct connect/i.test(type)) return 'DX';
  if (/expressroute/i.test(type)) return 'ER';
  if (/interconnect/i.test(type)) return 'IX';
  if (/netbond/i.test(type)) return 'NetBond';
  return type;
}

export function attachmentChain(
  cc: CloudControl, cloudId: string, regionId: string, vpcId: string,
): AttachmentChain | null {
  const cloud = (cc.clouds as Cloud[]).find(c => c.id === cloudId);
  if (!cloud) return null;
  const regions = regionsOf(cc, cloudId);
  const regionIndex = regions.findIndex(r => r.id === regionId);
  if (regionIndex < 0) return null;
  const region: Region = regions[regionIndex];
  const list = vpcsOf(cc, regionId);
  const vpcIndex = list.findIndex(v => v.id === vpcId);
  if (vpcIndex < 0) return null;
  const vpc: Vpc = list[vpcIndex];

  const m = buildMap(vpc, cloud, region);
  const enis = m.subnets.reduce((n, s) => n + s.eni, 0);
  const serviceEndpoints = m.gateways.filter(g => g.ic === 's3').map(g => g.name);
  const gateways: ChainHop[] = m.gateways
    .filter(g => g.ic === 'dx' || g.ic === 'tgw')
    .map(g => ({ id: g.id, name: g.name, type: g.type }));

  const ramps = servingRamps(cc, cloudId, regionId);
  const ramp = ramps.find(r => r.active) ?? ramps[0] ?? null;

  const circuit: ChainCircuit | null = vpc.attached && ramp
    ? {
        onrampId: ramp.id, name: ramp.name, type: ramp.type,
        site: ramp.site.name, bandwidth: bandwidthOf(ramp.sub),
        vlan: vlanFor(regionIndex, vpcIndex),
        bgp: { customerAsn: CUSTOMER_ASN, providerAsn: PROVIDER_ASN[cloudId] ?? CUSTOMER_ASN },
      }
    : null;

  const kind = regionLatencyPathMap(cc)[regionId] ?? 'public';
  const latencyMs = regionLatencyMap(cc)[regionId] ?? 0;

  return {
    workload: {
      id: vpc.id, name: vpc.name, cidr: vpc.cidr, role: vpc.role,
      tags: vpc.tags ?? [], vnet: !!vpc.vnet, ai: !!vpc.ai,
      endpoints: { enis, serviceEndpoints },
    },
    gateways,
    circuit,
    candidateOnrampId: ramp?.id ?? null,
    path: { kind, latencyMs },
    internet: vpc.attached
      ? null
      : { egressNote: 'Traffic leaves through the internet gateway — no AT&T-controlled path.' },
  };
}

/** Every attached AWS/Azure workload riding this circuit. */
export function workloadsOnRamp(
  cc: CloudControl, onrampId: string,
): { cloudId: string; regionId: string; vpc: Vpc }[] {
  const out: { cloudId: string; regionId: string; vpc: Vpc }[] = [];
  for (const cloudId of MAP_CLOUDS) {
    for (const r of regionsOf(cc, cloudId)) {
      const ramps = servingRamps(cc, cloudId, r.id);
      const serving = ramps.find(x => x.active) ?? ramps[0] ?? null;
      if (serving?.id !== onrampId) continue;
      for (const v of vpcsOf(cc, r.id)) {
        if (v.attached) out.push({ cloudId, regionId: r.id, vpc: v });
      }
    }
  }
  return out;
}

export interface MapWorkload { cloudId: string; regionId: string; vpc: Vpc }
export interface AttachmentMapModel {
  sites: { id: string; name: string; city: string; onrampId?: string }[];
  onramps: { id: string; name: string; type: string; short: string; site: string; active: boolean }[];
  groups: {
    cloudId: string; cloudName: string; color: string;
    regions: { region: Region; regionIndex: number; workloads: MapWorkload[]; viaShort: string | null }[];
  }[];
}

export function buildAttachmentMapModel(cc: CloudControl): AttachmentMapModel {
  const branches = ((cc as unknown as { branches?: { id: string; name: string; city: string; onrampId?: string }[] }).branches ?? []);
  const clouds = (cc.clouds as Cloud[]).filter(c => (MAP_CLOUDS as readonly string[]).includes(c.id));
  return {
    sites: branches.map(b => ({ id: b.id, name: b.name, city: b.city, onrampId: b.onrampId })),
    onramps: rampsOf(cc).map(o => ({
      id: o.id, name: o.name, type: o.type, short: rampShort(o.type),
      site: o.site.name, active: !!o.active,
    })),
    groups: clouds.map(c => ({
      cloudId: c.id, cloudName: c.name, color: c.color,
      regions: regionsOf(cc, c.id).map((region, regionIndex) => {
        // Resolve the serving ramp for this region and compute its short label.
        // This ensures edge labels match attachmentChain's ramp choice consistently.
        const ramps = servingRamps(cc, c.id, region.id);
        const ramp = ramps.find(r => r.active) ?? ramps[0] ?? null;
        return {
          region, regionIndex,
          workloads: vpcsOf(cc, region.id).map(vpc => ({ cloudId: c.id, regionId: region.id, vpc })),
          viaShort: ramp ? rampShort(ramp.type) : null,
        };
      }),
    })),
  };
}
