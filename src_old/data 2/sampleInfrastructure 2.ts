import { CloudRouter } from '../types/cloudrouter';
import { VNF } from '../types/vnf';
import { Link } from '../types/connection';

export const sampleRouters: CloudRouter[] = [
  {
    id: 'router-1',
    name: 'AWS-Primary-Router',
    description: 'Primary cloud router for AWS connectivity',
    status: 'active',
    location: 'Ashburn, VA',
    locations: ['Ashburn, VA', 'US East'],
    vendor: 'Cisco',
    vendors: ['Cisco'],
    connectionId: 'conn-1',
    createdAt: '2024-01-15T10:00:00Z',
    links: [],
    configuration: {
      asn: 65001,
      bgpEnabled: true,
      routeFilters: ['192.168.0.0/16', '10.0.0.0/8']
    },
    performance: {
      latency: '3.8ms',
      throughput: '8.5 Gbps',
      cpuUsage: 42.5,
      memoryUsage: 68.2,
      bgpSessions: {
        total: 16,
        active: 14,
        idle: 2
      },
      routingTableSize: 48532,
      packetForwardingRate: 950,
      controlPlaneLoad: 18.3
    }
  },
  {
    id: 'router-2',
    name: 'AWS-Secondary-Router',
    description: 'Secondary cloud router for AWS redundancy',
    status: 'active',
    location: 'Ashburn, VA',
    vendor: 'Juniper',
    connectionId: 'conn-1',
    createdAt: '2024-01-15T10:30:00Z',
    links: [],
    configuration: {
      asn: 65002,
      bgpEnabled: true,
      routeFilters: ['192.168.0.0/16', '10.0.0.0/8']
    },
    performance: {
      latency: '4.1ms',
      throughput: '7.8 Gbps',
      cpuUsage: 38.7,
      memoryUsage: 64.5,
      bgpSessions: {
        total: 14,
        active: 13,
        idle: 1
      },
      routingTableSize: 47891,
      packetForwardingRate: 885,
      controlPlaneLoad: 15.8
    }
  },
  {
    id: 'router-3',
    name: 'Azure-Primary-Router',
    description: 'Primary cloud router for Azure connectivity',
    status: 'active',
    location: 'Dallas, TX',
    vendor: 'Cisco',
    connectionId: 'conn-2',
    createdAt: '2024-02-01T09:00:00Z',
    links: [],
    configuration: {
      asn: 65003,
      bgpEnabled: true,
      routeFilters: ['172.16.0.0/12']
    },
    performance: {
      latency: '4.5ms',
      throughput: '7.2 Gbps',
      cpuUsage: 45.3,
      memoryUsage: 71.8,
      bgpSessions: {
        total: 18,
        active: 17,
        idle: 1
      },
      routingTableSize: 52143,
      packetForwardingRate: 820,
      controlPlaneLoad: 21.5
    }
  },
  {
    id: 'router-4',
    name: 'GCP-Edge-Router',
    description: 'Edge router for Google Cloud Platform',
    status: 'active',
    location: 'San Jose, CA',
    vendor: 'Arista',
    connectionId: 'conn-3',
    createdAt: '2024-01-20T14:00:00Z',
    links: [],
    configuration: {
      asn: 65004,
      bgpEnabled: true,
      routeFilters: ['10.128.0.0/9']
    },
    performance: {
      latency: '5.2ms',
      throughput: '4.8 Gbps',
      cpuUsage: 35.1,
      memoryUsage: 58.9,
      bgpSessions: {
        total: 12,
        active: 12,
        idle: 0
      },
      routingTableSize: 41256,
      packetForwardingRate: 685,
      controlPlaneLoad: 12.7
    }
  }
];

