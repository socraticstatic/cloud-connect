import type { AttIconName } from '../icons/att-icons';

export interface CuratedNavItem {
  label: string;
  to: string;
  icon: AttIconName;
  description: string;
}

export interface NavLayer {
  key: 'naas' | 'ai';
  label: string;
  /** What this layer is, in the customer's words. */
  blurb: string;
  /** One-breath name for the rail and the stack visuals. */
  tagline: string;
  items: CuratedNavItem[];
}

const DISCOVER: CuratedNavItem = {
  label: 'Discover', to: '/discover', icon: 'search',
  description: 'One scan — network, cloud and AI workflows',
};

/**
 * NaaS and the AI Fabric each carry the full verb set. The verbs are the same
 * four everywhere — connect, govern, observe, control cost — because that is
 * the promise; what differs is what they act on.
 *
 * These are the two LIVE rows of the lifecycle × layer table (see
 * docs/superpowers/specs/2026-07-23-layer-first-ia-design.md). Users enter
 * through a layer; the verbs live inside it. A verb is never a top-level
 * destination.
 */
export const NAV_LAYERS: NavLayer[] = [
  {
    key: 'naas',
    label: 'NaaS',
    blurb: 'Network as a service — the paths, the policy on them, and what they cost.',
    tagline: 'The network layer',
    items: [
      { label: 'Connect', to: '/naas/connect', icon: 'cloud', description: 'Attach clouds and sites to the fabric' },
      { label: 'Govern', to: '/naas/govern', icon: 'check-shield', description: 'Policy on network paths' },
      { label: 'Observe', to: '/naas/observe', icon: 'high-meter', description: 'Path health and performance' },
      { label: 'Cost', to: '/naas/cost', icon: 'bill', description: 'Transport and egress cost control' },
    ],
  },
  {
    key: 'ai',
    label: 'AI Fabric',
    blurb: 'The token layer — model endpoints, the agents calling them, and their budgets.',
    tagline: 'The token layer',
    items: [
      { label: 'Connect', to: '/ai/connect', icon: 'apis', description: 'Attach model endpoints and neoclouds' },
      { label: 'Govern', to: '/ai/govern', icon: 'check-shield', description: 'Token policy and guardrails' },
      { label: 'Observe', to: '/ai/observe', icon: 'high-meter', description: 'Prompt traces and agent decisions' },
      { label: 'Cost', to: '/ai/cost', icon: 'bill', description: 'Token budgets and spend' },
    ],
  },
];

/**
 * Flat list, in render order. Discover first, then every verb of every layer.
 * Single source of truth for the curated Cloud Connect nav — consumed by
 * MainNav.tsx, NavigationContext.tsx and MobileMenu.tsx. Do not duplicate it,
 * import it. Consumers that need the grouping read NAV_LAYERS instead.
 */
export const NAV_ITEMS: CuratedNavItem[] = [DISCOVER, ...NAV_LAYERS.flatMap(d => d.items)];

/**
 * The live layers in elevation order — AI Fabric rides on the network, so it
 * draws on top. The stack rail and the Discover stack read this, never
 * NAV_LAYERS, whose order is the bar's reading order.
 */
export const STACK_LAYERS: NavLayer[] = (['ai', 'naas'] as const).map(
  key => NAV_LAYERS.find(l => l.key === key)!,
);

/**
 * Same verb, other layer: /ai/cost ↔ /naas/cost. The stack rail's whole
 * promise — move vertically, keep your place in the lifecycle. Falls back to
 * the target layer's first item when the current path carries no verb (or a
 * verb the target does not offer), so the hop never 404s.
 */
export function counterpartPath(pathname: string, target: NavLayer['key']): string {
  const layer = NAV_LAYERS.find(l => l.key === target);
  if (!layer) return '/discover';
  const verb = pathname.match(/^\/(?:ai|naas)\/([^/]+)/)?.[1];
  const candidate = verb && layer.items.find(i => i.to === `/${target}/${verb}`);
  return candidate ? candidate.to : layer.items[0].to;
}

/** Discover, alone above both domains. */
export const NAV_DISCOVER: CuratedNavItem = DISCOVER;

/**
 * Is `href` the destination the viewer is currently on?
 *
 * Exact, or a parent of the current path. `/naas/connect` and `/ai/connect`
 * are different destinations sharing a label, so a bare `startsWith` on the
 * href is not enough — it would also light `/ai` for `/ai-fabric` if that
 * path ever came back.
 *
 * Lives here rather than in either nav because the desktop bar and the mobile
 * drawer are the same navigation seen at two widths. They disagreed: the bar
 * matched exact-or-parent, the drawer matched `pathname === item.to`, so a
 * deep link under a section highlighted nothing in the drawer and its parent
 * in the bar. One rule, one place.
 */
export function isNavRouteActive(pathname: string, href: string): boolean {
  // /manage owns the groups screens too; they are one destination in the nav.
  if (href === '/manage') {
    return pathname.startsWith('/manage') || pathname.startsWith('/groups');
  }
  return pathname === href || pathname.startsWith(href + '/');
}
