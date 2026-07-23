import { describe, it, expect } from 'vitest';
import { CC } from '../../engine';
import { aiBinding } from './aiBinding';

describe('aiBinding', () => {
  const b = aiBinding(CC);
  it('is an ai binding with the token KPIs, tabs, records, and a briefing', () => {
    expect(b.layer).toBe('ai');
    // Named, not counted. `Ungoverned` is the one figure on this screen a
    // reader cannot reconstruct from the others, so losing it silently is the
    // failure worth catching — a bare length check would pass on any six.
    expect((b.kpis() as { key: string }[]).map(k => k.key)).toEqual([
      'tokens',
      'ungoverned',
      'requests',
      'cost',
      'ttft',
      'savings',
    ]);
    expect(b.flowTabs().length).toBeGreaterThan(0);
    expect(b.records('none').length).toBeGreaterThan(0);
    expect(b.briefing().narrative.length).toBeGreaterThan(0);
  });
  it('group-by status collapses records into sensible buckets', () => {
    const byStatus = b.records('status').map(r => r.label.toLowerCase());
    const byRoute = b.records('route').map(r => r.label.toLowerCase());
    expect(byStatus.length).toBeGreaterThan(0);
    expect(byRoute.some(l => /private|public|governed/.test(l))).toBe(true);
  });
  it('is deterministic', () => {
    expect(aiBinding(CC).kpis()).toEqual(aiBinding(CC).kpis());
  });
});

/**
 * IMPORTANT: the flow panel's empty state and the TOKENS tile render 40px
 * apart on a permanent route, and they used to read different engine facts.
 * `tokenSeries()` charted all zeros for any identity the engine did not
 * consider meter-ready, so `series.every(v === 0)` fired the hint, while the
 * tile read `aiSpendTotals().tokensToday`, which counts the live agent
 * requests `promptTrace()` meters regardless of readiness. On a cold load of
 * `/ai/observe` that printed "No token flow yet" under `TOKENS 1.4k`.
 *
 * That was patched once in the COPY — a second hint branch explaining why the
 * chart disagreed with the tile. The engine now tails the series on the live
 * meter (`state-telemetry.ts`), so the panel is empty in exactly one state and
 * the hint is a constant again. The contract asserted here is the strong one:
 * the empty state and a non-zero tile are mutually exclusive.
 */
describe('aiBinding — the empty state cannot fire beside a non-zero tile', () => {
  const kpi = (key: string) =>
    (aiBinding(CC).kpis() as { key: string; value: string }[]).find(k => k.key === key)!.value;
  const flat = (tab: string) =>
    (aiBinding(CC).flowSeries(tab) as { v: number }[]).every(p => p.v === 0);

  it('says nothing has flowed only while nothing has been metered', () => {
    expect(kpi('tokens')).toBe('0');
    expect(flat('tokens'), 'seeded estate: nothing metered').toBe(true);
    expect(aiBinding(CC).emptyHint).toMatch(/No token flow yet/i);
  });

  it('charts the meter the moment it moves, even against an unready endpoint', () => {
    // Exactly what an agent tick does, and the state a cold /ai/observe opens
    // in: metered spend against an endpoint the engine does not chart history
    // for.
    const unready = (CC.tokenMeterList() as { tag: string; ready: boolean }[]).find(m => !m.ready)!;
    CC.meterTokens(unready.tag, 1_352);

    expect(kpi('tokens'), 'the tile is not zero').not.toBe('0');
    // Every tab derived from the token series, including the sub-dollar Cost
    // one that used to round itself flat.
    for (const tab of ['tokens', 'trend', 'flow', 'requests', 'cost']) {
      expect(flat(tab), `the ${tab} tab is flat beside a live tile`).toBe(false);
    }
  });

  it('keeps one hint, because there is only one empty state left to explain', () => {
    const hint = aiBinding(CC).emptyHint!;
    expect(hint).toMatch(/No token flow yet/i);
    expect(hint, 'a hint that has to explain the chart is a workaround').not.toMatch(
      /No charted flow in this window/i,
    );
  });
});