export const sampleLinks: Link[] = [
  {
    id: 'link-1',
    name: 'AWS-Primary-Link-01',
    vlanId: 100,
    description: 'Production traffic VLAN',
    tags: ['production', 'primary'],
    status: 'active',
    ipSubnet: '10.1.100.0/24',
    mtu: 9000,
    qosPriority: 1,
    type: 'data',
    cloudRouterIds: ['router-1'],
    createdAt: '2024-01-15T11:00:00Z',
    linkBandwidth: '10 Gbps',
    performance: {
      bandwidthCapacity: '10 Gbps',
      currentUsage: '7.2 Gbps',
      utilizationPercentage: 72,
      inboundRate: '450 Mbps',
      outboundRate: '680 Mbps',
      latency: '3.8ms',
      packetLoss: '0.008%',
      errorRate: 0.0012,
      qosMetrics: {
        delayVariation: 0.8,
        priorityQueueDepth: 24
      }
    }
  },
  {
    id: 'link-2',
    name: 'AWS-Primary-Link-02',
    vlanId: 200,
    description: 'Management and monitoring VLAN',
    tags: ['management', 'monitoring'],
    status: 'active',
    ipSubnet: '10.1.200.0/24',
    mtu: 1500,
    qosPriority: 2,
    type: 'management',
    cloudRouterIds: ['router-1'],
    createdAt: '2024-01-15T11:15:00Z',
    linkBandwidth: '1 Gbps',
    performance: {
      bandwidthCapacity: '1 Gbps',
      currentUsage: '180 Mbps',
      utilizationPercentage: 18,
      inboundRate: '85 Mbps',
      outboundRate: '95 Mbps',
      latency: '4.1ms',
      packetLoss: '0.005%',
      errorRate: 0.0008,
      qosMetrics: {
        delayVariation: 0.5,
        priorityQueueDepth: 12
      }
    }
  },
  {
    id: 'link-3',
    name: 'AWS-Secondary-Link-01',
    vlanId: 101,
    description: 'Backup production traffic VLAN',
    tags: ['production', 'backup'],
    status: 'active',
    ipSubnet: '10.2.100.0/24',
    mtu: 9000,
    qosPriority: 1,
    type: 'data',
    cloudRouterIds: ['router-2'],
    createdAt: '2024-01-15T11:30:00Z',
    linkBandwidth: '10 Gbps',
    performance: {
      bandwidthCapacity: '10 Gbps',
      currentUsage: '5.8 Gbps',
      utilizationPercentage: 58,
      inboundRate: '380 Mbps',
      outboundRate: '520 Mbps',
      latency: '4.2ms',
      packetLoss: '0.010%',
      errorRate: 0.0015,
      qosMetrics: {
        delayVariation: 1.1,
        priorityQueueDepth: 18
      }
    }
  },
  {
    id: 'link-4',
    name: 'Azure-Primary-Link-01',
    vlanId: 300,
    description: 'Azure production workloads',
    tags: ['production', 'azure'],
    status: 'active',
    ipSubnet: '10.3.100.0/24',
    mtu: 9000,
    qosPriority: 1,
    type: 'data',
    cloudRouterIds: ['router-3'],
    createdAt: '2024-02-01T09:30:00Z',
    linkBandwidth: '10 Gbps',
    performance: {
      bandwidthCapacity: '10 Gbps',
      currentUsage: '6.5 Gbps',
      utilizationPercentage: 65,
      inboundRate: '420 Mbps',
      outboundRate: '590 Mbps',
      latency: '4.5ms',
      packetLoss: '0.012%',
      errorRate: 0.0018,
      qosMetrics: {
        delayVariation: 1.3,
        priorityQueueDepth: 28
      }
    }
  },
  {
    id: 'link-5',
    name: 'GCP-Edge-Link-01',
    vlanId: 400,
    description: 'Google Cloud edge link',
    tags: ['production', 'gcp'],
    status: 'active',
    ipSubnet: '10.4.100.0/24',
    mtu: 8900,
    qosPriority: 1,
    type: 'data',
    cloudRouterIds: ['router-4'],
    createdAt: '2024-01-20T14:30:00Z',
    linkBandwidth: '5 Gbps',
    performance: {
      bandwidthCapacity: '5 Gbps',
      currentUsage: '3.2 Gbps',
      utilizationPercentage: 64,
      inboundRate: '285 Mbps',
      outboundRate: '350 Mbps',
      latency: '5.3ms',
      packetLoss: '0.015%',
      errorRate: 0.0020,
      qosMetrics: {
        delayVariation: 1.5,
        priorityQueueDepth: 15
      }
    }
  }
];

