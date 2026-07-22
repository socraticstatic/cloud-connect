import { describe, it, expect, vi } from 'vitest';
import { CC } from '../../engine';
import { commandRegistry } from './commandRegistry';
import { NAV_DOMAINS } from '../../components/navigation/navItems';
describe('command registry', () => {
  it('includes nav to the six sections and executable engine actions', () => {
    const navigate = vi.fn();
    const cmds = commandRegistry(CC, navigate);
    const labels = cmds.map(c => c.label);
    ['Discover','Connect','Govern','Observe','Cost','AI Fabric']
      .forEach(s => expect(labels.some(l => l.includes(s))).toBe(true));
    // a nav command navigates
    cmds.find(c => c.label.includes('Discover'))!.run();
    expect(navigate).toHaveBeenCalledWith('/discover');
    // an attach command is a real mutation
    const attach = cmds.find(c => /attach/i.test(c.label));
    if (attach) { const before = CC.counts().attached; attach.run(); expect(CC.counts().attached).toBeGreaterThan(before); }
  });

  /* NaaS and the AI Fabric ship the same four verb labels. A palette listing
     "Go to Connect" twice, pointing at two different screens, is the failure
     this catches: every command label must be unique, and every verb command
     must say which domain it belongs to. */
  it('never offers two commands with the same label and different destinations', () => {
    const cmds = commandRegistry(CC, vi.fn());
    const navLabels = cmds.filter(c => c.kind === 'nav').map(c => c.label);
    expect(new Set(navLabels).size).toBe(navLabels.length);

    for (const domain of NAV_DOMAINS) {
      for (const item of domain.items) {
        const label = `Go to ${domain.label} \u00b7 ${item.label}`;
        const cmd = cmds.find(c => c.label === label);
        expect(cmd, `no command labelled "${label}"`).toBeTruthy();

        const navigate = vi.fn();
        commandRegistry(CC, navigate).find(c => c.label === label)!.run();
        expect(navigate).toHaveBeenCalledWith(item.to);
      }
    }
  });
});
