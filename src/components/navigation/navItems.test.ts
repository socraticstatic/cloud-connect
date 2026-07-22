import { describe, it, expect } from 'vitest';
import { NAV_DOMAINS, NAV_ITEMS } from './navItems';

describe('NAV_DOMAINS', () => {
  it('splits NaaS from AI Fabric, each with the same four verbs', () => {
    expect(NAV_DOMAINS.map(d => d.key)).toEqual(['naas', 'ai']);
    for (const d of NAV_DOMAINS) {
      expect(d.items.map(i => i.label)).toEqual(['Connect', 'Govern', 'Observe', 'Cost']);
    }
  });

  it('scopes every verb path under its domain', () => {
    expect(NAV_DOMAINS[0].items.map(i => i.to)).toEqual([
      '/naas/connect', '/naas/govern', '/naas/observe', '/naas/cost',
    ]);
    expect(NAV_DOMAINS[1].items.map(i => i.to)).toEqual([
      '/ai/connect', '/ai/govern', '/ai/observe', '/ai/cost',
    ]);
  });

  it('every nav path is unique', () => {
    const paths = NAV_ITEMS.map(i => i.to);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('Discover stays unified above both domains', () => {
    expect(NAV_ITEMS[0]).toMatchObject({ label: 'Discover', to: '/discover' });
  });
});
