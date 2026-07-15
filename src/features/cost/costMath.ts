// 1 Gbps sustained ≈ 0.125 GB/s × ~2.63M s/mo ≈ 329,000 GB/mo.
export const GB_PER_MO_PER_GBPS = 329_000;

export type SavingsRec = { id: string; action: 'steer' | 'diversify'; dCostPerGb: number; gbps: number };

export function estimateMonthlySavings(recs: SavingsRec[]): number {
  return Math.round(recs
    .filter(r => r.action === 'steer')
    .reduce((s, r) => s + r.dCostPerGb * r.gbps * GB_PER_MO_PER_GBPS, 0));
}

// Parse the engine's rec.detail ("… −$0.07/GB") + flow volume into a SavingsRec.
export function toSavingsRec(
  rec: { id: string; flowId: string; action: 'steer' | 'diversify'; detail: string },
  flows: { id: string; gbps: number }[],
): SavingsRec {
  const m = rec.detail.match(/\$([0-9.]+)\/GB/);
  return {
    id: rec.id,
    action: rec.action,
    dCostPerGb: m ? parseFloat(m[1]) : 0,
    gbps: flows.find(f => f.id === rec.flowId)?.gbps ?? 0,
  };
}
