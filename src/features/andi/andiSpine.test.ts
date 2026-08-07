import { describe, it, expect } from 'vitest';
import { CC } from '../../engine';
import { spineAnswer } from './andiSpine';
import { discoverVerdict } from '../discover/verdict';
import { connectVerdict } from '../connect/verdict';
import { buildVerdict } from '../observe/networkBinding';
import type { FabricModel } from '../connect/FabricHero';

const model = () => CC.fabricModel() as FabricModel;
const nav = (a: ReturnType<typeof spineAnswer>) => a!.actions!.find(x => x.kind === 'navigate')!.to;

describe('spineAnswer navigation', () => {
  it('estate phrases speak the Discover verdict and offer /discover', () => {
    for (const q of ['show me the estate', 'take me to discover', 'what do I have']) {
      const a = spineAnswer(CC, q);
      expect(a!.text).toBe(discoverVerdict(model()));
      expect(nav(a)).toBe('/discover');
    }
  });
  it('fabric phrases speak the Connect verdict and offer /naas/connect', () => {
    for (const q of ['show my connections', 'show me the fabric']) {
      const a = spineAnswer(CC, q);
      expect(a!.text).toBe(connectVerdict(model()));
      expect(nav(a)).toBe('/naas/connect');
    }
  });
  it('traffic phrases speak the Observe verdict and offer /naas/observe', () => {
    for (const q of ['how is my traffic', 'show observability']) {
      const a = spineAnswer(CC, q);
      expect(a!.text).toBe(buildVerdict(CC));
      expect(nav(a)).toBe('/naas/observe');
    }
  });
  it('savings phrases speak the Observe verdict and offer /naas/cost', () => {
    const a = spineAnswer(CC, 'what am I saving');
    expect(a!.text).toBe(buildVerdict(CC));
    expect(nav(a)).toBe('/naas/cost');
  });
  it('non-spine phrases return null so the brain falls through', () => {
    expect(spineAnswer(CC, 'cap shared-services 1m')).toBeNull();
    expect(spineAnswer(CC, 'what is my p95 latency')).toBeNull();
  });
});
