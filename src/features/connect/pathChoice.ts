import type { CloudControl } from '../../engine/types';

/**
 * The two connectivity options AT&T offers into a cloud region. This is the
 * COMMERCIAL choice, one level above `attachCatalog.ts` — that file lists the
 * five transport mechanisms (IP / IPSec / PrivateLink / cloud-native /
 * dedicated) a path can ride. A customer picks a path here; the mechanism
 * follows from it.
 *
 * Every field on PathEvidence is read from the engine seeds — on-ramp targets,
 * region latency, `spof`, `ai`. Nothing here is asserted by copy alone: the
 * whole point of the surface is that the decision is driven by portal data.
 */
export type ConnectivityPathId = 'managed-direct' | 'tenanted';

export interface ConnectivityPath {
  id: ConnectivityPathId;
  label: string;
  /** The one-line promise. Names control, security, observability or cost. */
  promise: string;
  /** What actually carries it, stated plainly. */
  underlay: string;
}

export const CONNECTIVITY_PATHS: ConnectivityPath[] = [
  {
    id: 'managed-direct',
    label: 'Direct cloud connect',
    promise: 'Attach your VPCs in-region. AT&T carries and observes everything past the hand-off.',
    underlay: 'Shared high-capacity mid-mile into an AT&T-managed VPC.',
  },
  {
    id: 'tenanted',
    label: 'Dedicated tenant',
    promise: 'A private, tenanted path with committed performance and a reliability floor you control.',
    underlay: 'NetBond / NetBond Adv over AT&T MPLS, isolated per tenant.',
  },
];

export interface PathEvidence {
  pathId: ConnectivityPathId;
  available: boolean;
  isolation: 'shared' | 'per-tenant';
  /** Region seed latency, in ms. */
  latencyMs: number;
  viaPartnerFabric: boolean;
  onrampName: string | null;
  /** Everything true about this path here that a buyer must read before choosing. */
  caveats: string[];
}

interface SeedRegion {
  id: string;
  lat: number;
  spof?: boolean;
  ai?: boolean;
}
interface SeedOnramp {
  id: string;
  name: string;
  type: string;
  targets: [string, string][];
}

const isTenanted = (type: string) => /netbond/i.test(type);

/**
 * Evidence for both paths into one region, in catalog order.
 * Returns [] for a region the engine does not carry.
 */
export function pathEvidence(cc: CloudControl, cloudId: string, regionId: string): PathEvidence[] {
  const regions = ((cc as unknown as { regions: Record<string, SeedRegion[]> }).regions[cloudId] ?? []);
  const region = regions.find(r => r.id === regionId);
  if (!region) return [];

  const onramps = ((cc as unknown as { onramps?: SeedOnramp[] }).onramps ?? [])
    .filter(o => o.targets.some(([c, r]) => c === cloudId && r === regionId));
  const tenantedOnramp = onramps.find(o => isTenanted(o.type)) ?? null;

  const shared: string[] = [];
  if (region.spof) shared.push('This region has a single path today — provision a second on-ramp for a dual-path posture.');

  const directCaveats = [...shared];
  if (region.ai) {
    directCaveats.push(
      'No AT&T facility in this metro — the path extends over Equinix Fabric and lands you at L3. Nothing to configure on your side.',
    );
  }

  const tenantedCaveats = [...shared];
  if (!tenantedOnramp) {
    tenantedCaveats.push('No NetBond on-ramp targets this region yet — order one, or take the direct path.');
  }

  return [
    {
      pathId: 'managed-direct',
      available: true,
      isolation: 'shared',
      latencyMs: region.lat,
      viaPartnerFabric: Boolean(region.ai),
      onrampName: onramps.find(o => !isTenanted(o.type))?.name ?? null,
      caveats: directCaveats,
    },
    {
      pathId: 'tenanted',
      available: Boolean(tenantedOnramp),
      isolation: 'per-tenant',
      latencyMs: region.lat,
      viaPartnerFabric: false,
      onrampName: tenantedOnramp?.name ?? null,
      caveats: tenantedCaveats,
    },
  ];
}
