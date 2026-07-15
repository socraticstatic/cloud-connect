import { describe, it, expect } from 'vitest';
import { CC } from '../../engine';
import { networkBinding } from './networkBinding';

describe('networkBinding', () => {
  const b = networkBinding(CC);
  it('is a network binding with 6 KPIs (incl. Packet Loss), tabs, records, and a briefing', () => {
    expect(b.layer).toBe('network');
    expect(b.kpis()).toHaveLength(6);
    expect(b.kpis().some(k => /loss/i.test(k.label))).toBe(true);
    expect(b.flowTabs().length).toBeGreaterThan(0);
    expect(b.records('none').length).toBeGreaterThan(0);
    expect(b.briefing().narrative.length).toBeGreaterThan(0);
  });
  it('group-by path collapses records into private/public buckets', () => {
    const byPath = b.records('path').map(r => r.label.toLowerCase());
    expect(byPath.some(l => /private|public/.test(l))).toBe(true);
  });
  it('is deterministic', () => {
    expect(networkBinding(CC).kpis()).toEqual(networkBinding(CC).kpis());
  });
});
