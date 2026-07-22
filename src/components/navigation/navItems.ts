import type { AttIconName } from '../icons/att-icons';

export interface CuratedNavItem {
  label: string;
  to: string;
  icon: AttIconName;
  description: string;
}

export interface NavDomain {
  key: 'naas' | 'ai';
  label: string;
  /** What this domain is, in the customer's words. */
  blurb: string;
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
 */
export const NAV_DOMAINS: NavDomain[] = [
  {
    key: 'naas',
    label: 'NaaS',
    blurb: 'Network as a service — the paths, the policy on them, and what they cost.',
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
    items: [
      { label: 'Connect', to: '/ai/connect', icon: 'apis', description: 'Attach model endpoints and neoclouds' },
      { label: 'Govern', to: '/ai/govern', icon: 'check-shield', description: 'Token policy and guardrails' },
      { label: 'Observe', to: '/ai/observe', icon: 'high-meter', description: 'Prompt traces and agent decisions' },
      { label: 'Cost', to: '/ai/cost', icon: 'bill', description: 'Token budgets and spend' },
    ],
  },
];

/**
 * Flat list, in render order. Discover first, then every verb of every domain.
 * Single source of truth for the curated Cloud Connect nav — consumed by
 * MainNav.tsx, NavigationContext.tsx and MobileMenu.tsx. Do not duplicate it,
 * import it. Consumers that need the grouping read NAV_DOMAINS instead.
 */
export const NAV_ITEMS: CuratedNavItem[] = [DISCOVER, ...NAV_DOMAINS.flatMap(d => d.items)];

/** Discover, alone above both domains. */
export const NAV_DISCOVER: CuratedNavItem = DISCOVER;
