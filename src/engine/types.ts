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

export interface CloudControl {
  // --- core state (state.js) ---
  counts(): CloudControlCounts;
  subscribe(fn: (ev?: CloudControlEvent) => void): void;
  activateOnramp(id: string, silent?: boolean): void;
  applyFix(key: string, silent?: boolean): void;
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

  // --- routing advisor (state-routing.js) ---
  routeAdvisor(): {
    recommendations: { id: string; flowId: string; pathId?: string; title: string; detail: string; action: 'steer' | 'diversify' }[];
    events: { title: string; detail: string }[];
  };
  steerFlow(rowId: string, pathId: string): boolean;
  routeFlows(): { id: string; label: string; gbps: number; current: { attControlled: boolean; egressPerGb?: number; latencyMs?: number; label: string }; paths: { id: string; label: string; attControlled: boolean; available: boolean; egressPerGb?: number }[] }[];

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
