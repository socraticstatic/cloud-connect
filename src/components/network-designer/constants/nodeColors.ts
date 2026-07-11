export interface NodeColorSet {
  border: string;
  bg: string;
  accent: string;
}

const DEFAULT_COLORS: NodeColorSet = { border: '#9ca3af', bg: '#ffffff', accent: '#9ca3af' };

const FUNCTION_COLORS: Record<string, NodeColorSet> = {
  router:   { border: '#d946ef', bg: '#fdf4ff', accent: '#d946ef' },
  firewall: { border: '#f59e0b', bg: '#fffbeb', accent: '#f59e0b' },
  vnf:      { border: '#f59e0b', bg: '#fffbeb', accent: '#f59e0b' },
  sdwan:    { border: '#06b6d4', bg: '#ecfeff', accent: '#06b6d4' },
  flexware: { border: '#6b7280', bg: '#f9fafb', accent: '#6b7280' },
};

const NETWORK_COLORS: Record<string, NodeColorSet> = {
  ipe:        { border: '#7c3aed', bg: '#f5f3ff', accent: '#7c3aed' },
  avpn:       { border: '#3b82f6', bg: '#eff6ff', accent: '#3b82f6' },
  ase:        { border: '#06b6d4', bg: '#ecfeff', accent: '#06b6d4' },
  adi:        { border: '#14b8a6', bg: '#f0fdfa', accent: '#14b8a6' },
  internet:   { border: '#6b7280', bg: '#f9fafb', accent: '#6b7280' },
  wavelength: { border: '#8b5cf6', bg: '#f5f3ff', accent: '#8b5cf6' },
};

const DESTINATION_COLORS: NodeColorSet = { border: '#3b82f6', bg: '#eff6ff', accent: '#3b82f6' };
const DATACENTER_COLORS: NodeColorSet = { border: '#6b7280', bg: '#f9fafb', accent: '#6b7280' };

export function getNodeColors(type: string, functionType: string): NodeColorSet {
  if (type === 'destination') return DESTINATION_COLORS;
  if (type === 'datacenter') return DATACENTER_COLORS;
  if (type === 'network') return NETWORK_COLORS[functionType] || DEFAULT_COLORS;
  if (type === 'function') return FUNCTION_COLORS[functionType] || DEFAULT_COLORS;
  return DEFAULT_COLORS;
}

export const STATUS_DOT_COLORS: Record<string, string> = {
  'unconfigured': '#d1d5db',
  'configured-inactive': '#9ca3af',
  'active': '#22c55e',
  'active-down': '#ef4444',
};
