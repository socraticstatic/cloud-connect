import { describe, it, expect } from 'vitest';
import { CC } from '../../engine';
import { regionMatches, EMPTY_ESTATE_FILTERS } from './estateFilters';
import type { FabricModel } from '../connect/FabricHero';

const model = CC.fabricModel() as FabricModel;

describe('regionMatches', () => {
  it('empty filters match every region', () => {
    expect(model.regions.every(r => regionMatches(r, EMPTY_ESTATE_FILTERS))).toBe(true);
  });
  it('cloud, path and domain narrow conjunctively', () => {
    const cw = model.regions.find(r => r.cloudId === 'cw')!;
    expect(regionMatches(cw, { ...EMPTY_ESTATE_FILTERS, domain: 'ai' })).toBe(true);
    expect(regionMatches(cw, { ...EMPTY_ESTATE_FILTERS, domain: 'network' })).toBe(false);
    expect(regionMatches(cw, { ...EMPTY_ESTATE_FILTERS, cloud: 'aws' })).toBe(false);
    expect(regionMatches(cw, { cloud: 'cw', path: cw.path, domain: 'ai' })).toBe(true);
  });
});
