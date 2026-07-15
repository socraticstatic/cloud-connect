import { describe, it, expect } from 'vitest';
import { CC } from './index';

/**
 * The three example policies from the requirements doc must be present as
 * first-class, enforceable rules in the engine — visible in ruleList() and
 * enforceable through the same enforceRule path the seed rules use.
 */
describe('requirements-doc example policies', () => {
  it('exposes all three example policies in the rule list', () => {
    const rules = CC.ruleList() as { id: string; name: string }[];
    const ids = rules.map(r => r.id);
    expect(ids).toContain('pol-pci');
    expect(ids).toContain('pol-internet-facing');
    expect(ids).toContain('pol-branch-finance');

    const names = rules.map(r => r.name.toLowerCase()).join(' | ');
    expect(names).toContain('pci');
    expect(names).toContain('internet-facing');
    expect(names).toContain('finance');
  });

  it('each example policy enforces (flips ruleEnforced)', () => {
    for (const id of ['pol-pci', 'pol-internet-facing', 'pol-branch-finance']) {
      const rule = (CC.ruleList() as { id: string }[]).find(r => r.id === id)!;
      expect(CC.ruleEnforced(rule)).toBe(false);
      expect(CC.enforceRule(id)).toBe(true);
      const after = (CC.ruleList() as { id: string }[]).find(r => r.id === id)!;
      expect(CC.ruleEnforced(after)).toBe(true);
    }
  });

  it('the internet-facing example names the Palo Alto NGFW in its chain', () => {
    const rule = (CC.ruleList() as { id: string; chain: string[] }[]).find(
      r => r.id === 'pol-internet-facing'
    )!;
    expect(rule.chain.join(' ')).toMatch(/palo alto/i);
  });
});
