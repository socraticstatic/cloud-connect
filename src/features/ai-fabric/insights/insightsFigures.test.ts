import { describe, it, expect } from 'vitest';
import { CC } from '../../../engine';
import { aiSpendTotals, fmtUsd, fmtTokens } from '../aiSpend';
import {
  insightKpis,
  requestRows,
  applyFilters,
  activeChips,
  filterOptions,
  EMPTY_FILTERS,
} from './insightsFigures';

/* The engine is a shared singleton within this file: mutating tests drive
   promptTrace, which appends to the decision log and meters spend. Order
   matters - the driven-trace tests run after the shape assertions. */
describe('insightKpis', () => {
  it('states exactly the five gateway KPIs, in Figma order', () => {
    const kpis = insightKpis(CC);
    expect(kpis.map(k => k.key)).toEqual(['tokens', 'cost', 'ttft', 'requests', 'blocked']);
  });

  it('the cost KPI states the aiSpendTotals figures, not its own', () => {
    const kpis = insightKpis(CC);
    const totals = aiSpendTotals(CC);
    expect(kpis.find(k => k.key === 'cost')!.value).toBe(fmtUsd(totals.spendToday));
    expect(kpis.find(k => k.key === 'tokens')!.value).toBe(fmtTokens(totals.tokensToday));
  });

  it('requests and blocked count the decision log', () => {
    const log = CC.decisionLog!();
    const kpis = insightKpis(CC);
    expect(kpis.find(k => k.key === 'requests')!.value).toBe(String(log.length));
    expect(kpis.find(k => k.key === 'blocked')!.value).toBe(
      String(log.filter(d => !d.allowed).length),
    );
  });
});

describe('requestRows', () => {
  it('a driven allowed trace rows in newest-first with provider and savings', () => {
    CC.promptTrace!('rd-helion', 'helion-70b', 'insights figures test');
    const rows = requestRows(CC);
    const first = rows[0];
    expect(first.identity).toBe('rd-helion');
    expect(first.status).toBe(200);
    expect(first.provider).toBe('CoreWeave');
    expect(first.tokens).toBeGreaterThan(0);
    // helion-70b at $0.9/M vs GPT-class at $5/M - savings are real money math.
    expect(first.costSaved).toBeGreaterThan(0);
    expect(first.savedPct).toBeGreaterThan(0);
    expect(first.reason).toBeNull();
  });

  it('a driven denial rows in as 403, zero cost, with its reason', () => {
    CC.promptTrace!('classified-helion', 'gpt-class', 'insights figures test');
    const first = requestRows(CC)[0];
    expect(first.status).toBe(403);
    expect(first.cost).toBe(0);
    expect(first.reason).toMatch(/no external/i);
  });
});

describe('filters', () => {
  it('narrows by each key and by q against identity and model', () => {
    const rows = requestRows(CC);
    expect(rows.length).toBeGreaterThanOrEqual(2);

    const byProvider = applyFilters(rows, { ...EMPTY_FILTERS, provider: 'CoreWeave' });
    expect(byProvider.length).toBeGreaterThan(0);
    expect(byProvider.every(r => r.provider === 'CoreWeave')).toBe(true);

    const byStatus = applyFilters(rows, { ...EMPTY_FILTERS, status: '403' });
    expect(byStatus.every(r => r.status === 403)).toBe(true);
    expect(byStatus.length).toBeLessThan(rows.length);

    const byQ = applyFilters(rows, { ...EMPTY_FILTERS, q: 'helion-70b' });
    expect(byQ.length).toBeGreaterThan(0);
    expect(byQ.every(r => `${r.identity} ${r.model}`.includes('helion-70b'))).toBe(true);
  });

  it('filterOptions lists only values present in the rows', () => {
    const rows = requestRows(CC);
    const opts = filterOptions(rows);
    expect(opts.identity).toContain('rd-helion');
    expect(opts.status).toContain('200');
    opts.provider.forEach(p => expect(rows.some(r => r.provider === p)).toBe(true));
  });

  it('activeChips skips all-values and empty q, and names what it keeps', () => {
    expect(activeChips(EMPTY_FILTERS)).toEqual([]);
    const chips = activeChips({ ...EMPTY_FILTERS, provider: 'CoreWeave', q: ' gpt ' });
    expect(chips).toEqual([
      { key: 'provider', label: 'Provider', value: 'CoreWeave' },
      { key: 'q', label: 'Search', value: 'gpt' },
    ]);
  });
});
