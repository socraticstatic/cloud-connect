import { Shield, Globe, Router, Network, Scale, AlertTriangle, Zap, Cloud } from 'lucide-react';
import { VNFType, VNFTypeInfo } from '../types/vnf';

export const VNF_TYPE_INFO: Record<VNFType, VNFTypeInfo> = {
  firewall: {
    type: 'firewall',
    label: 'Firewall',
    description: 'Network security appliance that monitors and filters traffic based on security rules',
    icon: 'Shield',
    color: 'red',
    defaultVendors: ['Palo Alto Networks', 'Fortinet', 'Cisco', 'Check Point', 'Juniper'],
    commonFeatures: [
      'Stateful packet inspection',
      'Deep packet inspection',
      'Intrusion prevention',
      'VPN support',
      'Application control',
      'URL filtering',
      'Threat intelligence'
    ]
  },
  sdwan: {
    type: 'sdwan',
    label: 'SD-WAN',
    description: 'Software-defined wide area network for optimized application delivery across multiple links',
    icon: 'Globe',
    color: 'purple',
    defaultVendors: ['Versa Networks', 'Cisco Viptela', 'VMware VeloCloud', 'Silver Peak', 'Fortinet'],
    commonFeatures: [
      'Dynamic path selection',
      'Application-aware routing',
      'WAN optimization',
      'Multi-link support',
      'Zero-touch provisioning',
      'Cloud integration',
      'Quality of service'
    ]
  },
  router: {
    type: 'router',
    label: 'Virtual Router',
    description: 'Software-based router for packet forwarding and network segmentation',
    icon: 'Router',
    color: 'blue',
    defaultVendors: ['Cisco', 'Juniper', 'Arista', 'Nokia', 'Huawei'],
    commonFeatures: [
      'BGP routing',
      'OSPF support',
      'Static routing',
      'Policy-based routing',
      'VLAN support',
      'ACLs',
      'Route filtering'
    ]
  },
  vnat: {
    type: 'vnat',
    label: 'Virtual NAT',
    description: 'Network address translation for IP address management and security',
    icon: 'Network',
    color: 'green',
    defaultVendors: ['A10 Networks', 'F5', 'Citrix', 'Kemp', 'HAProxy'],
    commonFeatures: [
      'Source NAT',
      'Destination NAT',
      'Port forwarding',
      'NAT pooling',
      'Static NAT',
      'Dynamic NAT',
      'PAT support'
    ]
  },
  load_balancer: {
    type: 'load_balancer',
    label: 'Load Balancer',
    description: 'Distributes network traffic across multiple servers for high availability',
    icon: 'Scale',
    color: 'indigo',
    defaultVendors: ['F5', 'Citrix', 'A10 Networks', 'Kemp', 'HAProxy', 'NGINX'],
    commonFeatures: [
      'Layer 4/7 load balancing',
      'Health monitoring',
      'Session persistence',
      'SSL offloading',
      'Content switching',
      'Global load balancing',
      'Auto-scaling'
    ]
  },
  ids_ips: {
    type: 'ids_ips',
    label: 'IDS/IPS',
    description: 'Intrusion detection and prevention system for threat monitoring and blocking',
    icon: 'AlertTriangle',
    color: 'orange',
    defaultVendors: ['Cisco', 'Palo Alto Networks', 'Fortinet', 'Snort', 'Suricata'],
    commonFeatures: [
      'Signature-based detection',
      'Anomaly detection',
      'Real-time blocking',
      'Threat intelligence',
      'Traffic analysis',
      'Protocol inspection',
      'Alert management'
    ]
  },
  wan_optimizer: {
    type: 'wan_optimizer',
    label: 'WAN Optimizer',
    description: 'Improves WAN performance through data deduplication and compression',
    icon: 'Zap',
    color: 'yellow',
    defaultVendors: ['Riverbed', 'Cisco', 'Silver Peak', 'Citrix', 'FatPipe'],
    commonFeatures: [
      'Data deduplication',
      'Compression',
      'Protocol optimization',
      'Caching',
      'Bandwidth management',
      'Latency reduction',
      'Application acceleration'
    ]
  },
  lmcc: {
    type: 'lmcc',
    label: 'LMCC',
    description: 'Layer 3 Managed Cloud Connectivity for multi-site enterprise deployments',
    icon: 'Cloud',
    color: 'blue',
    defaultVendors: ['AT&T NetBond'],
    commonFeatures: [
      'Multi-site connectivity',
      'BGP routing',
      'Dynamic bandwidth allocation',
      'Managed service',
      'Enterprise-grade SLA',
      'Site-to-site VPN',
      'Cloud provider integration'
    ]
  },
  custom: {
    type: 'custom',
    label: 'Custom VNF',
    description: 'User-defined virtual network function with custom configuration',
    icon: 'Network',
    color: 'gray',
    defaultVendors: [],
    commonFeatures: [
      'Flexible configuration',
      'Custom policies',
      'User-defined interfaces',
      'Extensible architecture'
    ]
  }
};

export function getVNFTypeInfo(type: VNFType): VNFTypeInfo {
  return VNF_TYPE_INFO[type] || VNF_TYPE_INFO.custom;
}

export function getVNFTypeIcon(type: VNFType) {
  const iconMap = {
    firewall: Shield,
    sdwan: Globe,
    router: Router,
    vnat: Network,
    load_balancer: Scale,
    ids_ips: AlertTriangle,
    wan_optimizer: Zap,
    lmcc: Cloud,
    custom: Network
  };
  return iconMap[type] || Network;
}

export function getVNFTypeColor(type: VNFType): string {
  const info = getVNFTypeInfo(type);
  const colorMap: Record<string, string> = {
    red: 'text-red-500 bg-red-100',
    purple: 'text-purple-500 bg-purple-100',
    blue: 'text-blue-500 bg-blue-100',
    green: 'text-green-500 bg-green-100',
    indigo: 'text-indigo-500 bg-indigo-100',
    orange: 'text-orange-500 bg-orange-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    gray: 'text-gray-500 bg-gray-100'
  };
  return colorMap[info.color] || colorMap.gray;
}

export function getAllVNFTypes(): VNFTypeInfo[] {
  return Object.values(VNF_TYPE_INFO);
}
