import { estimateMonthlySavings, publicGbps, PUBLIC_EXPOSURE_ALERT_USD } from './costMath';

it('estimates a steer rec as its share of public spend scaled by the per-GB discount', () => {
  // Single public flow carrying all public gbps: share = 1.
  // saving = 29900 * 1 * (0.07 / 0.09) = 23255.55… → 23256
  const recs = [
    { id: 'r1', action: 'steer' as const, dCostPerGb: 0.07, perGbCurrent: 0.09, gbps: 6.3 },
  ];
  expect(estimateMonthlySavings(recs, 29_900, 6.3)).toBe(23_256);
});

it('returns 0 when there is no public gbps to attribute spend to', () => {
  const recs = [
    { id: 'r1', action: 'steer' as const, dCostPerGb: 0.07, perGbCurrent: 0.09, gbps: 6.3 },
  ];
  expect(estimateMonthlySavings(recs, 29_900, 0)).toBe(0);
});

it('diversify recs contribute 0', () => {
  const recs = [
    { id: 'r1', action: 'steer' as const, dCostPerGb: 0.07, perGbCurrent: 0.09, gbps: 3.0 },
    { id: 'r2', action: 'diversify' as const, dCostPerGb: 0.07, perGbCurrent: 0.09, gbps: 3.0 },
  ];
  // Only r1 counts: share = 3/6 = 0.5 → 29900 * 0.5 * (0.07/0.09) = 11627.77… → 11628
  expect(estimateMonthlySavings(recs, 29_900, 6.0)).toBe(11_628);
});

it('guards a non-positive perGbCurrent to a 0 contribution', () => {
  const recs = [
    { id: 'r1', action: 'steer' as const, dCostPerGb: 0.07, perGbCurrent: 0, gbps: 6.3 },
  ];
  expect(estimateMonthlySavings(recs, 29_900, 6.3)).toBe(0);
});

it('publicGbps sums only flows whose current path is not AT&T controlled', () => {
  const flows = [
    { id: 'a', gbps: 6.3, current: { attControlled: false } },
    { id: 'b', gbps: 2.4, current: { attControlled: false } },
    { id: 'c', gbps: 4.0, current: { attControlled: true } },
  ];
  expect(publicGbps(flows)).toBeCloseTo(8.7);
});

it('exports the public-exposure alert threshold', () => {
  expect(PUBLIC_EXPOSURE_ALERT_USD).toBe(6000);
});
