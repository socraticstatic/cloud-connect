import { DivideIcon as LucideIcon } from 'lucide-react';

export type CloudProvider = 'AWS' | 'Azure' | 'Google' | 'Oracle' | 'IBM' | 'Equinix' | 'Digital Realty' | 'Centersquare' | 'CoreSite' | 'DataBank';
export type ConnectionType = 'Internet to Cloud' | 'Cloud to Cloud' | 'DataCenter/CoLocation to Cloud' | 'Site to Cloud' | 'Internet Direct' | 'Cloud Router Test';
export type BandwidthOption = '100 Mbps' | '500 Mbps' | '1 Gbps' | '10 Gbps' | '100 Gbps';
export type LocationOption = 'US East' | 'US West' | 'EU West' | 'Asia Pacific';

export interface Connection {
  id: string;
  name: string;
  type: ConnectionType;
  status: 'Active' | 'Inactive' | 'Pending';
  bandwidth: string;
  location: string;
  provider?: CloudProvider;
  providers?: CloudProvider[];
  locations?: string[];
  datacenters?: string[];
  pool?: string; // Pool/Group ID this connection belongs to
  poolName?: string; // Pool/Group name for display
  cloudRouterCount?: number;
  linkCount?: number;
  primaryIPE?: string;
  secondaryIPE?: string;
  ipeRedundancy?: boolean;
  createdAt?: string;
  performance?: {
    latency: string;
    packetLoss: string;
    uptime: string;
    throughput: string;
    tunnels: string;
    bandwidthUtilization: number;
    currentUsage: string;
    utilizationTrend: number[];
    downtimeEvents?: Array<{
      start: string;
      end: string;
      duration: number;
    }>;
  };
  features?: {
    dedicatedConnection: boolean;
    redundantPath: boolean;
    autoScaling: boolean;
    loadBalancing: boolean;
  };
  security?: {
    encryption: string;
    firewall: boolean;
    ddosProtection: boolean;
    ipSecEnabled: boolean;
  };
  billing?: {
    baseFee: number;
    usage: number;
    total: number;
    currency: string;
    lastBill?: string;
    nextBill?: string;
    additionalServices?: Array<{
      name: string;
      cost: number;
    }>;
  };
  links?: string[];
  totalDowntime?: number;
  configuration?: Record<string, any>;
  origin?: {
    source: 'manual' | 'aws-marketplace' | 'azure-marketplace' | 'gcp-marketplace';
    requestId?: string;
    externalAccountId?: string;
    initiatedAt?: string;
    metadata?: Record<string, any>;
  };
}

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  sortable?: boolean;
  width?: string;
}

export interface ConnectionConfig {
  provider: CloudProvider;
  type: ConnectionType;
  bandwidth: BandwidthOption;
  location: LocationOption;
  redundancy?: boolean;
  configuration?: {
    internetSubnets?: string[];
    stackType?: 'ipv4' | 'ipv6' | 'dual';
    bfdEnabled?: boolean;
    qosClassifier?: string;
    peerAsn?: string;
    peerAsnRange?: string;
    l3mtu?: number;
    vifType?: 'private' | 'public' | 'transit';
    serviceAccessType?: 'internet' | 'l3vmp' | 'restricted';
  };
}

export interface ConnectionSummary {
  total: number;
  byStatus: {
    active: number;
    inactive: number;
    pending: number;
  };
  byType: Record<ConnectionType, number>;
  byLocation: Record<string, number>;
  byProvider: Record<CloudProvider, number>;
  byBandwidth: Record<BandwidthOption, number>;
  totalLinks: number;
  totalBilling: number;
  averageUtilization: number;
  totalDowntime: number;
}

export interface Link {
  id: string;
  name: string;
  vlanId: number;
  description?: string;
  tags?: string[];
  status: 'active' | 'inactive';
  ipSubnet?: string;
  mtu?: number;
  qosPriority?: number;
  type?: 'data' | 'voice' | 'management' | 'storage' | 'guest' | 'dmz' | 'other';
  ipeId?: string;
  ipeName?: string;
  ipeLocation?: string;
  cloudRouterIds: string[];
  createdAt: string;
  updatedAt?: string;
  linkBandwidth?: string;
  performance?: {
    bandwidthCapacity: string;
    currentUsage: string;
    utilizationPercentage: number;
    inboundRate: string;
    outboundRate: string;
    latency: string;
    packetLoss: string;
    errorRate: number;
    qosMetrics: {
      delayVariation: number;
      priorityQueueDepth: number;
    };
  };
}

export type ViewMode = 'grid' | 'list' | 'topology';

export interface MarketplaceItem {
  id: string;
  provider: string;
  name: string;
  description: string;
  type: string;
  bandwidthOptions: string[];
  basePrice: number;
  features: string[];
  icon: string;
  category: string;
  tags: string[];
  rating: { score: number; count: number };
  popularity: number;
  sla: {
    uptime: string;
    latency: string;
    support: string;
  };
  disabled?: boolean;
  addon?: boolean;
  vnf?: boolean;
  api?: boolean;
}

export interface MarketplaceFilter {
  categories: string[];
  providers: string[];
  priceRange: [number, number];
  tags: string[];
  rating: number | null;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  description: string;
  icon: typeof LucideIcon;
  count: number;
  color: string;
}