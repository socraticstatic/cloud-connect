import type { CloudControl } from '../../engine/types';

/**
 * The single token-spend derivation for the AI Fabric.
 *
 * Two surfaces state token money: the Cost screen (`/ai/cost`) and the Cost /
 * Savings KPI tiles on the Observe screen (`/ai/observe`, via `aiBinding`).
 * They read this module rather than each re-deriving the same sum, so the two
 * screens cannot drift into stating different figures for the same estate.
 *
 * Everything here is a `CC` derivation taken at call time — `tokenMeterList()`
 * for volume, budget and endpoint readiness, `agentList()` for which model an
 * identity actually invokes, `modelCatalog()` for that model's name and price.
 * No literals, no clock, no random.
 *
 * ## Two different facts, never conflated
 *
 * The engine meters an identity's tokens from `promptTrace()` whether or not
 * its endpoint is attached (agents keep issuing requests; unattached, those
 * requests simply leave over the public internet). `tokenMeterList()` therefore
 * reports a `today` that can be non-zero while `ready` is false. Those are two
 * facts, not one:
 *
 * - `metering`        — this identity has accrued token spend today.
 * - `onGovernedPath`  — its endpoint's prerequisites are met, so that spend
 *                       rides the private fabric rather than the internet.
 *
 * A screen that reads either one as "how many identities are metering" and the
 * other as the token column will contradict itself in the seeded state, which
 * rests at `today > 0, ready === false`. Both are exported, separately named,
 * and every count on a screen must come from one of them.
 */

/** The external, third-party model. Its price is the comparison rate: what the
 *  same token volume would have cost had every identity been routed to it. */
export const EXTERNAL_MODEL_ID = 'gpt-class';

/** An agent's model authority is a scope, not a name: `invoke:helion-70b`. */
const INVOKE_SCOPE = 'invoke:';

interface TokenMeter {
  tag: string;
  ready: boolean;
  today: number;
  budget: number;
  pct: number;
}

interface ModelCatalogEntry {
  id: string;
  name: string;
  price: number;
  ready: boolean;
}

interface Agent {
  id: string;
  app: string;
  scopes: string[];
}

export interface AiSpendRow {
  tag: string;
  /** True once this identity has accrued token spend today. */
  metering: boolean;
  /** True once the identity's endpoint prerequisites are met, i.e. its spend
   *  rides the private fabric instead of leaving over the public internet. */
  onGovernedPath: boolean;
  tokensToday: number;
  budgetTokens: number;
  /** Percent of budget consumed — taken from the engine's own meter. */
  pct: number;
  modelId: string;
  modelName: string;
  /** $ per 1M tokens for the model this identity calls. */
  price: number;
  spendToday: number;
  spendIfExternal: number;
}

export interface AiSpendTotals {
  rows: AiSpendRow[];
  tokensToday: number;
  budgetTokens: number;
  spendToday: number;
  spendIfExternal: number;
  /** Never negative: what routing away from the external model kept. */
  savings: number;
  /** How many identities have accrued spend today. */
  meteringCount: number;
  /** How many identities call an attached endpoint. */
  governedCount: number;
  identityCount: number;
  /**
   * Token policies that carry a budget but no meter.
   *
   * Govern lists every token policy; the meters cover only the app tags the
   * engine actually meters, so a group-scoped policy (`west-workloads`) has a
   * ceiling and no consumption. Without this the two screens disagree in
   * public — Govern showing four budgets, Cost totalling three — and the
   * reader is left to guess which one is wrong. Derived, so a policy added or
   * removed changes the sentence rather than stranding it.
   */
  unmeteredPolicyTags: string[];
}

/**
 * Which catalog model this identity actually invokes, read off the engine's
 * own agent scopes rather than a map kept in parallel here.
 *
 * A miss is not survivable and must not be silent: a hardcoded map that fell
 * out of step with the engine used to yield `modelId: ''` → `price: 0` →
 * `spendToday: 0`, which renders as a blank model cell and a confident
 * `$0.00`. A wrong number stated calmly is worse than no screen.
 */
