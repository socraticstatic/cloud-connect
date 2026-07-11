// Sample data for testing UI components
import { Connection, User } from '../types';
import { Group, GroupAddress, GroupContact } from '../types/group';

// Define reusable data fragments to avoid repetition
const defaultSecurity = {
  encryption: 'AES-256',
  firewall: true,
  ddosProtection: true,
  ipSecEnabled: true
};

const defaultFeatures = {
  dedicatedConnection: true,
  redundantPath: false,
  autoScaling: false,
  loadBalancing: false
};

// Performance data factory to create consistent performance metrics
const createPerformanceData = (
  latency: string,
  packetLoss: string,
  uptime: string,
  bandwidthUtil: number
) => ({
  latency,
  packetLoss,
  uptime: uptime,
  tunnels: bandwidthUtil > 0 ? 'Active' : 'Inactive',
  bandwidthUtilization: bandwidthUtil,
  currentUsage: `${bandwidthUtil / 10} Gbps`,
  utilizationTrend: Array(7).fill(0).map((_, i) => Math.max(0, Math.min(100, bandwidthUtil + (Math.random() * 4 - 2))))
});

// Billing data factory to create billing info with less duplication
const createBillingData = (
  baseFee: number,
  usage: number,
  lastBill?: string,
  nextBill?: string,
  additionalServices: {name: string, cost: number}[] = []
) => ({
  baseFee,
  usage,
  total: baseFee + usage + additionalServices.reduce((sum, service) => sum + service.cost, 0),
  currency: 'USD',
  lastBill: lastBill || '2024-02-01T00:00:00Z',
  nextBill: nextBill || '2024-04-01T00:00:00Z',
  additionalServices
});

// Sample connections with optimized structure
export const sampleConnections: Connection[] = [
  {
    id: 'conn-1',
    name: 'Corporate Cloud Gateway',
    type: 'Internet to Cloud',
    status: 'Active',
    bandwidth: '10 Gbps',
    location: 'Ashburn, VA',
    provider: 'AWS',
    locations: ['Ashburn, VA'],
    cloudRouterCount: 2,
    linkCount: 4,
    primaryIPE: 'NYC-2',
    secondaryIPE: 'Atlanta-1',
    ipeRedundancy: true,
    createdAt: '2024-01-15T00:00:00Z',
    performance: createPerformanceData('4.2ms', '0.01%', '99.99%', 85),
    features: { ...defaultFeatures, redundantPath: true, loadBalancing: true },
    security: defaultSecurity,
    billing: createBillingData(999.99, 299.99, undefined, undefined, [
      { name: 'DDoS Protection', cost: 199.99 },
      { name: 'Advanced Monitoring', cost: 100.0 }
    ]),
  },
  {
    id: 'conn-2',
    name: 'Multi-Cloud Production',
    type: 'Cloud to Cloud',
    status: 'Active',
    bandwidth: '10 Gbps',
    location: 'Dallas, TX',
    provider: 'Azure',
    providers: ['Azure', 'AWS'],
    locations: ['Dallas, TX', 'San Jose, CA'],
    cloudRouterCount: 3,
    linkCount: 6,
    primaryIPE: 'Dallas-1',
    secondaryIPE: 'SFO-1',
    ipeRedundancy: true,
    createdAt: '2024-02-01T00:00:00Z',
    performance: createPerformanceData('4.8ms', '0.02%', '99.95%', 75),
    features: { ...defaultFeatures, autoScaling: true, loadBalancing: true },
    security: defaultSecurity,
    billing: createBillingData(999.99, 199.99, undefined, undefined, [
      { name: 'Advanced Monitoring', cost: 100.0 }
    ]),
  },
  {
    id: 'conn-3',
    name: 'Global Enterprise Network',
    type: 'DataCenter/CoLocation to Cloud',
    status: 'Active',
    bandwidth: '10 Gbps',
    location: 'New York, NY',
    providers: ['AWS', 'Azure', 'Google'],
    locations: ['New York, NY', 'Chicago, IL', 'Los Angeles, CA', 'London, UK'],
    datacenters: ['Equinix NY5', 'CoreSite CH1', 'Digital Realty LAX1'],
    cloudRouterCount: 5,
    linkCount: 12,
    primaryIPE: 'Chicago-1',
    ipeRedundancy: false,
    createdAt: '2024-02-15T00:00:00Z',
    performance: createPerformanceData('5.1ms', '0.015%', '99.98%', 65),
    features: { ...defaultFeatures, autoScaling: true },
    security: defaultSecurity,
    billing: createBillingData(999.99, 99.99, undefined, undefined, [
      { name: 'Basic Monitoring', cost: 50.0 }
    ]),
  },
];

// Factory function to create connection access objects consistently
const createConnectionAccess = (connectionId: string, name: string, permissions: string[]) => ({
  connectionId,
  name,
  permissions
});

// Sample users organized by connection
// AWS Direct Connect users
const awsUsers: User[] = [
  {
    id: 'user-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    role: 'Network Administrator',
    status: 'active',
    lastActive: new Date().toISOString(),
    connectionAccess: [createConnectionAccess('conn-1', 'Internet to AWS Cloud', ['view', 'manage', 'monitor', 'configure'])],
  },
  {
    id: 'user-2',
    name: 'Michael Rodriguez',
    email: 'michael.r@example.com',
    role: 'Security Engineer',
    status: 'active',
    lastActive: new Date().toISOString(),
    connectionAccess: [createConnectionAccess('conn-1', 'Internet to AWS Cloud', ['view', 'monitor', 'configure'])],
  },
];

