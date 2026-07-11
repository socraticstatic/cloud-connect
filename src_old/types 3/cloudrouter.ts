import { Link } from './connection';

export interface CloudRouter {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'provisioning' | 'error';
  location: string;
  locations?: string[];
  vendor?: string;
  vendors?: string[];
  pool?: string;
  ipeId?: string;
  ipeName?: string;
  ipeLocation?: string;
  createdAt: string;
  updatedAt?: string;
  connectionId: string;
  policies?: {
    routingPolicy?: string;
    securityPolicy?: string;
    qosPolicy?: string;
    [key: string]: any;
  };
  links: Link[];
  configuration?: {
    asn?: number;
    bgpEnabled?: boolean;
    routeFilters?: string[];
    [key: string]: any;
  };
  performance?: {
    latency: string;
    throughput: string;
    cpuUsage: number;
    memoryUsage: number;
    bgpSessions: {
      total: number;
      active: number;
      idle: number;
    };
    routingTableSize: number;
    packetForwardingRate: number;
    controlPlaneLoad: number;
  };
}

interface CloudRouterPolicy {
  id: string;
  name: string;
  type: 'routing' | 'security' | 'qos';
  description: string;
  rules: CloudRouterPolicyRule[];
  createdAt: string;
  updatedAt?: string;
}

interface CloudRouterPolicyRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
    value: string | number | boolean;
  }[];
  actions: {
    type: string;
    parameters: Record<string, any>;
  }[];
  enabled: boolean;
}