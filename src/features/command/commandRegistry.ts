import type { CloudControl } from '../../engine';

export type CommandKind = 'nav' | 'attach' | 'enforce' | 'undo';

export interface Command {
  id: string;
  label: string;
  kind: CommandKind;
  run: () => void;
}

interface Section {
  path: string;
  label: string;
}

// The six top-level routes the app ships (Phases 1-4 + Task 5.1).
const SECTIONS: Section[] = [
  { path: '/discover', label: 'Discover' },
  { path: '/connect', label: 'Connect' },
  { path: '/govern', label: 'Govern' },
  { path: '/observe', label: 'Observe' },
  { path: '/ai-fabric', label: 'AI Fabric' },
  { path: '/netops', label: 'NetOps for AI' },
];

interface Onramp {
  id: string;
  name: string;
  active?: boolean;
}

interface Rule {
  id: string;
  name: string;
}

/**
 * Builds the ⌘K command list from live engine state: nav to each of the six
 * sections, "Attach ..." for every inactive on-ramp, "Enforce ..." for every
 * unenforced rule, and "Undo" when the engine has something to undo. Called
 * fresh each time the palette opens/filters so it always reflects current
 * CC state (no stale commands after a mutation).
 */
export function commandRegistry(
  cc: CloudControl,
  navigate: (path: string) => void
): Command[] {
  const commands: Command[] = [];

  for (const section of SECTIONS) {
    commands.push({
      id: `nav:${section.path}`,
      label: `Go to ${section.label}`,
      kind: 'nav',
      run: () => navigate(section.path),
    });
  }

  const onramps: Onramp[] = cc.onramps ?? [];
  for (const onramp of onramps) {
    if (onramp.active) continue;
    commands.push({
      id: `attach:${onramp.id}`,
      label: `Attach ${onramp.name}`,
      kind: 'attach',
      run: () => cc.activateOnramp(onramp.id),
    });
  }

  const rules: Rule[] = typeof cc.ruleList === 'function' ? cc.ruleList() : [];
  for (const rule of rules) {
    if (cc.ruleEnforced(rule)) continue;
    commands.push({
      id: `enforce:${rule.id}`,
      label: `Enforce ${rule.name}`,
      kind: 'enforce',
      run: () => cc.enforceAny(rule.id),
    });
  }

  const undoLabel = cc.canUndo();
  if (undoLabel) {
    commands.push({
      id: 'undo',
      label: `Undo ${undoLabel}`,
      kind: 'undo',
      run: () => cc.undo(),
    });
  }

  return commands;
}
