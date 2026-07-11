import { describe, it, expect } from 'vitest';
import { CC } from './index';

describe('ported engine', () => {
  it('exposes computed counts', () => {
    const c = CC.counts();
    expect(c.clouds).toBe(6);
    expect(c.vpcs).toBe(15);
  });

  it('a mutation changes a real number', () => {
    const before = CC.counts().attached;
    CC.activateOnramp('nb2');
    expect(CC.counts().attached).toBeGreaterThan(before);
  });
});
