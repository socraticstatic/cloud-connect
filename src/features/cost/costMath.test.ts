import { estimateMonthlySavings, GB_PER_MO_PER_GBPS } from './costMath';

it('sums steer recommendations into $/mo using per-GB delta and flow volume', () => {
  const recs = [
    { id: 'r1', action: 'steer' as const, dCostPerGb: 0.07, gbps: 2.0 },
    { id: 'r2', action: 'diversify' as const, dCostPerGb: 0, gbps: 1.0 },
  ];
  // 0.07 $/GB * 2 Gbps * GB_PER_MO_PER_GBPS, diversify recs contribute 0
  expect(estimateMonthlySavings(recs)).toBe(Math.round(0.07 * 2 * GB_PER_MO_PER_GBPS));
});
