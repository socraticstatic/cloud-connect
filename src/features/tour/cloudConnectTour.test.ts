import { describe, it, expect } from 'vitest';
import { cloudConnectTour } from './cloudConnectTour';
import { DEMO_BEATS } from '../demo/demoScript';

describe('cloudConnectTour', () => {
  it('step routes, in order, equal the DEMO_BEATS routes in order', () => {
    expect(cloudConnectTour.map(s => s.route)).toEqual(DEMO_BEATS.map(b => b.route));
  });

  it('does not route to /netops (dropped from the MVP demo arc)', () => {
    expect(cloudConnectTour.map(s => s.route)).not.toContain('/netops');
  });

  it('binds the cost step title/description to the cost DEMO_BEAT', () => {
    const costStep = cloudConnectTour.find(s => s.route === '/cost');
    const costBeat = DEMO_BEATS.find(b => b.route === '/cost')!;
    expect(costStep).toBeDefined();
    expect(costStep!.title).toBe(costBeat.title);
    expect(costStep!.description).toBe(costBeat.narration);
    expect(costStep!.targetSelector).toBe('[data-tour="cost-hero"]');
  });
});
