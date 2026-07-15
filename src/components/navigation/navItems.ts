import type { AttIconName } from '../icons/att-icons';

export interface CuratedNavItem {
  label: string;
  to: string;
  icon: AttIconName;
  description: string;
}

/**
 * Single source of truth for the curated Cloud Connect top nav.
 * Consumed by MainNav.tsx, NavigationContext.tsx, and MobileMenu.tsx —
 * do not duplicate this list, import it.
 */
export const NAV_ITEMS: CuratedNavItem[] = [
  { label: 'Discover', to: '/discover', icon: 'search', description: 'Discover Cloud Connect Resources' },
  { label: 'Connect', to: '/connect', icon: 'cloud', description: 'Create and Manage Your Connections' },
  { label: 'Govern', to: '/govern', icon: 'check-shield', description: 'Govern Access and Compliance' },
  { label: 'Observe', to: '/observe', icon: 'high-meter', description: 'Observe Connection Health and Performance' },
  { label: 'Cost', to: '/cost', icon: 'bill', description: 'Cost visibility and control' },
  { label: 'AI Fabric', to: '/ai-fabric', icon: 'apis', description: 'Manage Your AI Fabric' },
] as const;
