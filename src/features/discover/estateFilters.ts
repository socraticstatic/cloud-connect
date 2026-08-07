import type { FabricRegion } from '../../engine/types';

/**
 * Estate filter state for Discover's tree and map. Three independent facets
 * that AND together: which cloud, which path (on the fabric or public
 * internet), which domain (network or AI/GPU). `'all'` on any facet drops it
 * out of the conjunction entirely, so `EMPTY_ESTATE_FILTERS` matches every
 * region — the default, unfiltered state.
 */
export interface EstateFilters {
  cloud: string | 'all';
  path: 'private' | 'public' | 'all';
  domain: 'network' | 'ai' | 'all';
}

export const EMPTY_ESTATE_FILTERS: EstateFilters = { cloud: 'all', path: 'all', domain: 'all' };

/** The AI/GPU clouds — the same special-case `providerName` (ai-fabric's
 *  insightsFigures.ts) uses to name CoreWeave and Nebius. Everything else on
 *  the estate is 'network'. */
const AI_CLOUD_IDS: ReadonlySet<string> = new Set(['cw', 'neb']);

/** Whether a region belongs to the current filter scope. Cloud, path and
 *  domain narrow conjunctively — each active facet must agree, or the region
 *  is out. */
export function regionMatches(r: FabricRegion, f: EstateFilters): boolean {
  if (f.cloud !== 'all' && r.cloudId !== f.cloud) return false;
  if (f.path !== 'all' && r.path !== f.path) return false;
  if (f.domain !== 'all') {
    const isAi = AI_CLOUD_IDS.has(r.cloudId);
    if (f.domain === 'ai' && !isAi) return false;
    if (f.domain === 'network' && isAi) return false;
  }
  return true;
}
