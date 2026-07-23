import type { CloudControl } from '../../engine';
import { NAV_DISCOVER, NAV_LAYERS } from '../../components/navigation/navItems';
import { attachOpportunities, steerOpportunities } from '../discover/stackFigures';
import { fmtTokens } from '../ai-fabric/aiSpend';

export type CommandKind =
  | 'nav'
  | 'attach'
  | 'enforce'
  | 'undo'
  | 'attach-region'
  | 'steer'
  | 'cap';

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

  // Priced intents. Every figure below comes from stackFigures — the same
  // arithmetic the cross-section and /naas/cost state — never restated here.
  for (const opp of attachOpportunities(cc)) {
    const price =
      opp.bucketSavingMo !== null
        ? ` · $${opp.bucketSavingMo.toLocaleString()}/mo`
        : '';
    commands.push({
      id: `attach-region:${opp.regionId}`,
      label: `Attach ${opp.label} · ${opp.publicMs}→${opp.privateMs} ms on the fabric${price}`,
      kind: 'attach-region',
      run: () => cc.provisionRegion(opp.regionId),
    });
  }

  for (const opp of steerOpportunities(cc)) {
    const price =
      opp.egressSavingMo !== null
        ? ` · $${opp.egressSavingMo.toLocaleString()}/mo`
        : '';
    commands.push({
      id: `steer:${opp.flowId}`,
      label: `Steer ${opp.label} onto the fabric${price}`,
      kind: 'steer',
      run: () => cc.steerFlow(opp.flowId, opp.pathId),
    });
  }

  return commands;
}

/** `cap <tag> [at] <n>[k|m] [tokens][/day]` — nothing else parses. */
const CAP_GRAMMAR =
  /^cap\s+(\S+)\s+(?:at\s+)?([\d.]+)\s*([km])?\s*(?:tokens?)?\s*(?:\/?\s*day)?$/i;

/**
 * Typed intent parser for the palette. A query that names an engine-known
 * policy tag and a positive budget yields exactly one runnable command;
 * anything else yields none, so free text cannot mutate the engine.
 */
export function parseIntent(query: string, cc: CloudControl): Command[] {
  const match = query.trim().match(CAP_GRAMMAR);
  if (!match) return [];

  const rows: { tag: string }[] =
    typeof cc.tokenPolicyList === 'function' ? cc.tokenPolicyList() : [];
  const row = rows.find(r => r.tag.toLowerCase() === match[1].toLowerCase());
  if (!row) return [];

  const unit = match[3] ? (match[3].toLowerCase() === 'k' ? 1e3 : 1e6) : 1;
  const budget = parseFloat(match[2]) * unit;
  if (!(budget > 0)) return [];

  const tag = row.tag;
  return [
    {
      id: `cap:${tag}:${budget}`,
      label: `Cap ${tag} at ${fmtTokens(budget)} tokens/day · token policy`,
      kind: 'cap',
      run: () => cc.setTokenPolicy(tag, { budget }),
    },
  ];
}
