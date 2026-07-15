import { describe, it, expect } from 'vitest';
import { DEMO_BEATS } from './demoScript';

const NAV_ROUTES = ['/discover', '/connect', '/govern', '/observe', '/cost', '/ai-fabric'];

describe('DEMO_BEATS', () => {
  it('has exactly six beats, one per nav route, in demo-arc order', () => {
    expect(DEMO_BEATS.map(b => b.route)).toEqual(
      ['/discover', '/connect', '/govern', '/observe', '/cost', '/ai-fabric']);
    for (const b of DEMO_BEATS) {
      expect(NAV_ROUTES).toContain(b.route);
      expect(b.title.length).toBeGreaterThan(3);
      expect(b.narration.length).toBeGreaterThan(20);
      expect(b.hero.length).toBeGreaterThan(5);
    }
  });
});