export function modelForTag(cc: CloudControl, tag: string): string {
  const agents = (cc.agentList?.() ?? []) as Agent[];
  const owner = agents.find(a => a.app === tag);
  const scope = owner?.scopes.find(s => s.startsWith(INVOKE_SCOPE));
  if (!scope) {
    throw new Error(
      `aiSpend: CC.tokenMeterList() meters "${tag}" but no agent in CC.agentList() ` +
        `carries an ${INVOKE_SCOPE}* scope for it, so its token spend cannot be priced. ` +
        `The engine's agents and its token meters have diverged.`,
    );
  }
  return scope.slice(INVOKE_SCOPE.length);
}

/** tag -> model id, for every identity the engine meters. */
export function tagModelMap(cc: CloudControl): Record<string, string> {
  const map: Record<string, string> = {};
  for (const m of cc.tokenMeterList() as TokenMeter[]) map[m.tag] = modelForTag(cc, m.tag);
  return map;
}

const priceOf = (catalog: ModelCatalogEntry[], modelId: string) =>
  catalog.find(m => m.id === modelId)?.price ?? 0;

const nameOf = (catalog: ModelCatalogEntry[], modelId: string) =>
  catalog.find(m => m.id === modelId)?.name ?? modelId;

export function aiSpendRows(cc: CloudControl): AiSpendRow[] {
  const meters = cc.tokenMeterList() as TokenMeter[];
  const catalog = cc.modelCatalog() as ModelCatalogEntry[];
  const externalPrice = priceOf(catalog, EXTERNAL_MODEL_ID);

  return meters.map(m => {
    const modelId = modelForTag(cc, m.tag);
    const price = priceOf(catalog, modelId);
    return {
      tag: m.tag,
      metering: m.today > 0,
      onGovernedPath: m.ready,
      tokensToday: m.today,
      budgetTokens: m.budget,
      pct: m.pct,
      modelId,
      modelName: nameOf(catalog, modelId),
      price,
      spendToday: (m.today / 1_000_000) * price,
      spendIfExternal: (m.today / 1_000_000) * externalPrice,
    };
  });
}

export function aiSpendTotals(cc: CloudControl): AiSpendTotals {
  const rows = aiSpendRows(cc);
  const spendToday = rows.reduce((s, r) => s + r.spendToday, 0);
  const spendIfExternal = rows.reduce((s, r) => s + r.spendIfExternal, 0);
  const metered = new Set(rows.map(r => r.tag));
  const unmeteredPolicyTags = (cc.tokenPolicyList() as { tag: string }[])
    .map(p => p.tag)
    .filter(tag => !metered.has(tag));
  return {
    unmeteredPolicyTags,
    rows,
    tokensToday: rows.reduce((s, r) => s + r.tokensToday, 0),
    budgetTokens: rows.reduce((s, r) => s + r.budgetTokens, 0),
    spendToday,
    spendIfExternal,
    savings: Math.max(0, spendIfExternal - spendToday),
    meteringCount: rows.filter(r => r.metering).length,
    governedCount: rows.filter(r => r.onGovernedPath).length,
    identityCount: rows.length,
  };
}

export function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(Math.round(n));
}

/**
 * Money, as the screens state it.
 *
 * Sub-cent is its own reading. `$0.00` used to print beside rows the same
 * screen described as metering — 674 metered tokens at sub-dollar prices is
 * about a fifth of a cent, and rounding that to `$0.00` makes the tile deny
 * the table under it. `<$0.01` is the same derivation, told truthfully. Zero
 * is still `$0.00`, because zero is zero.
 */
export function fmtUsd(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  if (n > 0 && n < 0.005) return '<$0.01';
  return `$${n.toFixed(2)}`;
}

/**
 * True when `n` is worth putting inside a sentence that claims money moved.
 *
 * `savings > 0` is not that test. At $0.0015 the raw guard passes while the
 * figure does not reach a cent, so the screen printed "holds $0.00 of that
 * spend back" — a cost-control claim contradicted by its own number. Guard on
 * what the reader will see, not on what the float holds: neither a zero nor a
 * sub-cent placeholder belongs inside a claim that money was held back.
 */
export function statesRealMoney(n: number): boolean {
  const shown = fmtUsd(n);
  return shown !== fmtUsd(0) && !shown.startsWith('<');
}
