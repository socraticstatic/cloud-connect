/**
 * Typed handle onto the ported Cloud Control engine (`window.CC`).
 *
 * The engine modules themselves (state.ts, state-telemetry.ts, …) are
 * ported as-is from vanilla JS and carry `// @ts-nocheck` — they are not
 * typed at the definition site. This interface is the single place that
 * types the *consumed* surface, and it only covers what this phase (1.5)
 * and its immediate consumers need. Extend it as later phases (React
 * bridge hook, views) consume more of window.CC.
 *
 * Loose/`any` fields below intentionally mirror the untyped shape coming
 * out of the ported JS rather than guessing a stricter shape that could
 * drift from the real runtime object.
 */

export interface CloudControlCounts {
  clouds: number;
  regions: number;
  vpcs: number;
  attached: number;
  [key: string]: number;
}

export interface CloudControlEvent {
  type?: string;
  [key: string]: unknown;
}

export interface CloudControlScores {
  reach: number;
  exposure: number;
  policy: number;
  cost: number;
  perf: number;
  address: number;
  ai: number;
  [key: string]: number;
}

export interface CloudControlEgress {
  total: number;
  pub: number;
  priv: number;
  savings: number;
  forecast: string;
  [key: string]: unknown;
}

export interface FabricRegion {
  cloudId: string;
  regionId: string;
  name: string;
  cloudName: string;
  attached: boolean;
  reliability: 'dual' | 'single' | 'none';
  path: 'private' | 'public';
  /** RTT to the on-ramp serving this region — what it costs ON the fabric,
   *  whether or not it is attached yet. */
  privateMs: number;
  /** The same region over public transit — what it costs today while `path`
   *  is `'public'`, and the counterfactual once it is `'private'`. */
  publicMs: number;
  /** The figure for the path the region is on RIGHT NOW (`privateMs` when
   *  `path === 'private'`, `publicMs` otherwise). A surface rendering this
   *  bare must name the path beside it; a surface naming a SPECIFIC path
   *  must render that path's own figure instead. */
  latencyMs: number;
  onrampIds: string[];
}

export interface CloudControl {
  // --- core state (state.js) ---
  counts(): CloudControlCounts;
  /** Returns an unsubscribe function — required by useSyncExternalStore. */
  subscribe(fn: (ev?: CloudControlEvent) => void): () => void;
  activateOnramp(id: string, silent?: boolean): boolean;
  applyFix(key: string, silent?: boolean): boolean;
  undo(): boolean;
  canUndo(): string | false | null;
  simulateFailure(id: string): void;
  clearSim(): void;
  simImpact(): any;
  scores(): CloudControlScores;
  posture(): number;
  fixes: Record<string, boolean>;

  // --- telemetry (state-telemetry.js) ---
  telemetry(n: number): any;
  obsSummary(): any;
  /** Engine-known instants inside the telemetry window (fractions 0..1):
   *  the seeded anomaly, this-session attaches, an active failure sim.
   *  Every entry restates a fact the series already draw. */
  windowMoments(): { at: number; key: string; label: string }[];
  latencySeries?(...args: any[]): any;
  percentiles?(...args: any[]): any;
  topTalkers?(...args: any[]): any;

  // --- rules (state-rules.js) ---
  enforceRule(id: string, silent?: boolean): void;
  ruleList?(...args: any[]): any;
  addRule?(...args: any[]): any;
  removeRule?(...args: any[]): any;

  // --- billing (state-billing.js) ---
  egress(): CloudControlEgress;
  billing(): {
    lines: { item: string; kind: 'circuit' | 'usage'; amount: number; note: string }[];
    total: number; commit: number; commitDraw: number; commitPct: number;
    burst: number; uncommitted: number; savings: number; forecast: string;
  };
  utilization?(...args: any[]): any;
  arbitrage(): {
    hyperscalerBill: number;      // Σ publicCost, all buckets (attach-invariant), egress-only
    cloudConnectBill: number;     // current egress (pub+priv), egress-only
    savings: number;              // hyperscalerBill - cloudConnectBill
    savingsPct: number;           // 0..100
    fullyFabricBill: number;      // Σ attCost, all buckets (opportunity floor)
    availableSavings: number;     // cloudConnectBill - fullyFabricBill (still on the table)
    portFeesMo: number;           // current AT&T fabric port fees, disclosed separately
    fullyFabricPortFeesMo: number;// port fees if every on-ramp attached
    buckets: {
      key: string; label: string; category: 'internet' | 'cross-cloud' | 'committed';
      publicCost: number; attCost: number; saving: number; savingPct: number;
      attached: boolean; onrampId: string | null;
    }[];                          // sorted by saving desc (opportunity ranking)
  };

  // --- routing advisor (state-routing.js) ---
  routeAdvisor(): {
    recommendations: { id: string; flowId: string; pathId?: string; title: string; detail: string; action: 'steer' | 'diversify' }[];
    events: { title: string; detail: string }[];
  };
  steerFlow(rowId: string, pathId: string): boolean;
  /** `dst` is present on app rows only (`kind: 'app'`); cloud-to-cloud rows
   *  carry no destination bucket. */
  routeFlows(): { id: string; label: string; kind?: string; dst?: string; gbps: number; current: { attControlled: boolean; egressPerGb?: number; latencyMs?: number; label: string }; paths: { id: string; label: string; attControlled: boolean; available: boolean; egressPerGb?: number }[] }[];

  // --- fabric model (Cloud Fabric redesign C1, state-routing.js) ---
  fabricModel(): {
    sites: { id: string; label: string; firstMile: string | null }[];
    onramps: { id: string; name: string; type: string; site: string; active: boolean; targets: [string, string][] }[];
    regions: FabricRegion[];
    c2c: { id: string; label: string; gbps: number; viaPublic: boolean; controlled: boolean }[];
  };
  provisionRegion(regionId: string, opts?: { attachType?: string; onrampId?: string; resilient?: boolean }): FabricRegion | null;

  /**
   * THE region-latency derivation. `privateMs` is the region's RTT to the
   * on-ramp serving it — the figure /discover, Connect's Performance tile and
   * both PathChoice cards render, and the figure every AT&T flow row on
   * /naas/observe states. `publicMs` is the same region over public transit
   * (`privateMs * PUBLIC_TRANSIT_FACTOR`). Nothing outside the engine derives
   * a latency of its own; null for a region the engine does not carry.
   */
  regionLatency(regionId: string): { privateMs: number; publicMs: number } | null;
  /** What the public internet costs over the AT&T path between the same ends. */
  PUBLIC_TRANSIT_FACTOR: number;

  // --- console (state-console.js) ---
  setTokenPolicy(tag: string, patch: Record<string, unknown>): void;
  tokenPolicy?(tag: string): any;
  tokenPolicyList?(...args: any[]): any;
  modelCatalog?(...args: any[]): any;
  agentList?(...args: any[]): any;
  toggleAgent?(id: string): boolean;
  promptTrace?(...args: any[]): any;
  decisionLog?(...args: any[]): any;

  // --- actions catalog (state-actions.js) ---
  postureCatalog: any[];

  // --- share (state-share.js) ---
  shareUrl(): string;
  serialize(): string;
  hydrate(): boolean;

  // catch-all for the rest of the ported surface not yet typed
  [key: string]: any;
}
