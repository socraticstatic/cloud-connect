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