export const sampleVNFs: VNF[] = [
  {
    id: 'vnf-1',
    name: 'Primary-Firewall-01',
    type: 'firewall',
    vendor: 'Palo Alto',
    model: 'VM-Series',
    version: '10.2.3',
    status: 'active',
    throughput: '10 Gbps',
    licenseExpiry: '2025-12-31',
    connectionId: 'conn-1',
    linkIds: ['link-1', 'link-2'],
    createdAt: '2024-01-15T12:00:00Z',
    configuration: {
      interfaces: [
        {
          id: 'if-1',
          name: 'eth0',
          type: 'wan',
          ipAddress: '10.1.100.10',
          subnetMask: '255.255.255.0',
          status: 'up'
        },
        {
          id: 'if-2',
          name: 'eth1',
          type: 'lan',
          ipAddress: '192.168.1.1',
          subnetMask: '255.255.255.0',
          status: 'up'
        }
      ],
      policies: ['Security Policy 1', 'NAT Policy 1'],
      highAvailability: true,
      managementIP: '10.1.200.10'
    },
    performance: {
      throughput: '8.5 Gbps',
      latency: '0.8ms',
      cpuUsage: 48.5,
      memoryUsage: 72.3,
      activeSessions: 18542,
      maxSessions: 50000,
      policyHitRate: 92.5,
      licenseUtilization: 68.4,
      serviceSpecificMetrics: {
        threatsBlocked: 1254,
        inspectedPackets: 98562145,
        decryptedSessions: 5421
      }
    }
  },
  {
    id: 'vnf-2',
    name: 'SD-WAN-Edge-01',
    type: 'sdwan',
    vendor: 'Cisco',
    model: 'vEdge',
    version: '20.9.1',
    status: 'active',
    throughput: '5 Gbps',
    licenseExpiry: '2025-06-30',
    connectionId: 'conn-1',
    linkIds: ['link-1', 'link-3'],
    createdAt: '2024-01-15T13:00:00Z',
    configuration: {
      routingProtocols: ['OSPF', 'BGP'],
      policies: ['QoS Policy 1', 'App-Aware Routing'],
      highAvailability: false,
      managementIP: '10.1.200.11'
    },
    performance: {
      throughput: '4.2 Gbps',
      latency: '1.2ms',
      cpuUsage: 35.8,
      memoryUsage: 58.6,
      activeSessions: 12854,
      maxSessions: 25000,
      policyHitRate: 88.3,
      licenseUtilization: 56.2,
      serviceSpecificMetrics: {
        tunnelsActive: 8,
        tunnelsTotal: 10,
        appRoutingDecisions: 45632
      }
    }
  },
  {
    id: 'vnf-3',
    name: 'Azure-Firewall-01',
    type: 'firewall',
    vendor: 'Fortinet',
    model: 'FortiGate-VM',
    version: '7.2.0',
    status: 'active',
    throughput: '10 Gbps',
    licenseExpiry: '2025-08-15',
    connectionId: 'conn-2',
    linkIds: ['link-4'],
    createdAt: '2024-02-01T10:00:00Z',
    configuration: {
      interfaces: [
        {
          id: 'if-3',
          name: 'port1',
          type: 'wan',
          ipAddress: '10.3.100.10',
          subnetMask: '255.255.255.0',
          status: 'up'
        }
      ],
      policies: ['Default Security Policy', 'IPS Policy'],
      highAvailability: true,
      managementIP: '10.3.200.10'
    },
    performance: {
      throughput: '7.8 Gbps',
      latency: '1.1ms',
      cpuUsage: 52.3,
      memoryUsage: 68.9,
      activeSessions: 22341,
      maxSessions: 50000,
      policyHitRate: 89.7,
      licenseUtilization: 72.1,
      serviceSpecificMetrics: {
        threatsBlocked: 2145,
        inspectedPackets: 125478963,
        ipsEvents: 342
      }
    }
  },
  {
    id: 'vnf-4',
    name: 'GCP-Router-VNF',
    type: 'router',
    vendor: 'VyOS',
    model: 'VyOS-Cloud',
    version: '1.4',
    status: 'active',
    throughput: '5 Gbps',
    connectionId: 'conn-3',
    linkIds: ['link-5'],
    createdAt: '2024-01-20T15:00:00Z',
    configuration: {
      routingProtocols: ['BGP', 'OSPF', 'Static'],
      highAvailability: false,
      managementIP: '10.4.200.10'
    },
    performance: {
      throughput: '3.8 Gbps',
      latency: '0.9ms',
      cpuUsage: 28.4,
      memoryUsage: 42.7,
      activeSessions: 8524,
      maxSessions: 20000,
      policyHitRate: 94.2,
      licenseUtilization: 45.8,
      serviceSpecificMetrics: {
        routesAdvertised: 1254,
        routesReceived: 2145,
        bgpPeers: 4
      }
    }
  }
];
