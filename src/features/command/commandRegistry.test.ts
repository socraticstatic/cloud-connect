import { describe, it, expect, vi } from 'vitest';
import { CC } from '../../engine';
import { commandRegistry } from './commandRegistry';
describe('command registry', () => {
  it('includes nav to the six sections and executable engine actions', () => {
    const navigate = vi.fn();
    const cmds = commandRegistry(CC, navigate);
    const labels = cmds.map(c => c.label);
    ['Discover','Connect','Govern','Observe','AI Fabric','NetOps for AI']
      .forEach(s => expect(labels.some(l => l.includes(s))).toBe(true));
    // a nav command navigates
    cmds.find(c => c.label.includes('Discover'))!.run();
    expect(navigate).toHaveBeenCalledWith('/discover');
    // an attach command is a real mutation
    const attach = cmds.find(c => /attach/i.test(c.label));
    if (attach) { const before = CC.counts().attached; attach.run(); expect(CC.counts().attached).toBeGreaterThan(before); }
  });
});