// Azure users
const azureUsers: User[] = [
  {
    id: 'user-3',
    name: 'David Kim',
    email: 'david.kim@example.com',
    role: 'Network Administrator',
    status: 'active',
    lastActive: new Date().toISOString(),
    connectionAccess: [createConnectionAccess('conn-2', 'Internet to Azure Cloud', ['view', 'manage', 'monitor', 'configure'])],
  },
  {
    id: 'user-4',
    name: 'Lisa Martinez',
    email: 'lisa.m@example.com',
    role: 'Security Analyst',
    status: 'active',
    lastActive: new Date().toISOString(),
    connectionAccess: [createConnectionAccess('conn-2', 'Internet to Azure Cloud', ['view', 'monitor', 'configure'])],
  },
];

// Google Cloud users
const googleUsers: User[] = [
  {
    id: 'user-5',
    name: 'Thomas Anderson',
    email: 'thomas.a@example.com',
    role: 'Network Administrator',
    status: 'active',
    lastActive: new Date().toISOString(),
    connectionAccess: [createConnectionAccess('conn-3', 'Internet to Google Cloud', ['view', 'manage', 'monitor', 'configure'])],
  },
  {
    id: 'user-6',
    name: 'Sophia Lee',
    email: 'sophia.l@example.com',
    role: 'Security Engineer',
    status: 'active',
    lastActive: new Date().toISOString(),
    connectionAccess: [createConnectionAccess('conn-3', 'Internet to Google Cloud', ['view', 'monitor', 'configure'])],
  },
];

// Combine all users with an efficient reference
export const sampleUsers: User[] = [...awsUsers, ...azureUsers, ...googleUsers];

// Reusable address and contact data
const sampleAddresses: GroupAddress[] = [
  {
    street: '208 S Akard St',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75202',
    country: 'United States',
    isPrimary: true
  },
  {
    street: '1 AT&T Way',
    city: 'Bedminster',
    state: 'NJ',
    zipCode: '07921',
    country: 'United States',
    isPrimary: false
  }
];

// Reusable contact information
const sampleContacts: GroupContact[] = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(214) 555-1234',
    role: 'IT Director',
    isPrimary: true
  },
  {
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    phone: '(214) 555-5678',
    role: 'Network Manager',
    isPrimary: false
  }
];

// Performance and billing data factories for groups
const createGroupPerformanceData = () => ({
  aggregatedMetrics: {
    averageLatency: '4.5ms',
    averagePacketLoss: '0.015%',
    averageUptime: '99.97%',
    totalBandwidth: '20 Gbps',
    bandwidthUtilization: 80,
    totalTraffic: '1.8 TB'
  },
  historicalData: [] // Would be filled with actual historical data
});

const createGroupBillingData = (rate: number) => ({
  billingId: `bill-${Date.now()}`,
  planName: rate > 2000 ? 'Enterprise Plus' : 'Enterprise Standard',
  monthlyRate: rate,
  annualDiscount: 10,
  currency: 'USD',
  billingCycle: 'monthly',
  paymentMethod: rate > 2000 ? 'credit_card' : 'invoice',
  lastInvoiceDate: '2024-03-01T00:00:00Z',
  nextInvoiceDate: '2024-04-01T00:00:00Z'
});

// Sample groups with optimized structure
export const sampleGroups: Group[] = [
  {
    id: 'group-1',
    name: 'Cloud Infrastructure',
    description: 'Core cloud infrastructure connections and resources',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z',
    type: 'department',
    status: 'active',
    addresses: [sampleAddresses[0]],
    contacts: [sampleContacts[0]],
    connectionIds: ['conn-1', 'conn-2'],
    userIds: ['user-1', 'user-3'],
    ownerId: 'user-1',
    permissions: {
      read: ['user-1', 'user-2', 'user-3', 'user-4'],
      write: ['user-1', 'user-3'],
      admin: ['user-1']
    },
    billing: createGroupBillingData(2499.96),
    performance: createGroupPerformanceData()
  },
  {
    id: 'group-2',
    name: 'Network Operations',
    description: 'Core network infrastructure management team',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
    type: 'team',
    status: 'active',
    addresses: [sampleAddresses[1]],
    contacts: [sampleContacts[1]],
    connectionIds: ['conn-3'],
    userIds: ['user-5', 'user-6'],
    ownerId: 'user-5',
    permissions: {
      read: ['user-5', 'user-6'],
      write: ['user-5'],
      admin: ['user-5']
    },
    billing: createGroupBillingData(1099.98),
    performance: {
      aggregatedMetrics: {
        averageLatency: '5.1ms',
        averagePacketLoss: '0.015%',
        averageUptime: '99.98%',
        totalBandwidth: '10 Gbps',
        bandwidthUtilization: 65,
        totalTraffic: '0.8 TB'
      },
      historicalData: [] // This would be filled with actual historical data
    }
  },
  {
    id: 'group-3',
    name: 'Research & Development',
    description: 'R&D projects and dev environments',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-03-05T00:00:00Z',
    type: 'project',
    status: 'active',
    parentGroupId: 'group-1',
    addresses: [],
    contacts: [],
    connectionIds: [],
    userIds: ['user-2', 'user-4', 'user-6'],
    ownerId: 'user-2',
    permissions: {
      read: ['user-1', 'user-2', 'user-4', 'user-6'],
      write: ['user-2', 'user-6'],
      admin: ['user-2']
    },
    tags: {
      'department': 'R&D',
      'environment': 'development',
      'costCenter': 'CC-RD-001'
    }
  }
];