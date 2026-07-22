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
 * for volume and budget, `modelCatalog()` for price. No literals, no clock,
 * no random.
 */

/** tokenMeterList() and modelRoutes() iterate the same TOKEN_BUDGETS-keyed
 *  object in the same order; this maps each metered identity to the catalog
 *  model it actually calls. */
export const TAG_MODEL: Record<string, string> = {
  'rd-helion': 'helion-70b',
  'classified-helion': 'helion-cls-13b',
  'shared-services': 'gpt-class',
};

/** The external, third-party model. Its price is the comparison rate: what the
 *  same token volume would have cost had every identity been routed to it. */
export const EXTERNAL_MODEL_ID = 'gpt-class';

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

export interface AiSpendRow {
  tag: string;
  /** True once the identity's endpoint prerequisites are met and it meters. */
  metering: boolean;
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
  meteringCount: number;
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

const priceOf = (catalog: ModelCatalogEntry[], modelId: string) =>
  catalog.find(m => m.id === modelId)?.price ?? 0;

const nameOf = (catalog: ModelCatalogEntry[], modelId: string) =>
  catalog.find(m => m.id === modelId)?.name ?? modelId;

export function aiSpendRows(cc: CloudControl): AiSpendRow[] {
  const meters = cc.tokenMeterList() as TokenMeter[];
  const catalog = cc.modelCatalog() as ModelCatalogEntry[];
  const externalPrice = priceOf(catalog, EXTERNAL_MODEL_ID);

  return meters.map(m => {
    const modelId = TAG_MODEL[m.tag] ?? '';
    const price = priceOf(catalog, modelId);
    return {
      tag: m.tag,
      metering: m.ready,
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
    identityCount: rows.length,
  };
}

export function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(Math.round(n));
}

export function fmtUsd(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(2)}`;
}
