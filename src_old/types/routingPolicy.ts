export type PolicyAppliesTo = 'all' | 'links' | 'cloudrouters' | 'vnfs';

export type PolicyAction = 'allow' | 'deny' | 'manipulate' | 'advertise';

export type PolicyProtocol = 'any' | 'tcp' | 'udp' | 'icmp' | 'bgp' | 'ospf';

export interface PolicyCondition {
  id: string;
  type: 'source' | 'destination' | 'port' | 'protocol' | 'prefix' | 'community' | 'as-path';
  operator: 'equals' | 'contains' | 'matches' | 'range';
  value: string;
}

export interface RoutingPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  action: PolicyAction;
  protocol: PolicyProtocol;
  conditions: PolicyCondition[];
  appliesTo: PolicyAppliesTo;
  targetIds: string[]; // IDs of links, cloud routers, or VNFs this applies to
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PolicyTarget {
  id: string;
  name: string;
  type: 'link' | 'cloudrouter' | 'vnf';
}
