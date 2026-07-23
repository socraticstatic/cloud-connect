import { describe, it, expect } from 'vitest';
import { CC } from '../../engine';
import { aiBinding } from './aiBinding';

describe('aiBinding', () => {
  const b = aiBinding(CC);
  it('is an ai binding with 5 KPIs, tabs, records, and a briefing', () => {
    expect(b.layer).toBe('ai');
    expect(b.kpis()).toHaveLength(5);
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
 * apart on a permanent route, and they read different engine facts.
 * `tokenSeries()` returns all zeros for any identity that is not meter-ready,
 * so `series.every(v === 0)` fires the hint; the tile reads
 * `aiSpendTotals().tokensToday`, which counts the live agent requests
 * `promptTrace()` meters regardless of readiness. On a cold load of
 * `/ai/observe` that printed "No token flow yet" under `TOKENS 1.4k`.
 *
 * The engine's readiness split is not touched — the HINT is made to read the
 * same derivation as the tile.
 */
describe('aiBinding — the empty hint cannot deny the tile beside it', () => {
  const kpi = (key: string) =>
    (aiBinding(CC).kpis() as { key: string; value: string }[]).find(k => k.key === key)!.value;
  const tokensFlat = () =>
    (aiBinding(CC).flowSeries('tokens') as { v: number }[]).every(p => p.v === 0);

  it('says nothing has flowed only while nothing has been metered', () => {
    expect(tokensFlat(), 'seeded estate: no identity is meter-ready').toBe(true);
    expect(kpi('tokens')).toBe('0');
    expect(aiBinding(CC).emptyHint).toMatch(/No token flow yet/i);
  });

  it('states the tile\'s own figure once tokens are metered but the series is still flat', () => {
    // Exactly what an agent tick does, and the state a cold /ai/observe opens
    // in: metered spend against an endpoint the engine does not yet chart.
    const unready = (CC.tokenMeterList() as { tag: string; ready: boolean }[]).find(m => !m.ready)!;
    CC.meterTokens(unready.tag, 1_352);

    expect(tokensFlat(), 'the flow panel is still empty — this is the seam').toBe(true);
    const tokens = kpi('tokens');
    expect(tokens, 'the tile is not zero').not.toBe('0');

    const hint = aiBinding(CC).emptyHint!;
    expect(hint, 'the hint denied the tile beside it').not.toMatch(/No token flow yet/i);
    expect(hint, 'and it states the tile\'s own figure, not a second derivation').toContain(tokens);
  });
});
