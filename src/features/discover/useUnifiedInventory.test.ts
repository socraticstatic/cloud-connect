import { describe, it, expect } from 'vitest';
import { buildInventory } from './useUnifiedInventory';
import { CC } from '../../engine'; // engine singleton, same import the other tests use

describe('buildInventory', () => {
  const cc = CC;
  const rows = buildInventory(cc);

  it('covers every cloud that has a network on-ramp or estate, plus AI-only providers, with no dupes', () => {
    const keys = rows.map(r => r.key);
    expect(new Set(keys).size).toBe(keys.length);              // no duplicates
    for (const c of cc.clouds) expect(keys).toContain(c.id);   // no cloud dropped
    // an external model (cloud === null) becomes an AI-only provider row
    const external = cc.modelCatalog().find(m => m.cloud === null);
    if (external) expect(keys).toContain(external.endpoint);
  });

  it('a cloud with both an on-ramp and a model has both facets; AI-only rows have network === null', () => {
    const cw = rows.find(r => r.key === 'cw')!;               // CoreWeave: on-ramp + helion-70b
    expect(cw.network).not.toBeNull();
    expect(cw.ai).not.toBeNull();
    expect(cw.ai!.models.length).toBeGreaterThan(0);
    const ext = rows.find(r => r.ai && !r.network);
    if (ext) { expect(ext.network).toBeNull(); expect(ext.ai).not.toBeNull(); }
  });

  it('is deterministic (identical across two builds)', () => {
    expect(buildInventory(cc)).toEqual(buildInventory(cc));
  });
});
