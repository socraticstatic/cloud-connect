import { describe, it, expect } from 'vitest';
import { connectVerdict } from './verdict';
import type { FabricModel } from './FabricHero';

const region = (path: 'private' | 'public', reliability: 'dual' | 'single' | 'none') =>
  ({ cloudId: 'aws', regionId: `r-${Math.random()}`, name: 'r', cloudName: 'AWS',
     attached: path === 'private', reliability, path, privateMs: 10, publicMs: 40,
     currentMs: path === 'private' ? 10 : 40 }) as FabricModel['regions'][number];

const model = (regions: FabricModel['regions']): FabricModel =>
  ({ sites: [], onramps: [], regions, c2c: [] });

describe('connectVerdict', () => {
  it('mixed estate: counts on-fabric, dual, and public in one sentence pair', () => {
    const v = connectVerdict(model([
      region('private', 'dual'), region('private', 'single'), region('public', 'none'),
    ]));
    expect(v).toBe('2 of 3 regions are on the AT&T fabric, 1 with dual paths. 1 still rides the public internet.');
  });
  it('nothing attached: says so plainly', () => {
    const v = connectVerdict(model([region('public', 'none'), region('public', 'none')]));
    expect(v).toBe('None of your 2 regions are on the AT&T fabric yet. Everything rides the public internet.');
  });
  it('fully attached: no public remainder sentence', () => {
    const v = connectVerdict(model([region('private', 'dual'), region('private', 'dual')]));
    expect(v).toBe('All 2 regions are on the AT&T fabric, 2 with dual paths.');
  });
});
