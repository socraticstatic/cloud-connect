import type { CloudControl } from '../../engine/types';

/**
 * The two connectivity options AT&T offers into a cloud region. This is the
 * COMMERCIAL choice, one level above `attachCatalog.ts` — that file lists the
 * five transport mechanisms (IP / IPSec / PrivateLink / cloud-native /
 * dedicated) a path can ride. A customer picks a path here; the mechanism
 * follows from it.
 *
 * Every field on PathEvidence is read from the engine — `cc.fabricModel()`
 * for the shaped region (latency, reliability, which on-ramps reach it) and
 * the on-ramp seeds for the facility evidence (`site`, `sub`, `planned`).
 * Nothing here is asserted by copy alone, and nothing is asserted that the
 * engine does not carry: the whole point of the surface is that the decision
 * is driven by portal data.
 *
 * Named `pathEvidence.ts` (not `pathChoice.ts`) for the same reason
 * `attachCatalog.ts` is: data files are named after their content, and a
 * `pathChoice.ts` next to `PathChoice.tsx` collides on a case-insensitive
 * filesystem — `import from './PathChoice'` silently resolves to the `.ts`.
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

/**
 * The three states the engine already distinguishes for a path into a region.
 * There is no fourth: an on-ramp either carries this region today (`active`),
 * exists but does not (`active:false` — planned, or a facility with unused
 * capacity), or does not reach the region at all.
 */
export type PathAvailability = 'live' | 'provisionable' | 'none';

export const AVAILABILITY_LABEL: Record<PathAvailability, string> = {
  live: 'Live here',
  provisionable: 'Provisionable here',
  none: 'Not available here',
};

export interface PathEvidence {
  pathId: ConnectivityPathId;
  availability: PathAvailability;
  isolation: 'shared' | 'per-tenant';
  /** `fabricModel()` latency for this region, in ms — the figure the panel's Performance tile shows. */
  latencyMs: number;
  onrampName: string | null;
  /** Where traffic physically hands off — the on-ramp's `site.name`. */
  handoffSite: string | null;
  /** The on-ramp's own capacity/state line (`sub`), verbatim. Never parsed. */
  capacityNote: string | null;
  /** Everything true about this path here that a buyer must read before choosing. */
  caveats: string[];
}

/** Only the seed fields `fabricModel()` does not project through. */
interface SeedOnramp {
  id: string;
  sub?: string;
  planned?: boolean;
}

type ModelOnramp = ReturnType<CloudControl['fabricModel']>['onramps'][number];

const isTenanted = (type: string) => /netbond/i.test(type);

/**
 * Evidence for both paths into one region, in catalog order.
 * Returns [] for a cloud/region pair the engine does not carry.
 */
export function pathEvidence(cc: CloudControl, cloudId: string, regionId: string): PathEvidence[] {
  const model = cc.fabricModel();
  const region = model.regions.find(r => r.cloudId === cloudId && r.regionId === regionId);
  if (!region) return [];

  // `sub` and `planned` live only on the seeds; everything else comes off the
  // shaped model, so the figures agree with the rest of Connect by construction.
  const seedById = new Map<string, SeedOnramp>(
    ((cc as unknown as { onramps?: SeedOnramp[] }).onramps ?? []).map(o => [o.id, o]),
  );

  const ramps = region.onrampIds
    .map(id => model.onramps.find(o => o.id === id))
    .filter((o): o is ModelOnramp => Boolean(o));

  // Reliability is the model's, so this caveat and RegionPanel's pill can
  // never disagree — the pill reads `region.reliability` off the same shape.
  const shared: string[] = [];
  if (region.reliability !== 'dual') {
    shared.push('No dual-path posture here today — a second on-ramp is what makes this region path-diverse.');
  }

  const row = (
    pathId: ConnectivityPathId,
    isolation: PathEvidence['isolation'],
    mine: ModelOnramp[],
    whyNone: string,
  ): PathEvidence => {
    // A live on-ramp wins; otherwise the first one that reaches this region
    // is the one a customer would provision.
    const chosen = mine.find(o => o.active) ?? mine[0] ?? null;
    const availability: PathAvailability = !chosen ? 'none' : chosen.active ? 'live' : 'provisionable';
    const seed = chosen ? seedById.get(chosen.id) : undefined;

    const caveats = [...shared];
    if (availability === 'none') {
      caveats.push(whyNone);
    } else if (availability === 'provisionable') {
      caveats.push(
        seed?.planned
          ? 'Not live here yet — this on-ramp is planned for this region.'
          : 'Not live here yet — the facility is in place but is not carrying this region today.',
      );
    }

    return {
      pathId,
      availability,
      isolation,
      latencyMs: region.latencyMs,
      onrampName: chosen?.name ?? null,
      handoffSite: chosen?.site ?? null,
      capacityNote: seed?.sub ?? null,
      caveats,
    };
  };

  return [
    row(
      'managed-direct',
      'shared',
      ramps.filter(o => !isTenanted(o.type)),
      'No Direct Connect or ExpressRoute on-ramp reaches this region — order one, or take the dedicated tenant path.',
    ),
    row(
      'tenanted',
      'per-tenant',
      ramps.filter(o => isTenanted(o.type)),
      'No NetBond on-ramp targets this region — order one, or take the direct path.',
    ),
  ];
}
