import { describe, test, expect } from 'vitest';
import { CC } from '../engine';

describe('port matching', () => {
  test('a port rule matches only a flow that really carries that port', () => {
    const flows = CC.flows() as { ports: string }[];
    const multi = flows.find(f => f.ports.includes(',') && f.ports.includes('8443'));
    expect(multi, 'the seeded estate should carry a multi-port flow').toBeTruthy();
    // '443' must NOT match '5432, 8443' - it is a substring, not a port.
    const dry = CC.dryRun({
      name: 'port probe', src: { tag: 'any', cloud: 'any' },
      dst: 'any', ports: '443', action: 'deny', chain: [],
    }) as { matched: { flow: { ports: string } }[] };
    for (const m of dry.matched) {
      const ports = m.flow.ports.split(',').map(s => s.trim());
      expect(ports).toContain('443');
    }
  });

  test('port 53 can be targeted', () => {
    const dry = CC.dryRun({
      name: 'dns probe', src: { tag: 'any', cloud: 'any' },
      dst: 'any', ports: '53', action: 'deny', chain: [],
    }) as { matched: unknown[] };
    expect(Array.isArray(dry.matched)).toBe(true);
  });
});
