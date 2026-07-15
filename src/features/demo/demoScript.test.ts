import { describe, it, expect } from 'vitest';
import { DEMO_BEATS } from './demoScript';

const NAV_ROUTES = ['/discover', '/connect', '/govern', '/observe', '/cost', '/ai-fabric'];

// Each beat's copy must actually be ABOUT its stage — a length check alone would
// pass on lorem ipsum. Assert the narration/title mentions the stage's subject.
const STAGE_SUBJECT: Record<string, RegExp> = {
  '/discover': /discover|estate|public internet/i,
  '/connect': /attach|steer|on-?ramp|IP(Sec)?|PrivateLink/i,
  '/govern': /tag|polic|firewall|segment|rout/i,
  '/observe': /latency|egress|telemetry|event|loss/i,
  '/cost': /invoice|egress|save|cost|arbitrage/i,
  '/ai-fabric': /token|model|AI|fabric/i,
};

describe('DEMO_BEATS', () => {
  it('has exactly six beats, one per nav route, in demo-arc order', () => {
    expect(DEMO_BEATS.map(b => b.route)).toEqual(
      ['/discover', '/connect', '/govern', '/observe', '/cost', '/ai-fabric']);
  });

  it('every beat has real, stage-relevant copy (not just non-empty strings)', () => {
    for (const b of DEMO_BEATS) {
      expect(NAV_ROUTES).toContain(b.route);
      const subject = STAGE_SUBJECT[b.route];
      // Title + narration together must speak to the stage's actual subject.
      expect(`${b.title} ${b.narration}`).toMatch(subject);
      expect(b.narration.length).toBeGreaterThan(20);
      expect(b.hero.trim()).not.toBe('');
    }
  });
});
