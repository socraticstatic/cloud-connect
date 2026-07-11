// LMCC (Layer 3 Managed Cloud Connectivity) Type Definitions

export interface LMCCSite {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  region: string;
  latitude?: number;
  longitude?: number;
  availability: 'available' | 'limited' | 'unavailable';
}

export interface LMCCBandwidthAllocation {
  siteId: string;
  bandwidth: number; // in Mbps
}

export type TerminationType = 'public' | 'private' | 'bgp';

export interface BGPConfiguration {
  localASN: number;
  remoteASN: number;
  authenticationKey?: string;
  keepaliveTimer?: number; // seconds
  holdTimer?: number; // seconds
}

export interface IPAllocation {
  siteId: string;
  subnet: string; // CIDR notation
  vlanId: number;
  gateway?: string;
}

export interface TAOConfiguration {
  terminationType: TerminationType;
  bgpConfig?: BGPConfiguration;
  baseSubnet: string; // CIDR notation for base subnet
  startingVlanId: number;
  ipAllocations: IPAllocation[];
  routingPolicy: 'static' | 'dynamic' | 'policy_based';
  enableDefaultRoute?: boolean;
  routePreference?: number;
}

export interface LMCCConfiguration {
  id?: string;
  vnfId: string;
  selectedSites: string[]; // Array of site IDs
  bandwidthAllocations: LMCCBandwidthAllocation[];
  taoConfig: TAOConfiguration;
  status: 'draft' | 'pending' | 'active' | 'error';
  createdAt?: string;
  updatedAt?: string;
}

export interface LMCCConfigurationStep {
  step: 1 | 2 | 3 | 'review';
  title: string;
  description: string;
  isComplete: boolean;
  hasErrors: boolean;
}
