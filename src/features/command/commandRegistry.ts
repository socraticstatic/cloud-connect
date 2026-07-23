import type { CloudControl } from '../../engine';
import { NAV_DISCOVER, NAV_LAYERS } from '../../components/navigation/navItems';

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

/**
 * Every routed section of the curated nav, derived from NAV_LAYERS so the
 * palette cannot drift from the nav.
 *
 * NaaS and the AI Fabric carry the SAME four verb labels, so a bare "Go to
 * Connect" would appear twice with two different destinations and no way to
 * tell them apart in a flat list. Each verb command is therefore qualified by
 * its domain; Discover, which belongs to neither, is not.
 */
const SECTIONS: Section[] = [
  { path: NAV_DISCOVER.to, label: NAV_DISCOVER.label },
  ...NAV_LAYERS.flatMap(domain =>
    domain.items.map(item => ({
      path: item.to,
      label: `${domain.label} · ${item.label}`,
    })),
  ),
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
 * Builds the ⌘K command list from live engine state: nav to every curated
 * section, "Attach ..." for every inactive on-ramp, "Enforce ..." for every
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
