import type { CloudControl } from '../../engine/types';
import { aiSpendTotals } from '../ai-fabric/aiSpend';
import { estimateMonthlySavings, publicGbps, toSavingsRec } from '../cost/costMath';

/**
 * The cross-section's derivations. Every figure the stack panel states comes
 * through here, and everything here reads the SAME engine getters the verb
 * pages read — aiSpendTotals for /ai/cost's money, fabricModel/regionLatency
 * for /naas/connect's paths, egress/arbitrage for /naas/cost's. A staged
 * delta and the committed state it predicts are the same arithmetic, so the
 * twin cannot promise what the estate would later deny.
 *
 * No React in this file, and no formatting beyond token counts — the panel
 * formats, this module states.
 */

export interface AiStratumFigures {
  modelsReady: number;
  modelsTotal: number;
  tokensToday: number;
  ungovernedTokensToday: number;
  spendToday: number;
  identityCount: number;
}

export interface NaasStratumFigures {
  regionsAttached: number;
  regionsTotal: number;
  sites: number;
  /** $/mo egress riding the public internet — /naas/cost's own split. */
  egressPubMo: number;
  /** $/mo egress already on the fabric. */
  egressPrivMo: number;
  /** $/mo still on the table if every on-ramp attached (arbitrage). */
  availableSavingsMo: number;
}

export interface CloudStratumFigures {
  clouds: number;
  regions: number;
  vpcs: number;
}

export function aiStratum(cc: CloudControl): AiStratumFigures {
  const totals = aiSpendTotals(cc);
  const catalog = (cc.modelCatalog?.() ?? []) as { ready: boolean }[];
  return {
    modelsReady: catalog.filter(m => m.ready).length,
    modelsTotal: catalog.length,
    tokensToday: totals.tokensToday,
    ungovernedTokensToday: totals.ungovernedTokensToday,
    spendToday: totals.spendToday,
    identityCount: totals.identityCount,
  };
}

export function naasStratum(cc: CloudControl): NaasStratumFigures {
  const fabric = cc.fabricModel();
  const egress = cc.egress();
  const arb = cc.arbitrage();
  return {
    regionsAttached: fabric.regions.filter(r => r.attached).length,
    regionsTotal: fabric.regions.length,
    sites: fabric.sites.length,
    egressPubMo: egress.pub,
    egressPrivMo: egress.priv,
    availableSavingsMo: arb.availableSavings,
  };
}

export function cloudStratum(cc: CloudControl): CloudStratumFigures {
  const counts = cc.counts();
  return { clouds: counts.clouds, regions: counts.regions, vpcs: counts.vpcs };
}

/* ------------------------- design mode: the moves ------------------------- */

export interface AttachOpportunity {
  kind: 'attach';
  regionId: string;
  label: string;
  cloudName: string;
  /** Both sides of the latency arrow, from regionLatency — never restated. */
  publicMs: number;
  privateMs: number;
  /** The arbitrage bucket this attach would move onto the fabric, if the
   *  engine prices one for this region's on-ramp; null when it does not. */
  bucketSavingMo: number | null;
  bucketLabel: string | null;
}

export interface SteerOpportunity {
  kind: 'steer';
  flowId: string;
  pathId: string;
  label: string;
  detail: string;
  /** $/mo saved, computed by costMath.estimateMonthlySavings — the SAME
   *  arithmetic /naas/cost's Steer-to-save panel states for this rec; null
   *  when that arithmetic prices it at nothing it can stand behind. */
  egressSavingMo: number | null;
}

export type StagedMove =
  | { kind: 'attach'; regionId: string }
  | { kind: 'steer'; flowId: string; pathId: string };

export function attachOpportunities(cc: CloudControl): AttachOpportunity[] {
  const fabric = cc.fabricModel();
  const buckets = cc.arbitrage().buckets;
  return fabric.regions
    .filter(r => !r.attached)
    .map(r => {
      const bucket = buckets.find(
        b => !b.attached && b.onrampId !== null && r.onrampIds.includes(b.onrampId),
      ) ?? null;
      const lat = cc.regionLatency(r.regionId);
      return {
        kind: 'attach' as const,
        regionId: r.regionId,
        label: r.name,
        cloudName: r.cloudName,
        publicMs: lat?.publicMs ?? r.publicMs,
        privateMs: lat?.privateMs ?? r.privateMs,
        bucketSavingMo: bucket ? bucket.saving : null,
        bucketLabel: bucket ? bucket.label : null,
      };
    });
}

export function steerOpportunities(cc: CloudControl): SteerOpportunity[] {
  const recs = cc.routeAdvisor().recommendations.filter(r => r.action === 'steer');
  const flows = cc.routeFlows();
  const pubSpendMo = cc.egress().pub;
  const pubGbps = publicGbps(flows);
  return recs.flatMap(rec => {
    const flow = flows.find(f => f.id === rec.flowId);
    if (!flow) return [];
    const target =
      (rec.pathId && flow.paths.find(p => p.id === rec.pathId)) ||
      flow.paths.find(p => p.attControlled && p.available);
    if (!target) return [];
    const saving = estimateMonthlySavings([toSavingsRec(rec, flows)], pubSpendMo, pubGbps);
    return [{
      kind: 'steer' as const,
      flowId: flow.id,
      pathId: target.id,
      label: flow.label,
      detail: rec.detail,
      egressSavingMo: saving > 0 ? saving : null,
    }];
  });
}

/* ------------------------------ staged deltas ----------------------------- */

export interface StagedDeltas {
  moves: number;
  /** Latency arrow for the worst staged attach (largest publicMs), stated in
   *  regionLatency's own figures; null when nothing staged attaches. */
  worstPath: { label: string; publicMs: number; privateMs: number } | null;
  /** Σ $/mo the staged moves keep, counting only moves the engine prices. */
  egressSavingMo: number;
  /** Moves whose saving the engine does not price — named, never summed. */
  unpricedMoves: string[];
}

export function stagedDeltas(cc: CloudControl, moves: StagedMove[]): StagedDeltas {
  const attaches = attachOpportunities(cc);
  const steers = steerOpportunities(cc);
  let egressSavingMo = 0;
  const unpriced: string[] = [];
  let worst: StagedDeltas['worstPath'] = null;

  for (const move of moves) {
    if (move.kind === 'attach') {
      const opp = attaches.find(o => o.regionId === move.regionId);
      if (!opp) continue;
      if (opp.bucketSavingMo !== null) egressSavingMo += opp.bucketSavingMo;
      else unpriced.push(opp.label);
      if (!worst || opp.publicMs > worst.publicMs) {
        worst = { label: opp.label, publicMs: opp.publicMs, privateMs: opp.privateMs };
      }
    } else {
      const opp = steers.find(o => o.flowId === move.flowId && o.pathId === move.pathId);
      if (!opp) continue;
      if (opp.egressSavingMo !== null) egressSavingMo += opp.egressSavingMo;
      else unpriced.push(opp.label);
    }
  }
  return { moves: moves.length, worstPath: worst, egressSavingMo, unpricedMoves: unpriced };
}

/** Apply staged moves through the real engine actions, in order. Returns the
 *  moves that failed — the caller states them, never swallows them. */
export function commitMoves(cc: CloudControl, moves: StagedMove[]): StagedMove[] {
  const failed: StagedMove[] = [];
  for (const move of moves) {
    const ok =
      move.kind === 'attach'
        ? cc.provisionRegion(move.regionId) !== null
        : cc.steerFlow(move.flowId, move.pathId);
    if (!ok) failed.push(move);
  }
  return failed;
}
