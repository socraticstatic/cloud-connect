import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cloud, Network, Globe, Plus, Undo, Play, Check, Save, Trash2, Sparkles, Shield, Router, Database, Cpu, Workflow, Car, Home, Gamepad, Smartphone, Clock, FileText, Users,
  Server, MessageSquare, Send, ArrowRight, X, Building, Zap, Star, Search, Filter, Lock, Activity, BarChart3, Layers, Plug, Code, Wrench, ShieldCheck
} from 'lucide-react';
import { MarketplaceItem, MarketplaceFilter, MarketplaceCategory } from '../types/connection';
import { Button } from './common/Button';
import { CategoryGrid } from './marketplace/CategoryGrid';
import { CollectionGrid } from './marketplace/CollectionGrid';
import { ApplicationSolutionZone } from './marketplace/ApplicationSolutionZone';
import { AWSPartnerZone } from './marketplace/AWSPartnerZone';

interface MarketplaceProps {
  onSelectItem: (item: MarketplaceItem) => void;
}

// Marketplace items organized by type
const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  // Connections
  {
    id: 'internet-to-cloud',
    provider: 'Multi-Cloud',
    name: 'Internet to Cloud',
    description: 'High-performance internet connectivity to cloud services',
    type: 'Internet to Cloud',
    bandwidthOptions: ['100 Mbps', '200 Mbps', '500 Mbps', '1 Gbps'],
    basePrice: 40,
    features: [
      'Dynamic Defense',
      'DDoS protection',
      'Web application firewall',
      'Public IP addressing'
    ],
    icon: 'internet',
    category: 'Internet',
    tags: ['Internet', 'Public Access', 'DDoS Protection', 'WAF'],
    rating: { score: 4.8, count: 156 },
    popularity: 95,
    sla: {
      uptime: '99.99%',
      latency: '<10ms',
      support: '24/7'
    }
  },
  {
    id: 'aws-direct',
    provider: '24 hour Internet',
    name: 'AT&T Direct Connect',
    description: 'Dedicated network connection to AT&T cloud services',
    type: 'Direct Connect',
    bandwidthOptions: ['1 Gbps', '10 Gbps', '100 Gbps'],
    basePrice: 100,
    features: [
      'Dedicated connection',
      'Low latency',
      'Consistent performance',
      'Private connectivity'
    ],
    icon: 'cloud',
    category: 'Direct Connect',
    tags: ['AWS', 'Enterprise', 'High Performance'],
    rating: { score: 4.9, count: 234 },
    popularity: 98,
    sla: {
      uptime: '99.99%',
      latency: '<5ms',
      support: '24/7'
    }
  },
  {
    id: 'azure-express',
    provider: 'Azure',
    name: 'AT&T ExpressRoute',
    description: 'Private connection to Microsoft Azure',
    type: 'ExpressRoute',
    bandwidthOptions: ['1 Gbps', '10 Gbps', '100 Gbps'],
    basePrice: 100,
    features: [
      'Private peering',
      'Microsoft peering',
      'Global reach',
      'Redundant connections'
    ],
    icon: 'cloud',
    category: 'Direct Connect',
    tags: ['Azure', 'Enterprise', 'Global'],
    rating: { score: 4.7, count: 189 },
    popularity: 92,
    sla: {
      uptime: '99.95%',
      latency: '<5ms',
      support: '24/7'
    }
  },
  {
    id: 'vpn-service',
    provider: 'AT&T',
    name: 'Site-to-Site VPN',
    description: 'Secure VPN tunnels between locations',
    type: 'VPN',
    bandwidthOptions: ['100 Mbps', '500 Mbps', '1 Gbps'],
    basePrice: 60,
    features: [
      'IPSec encryption',
      'Redundant tunnels',
      'BGP routing',
      'NAT traversal'
    ],
    icon: 'network',
    category: 'VPN',
    tags: ['VPN', 'Security', 'Remote Access'],
    rating: { score: 4.4, count: 123 },
    popularity: 82,
    sla: {
      uptime: '99.9%',
      latency: '<20ms',
      support: '24/7'
    }
  },
  {
    id: 'cloud-router',
    provider: 'Multi-Cloud',
    name: 'Cloud Router',
    description: 'Intelligent routing between cloud providers',
    type: 'Router',
    bandwidthOptions: ['1 Gbps', '10 Gbps', '100 Gbps'],
    basePrice: 120,
    features: [
      'Multi-cloud routing',
      'Load balancing',
      'Traffic optimization',
      'Failover'
    ],
    icon: 'network',
    category: 'Network Services',
    tags: ['Multi-Cloud', 'Enterprise', 'Routing'],
    rating: { score: 4.7, count: 98 },
    popularity: 78,
    sla: {
      uptime: '99.99%',
      latency: '<8ms',
      support: '24/7'
    } 
  },
  {
    id: 'private-connect',
    provider: 'AT&T',
    name: 'Private Connect',
    description: 'Dedicated private network connection',
    type: 'Private Network',
    bandwidthOptions: ['1 Gbps', '10 Gbps', '40 Gbps'],
    basePrice: 200,
    features: [
      'Dedicated bandwidth',
      'End-to-end encryption',
      'Custom routing',
      'Priority support'
    ],
    icon: 'network',
    category: 'Private Network',
    tags: ['Private', 'Enterprise', 'Dedicated'],
    rating: { score: 4.8, count: 145 },
    popularity: 89,
    sla: {
      uptime: '99.999%',
      latency: '<2ms',
      support: '24/7'
    }
  },

  // AT&T Add-ons & Services
  {
    id: 'dynamic-defense',
    provider: 'AT&T',
    name: 'Dynamic Defense',
    description: 'Advanced DDoS protection and threat mitigation',
    type: 'Security Add-on',
    bandwidthOptions: ['Included'],
    basePrice: 250,
    features: [
      'Real-time DDoS mitigation',
      'Layer 3-7 protection',
      'Threat intelligence',
      'Traffic analysis',
      'Automated response'
    ],
    icon: 'shield',
    category: 'Security',
    tags: ['Security', 'DDoS', 'Threat Protection', 'Add-on'],
    rating: { score: 4.9, count: 312 },
    popularity: 96,
    sla: {
      uptime: '99.99%',
      latency: '<2ms',
      support: '24/7'
    },
    addon: true
  },
  {
    id: 'threat-defender',
    provider: 'AT&T',
    name: 'Threat Defender',
    description: 'Comprehensive threat detection and response',
    type: 'Security Add-on',
    bandwidthOptions: ['Included'],
    basePrice: 350,
    features: [
      'Advanced threat detection',
      'Malware analysis',
      'Behavioral analytics',
      'Incident response',
      'SOC integration'
    ],
    icon: 'shield',
    category: 'Security',
    tags: ['Security', 'Threat Detection', 'SOC', 'Add-on'],
    rating: { score: 4.8, count: 278 },
    popularity: 91,
    sla: {
      uptime: '99.99%',
      latency: '<5ms',
      support: '24/7'
    },
    addon: true
  },
  {
    id: 'managed-firewall',
    provider: 'AT&T',
    name: 'Managed Firewall Service',
    description: 'Enterprise-grade firewall management',
    type: 'Security Add-on',
    bandwidthOptions: ['Included'],
    basePrice: 450,
    features: [
      'Next-gen firewall',
      'Intrusion prevention',
      'Application control',
      'URL filtering',
      '24/7 monitoring'
    ],
    icon: 'shield',
    category: 'Security',
    tags: ['Firewall', 'Security', 'Managed Service', 'Add-on'],
    rating: { score: 4.7, count: 198 },
    popularity: 87,
    sla: {
      uptime: '99.99%',
      latency: '<3ms',
      support: '24/7'
    },
    addon: true
  },

  // Virtual Network Functions (VNFs)
  {
    id: 'vnf-palo-alto',
    provider: 'Palo Alto Networks',
    name: 'VM-Series Firewall',
    description: 'Next-generation firewall with ML-powered security',
    type: 'VNF',
    bandwidthOptions: ['1 Gbps', '5 Gbps', '10 Gbps'],
    basePrice: 1500,
    features: [
      'Advanced threat prevention',
      'URL filtering',
      'Application control',
      'SSL decryption',
      'WildFire malware analysis'
    ],
    icon: 'shield',
    category: 'VNF',
    tags: ['VNF', 'Firewall', 'Security', 'Enterprise'],
    rating: { score: 4.9, count: 445 },
    popularity: 94,
    sla: {
      uptime: '99.99%',
      latency: '<5ms',
      support: '24/7'
    },
    vnf: true
  },
  {
    id: 'vnf-cisco-sdwan',
    provider: 'Cisco',
    name: 'Viptela SD-WAN',
    description: 'Software-defined WAN with intelligent path selection',
    type: 'VNF',
    bandwidthOptions: ['1 Gbps', '10 Gbps', '100 Gbps'],
    basePrice: 2000,
    features: [
      'Multi-cloud connectivity',
      'Application-aware routing',
      'Zero-touch provisioning',
      'Integrated security',
      'Real-time analytics'
    ],
    icon: 'network',
    category: 'VNF',
    tags: ['VNF', 'SD-WAN', 'Routing', 'Multi-Cloud'],
    rating: { score: 4.8, count: 389 },
    popularity: 92,
    sla: {
      uptime: '99.99%',
      latency: '<8ms',
      support: '24/7'
    },
    vnf: true
  },
  {
    id: 'vnf-fortinet',
    provider: 'Fortinet',
    name: 'FortiGate Virtual Firewall',
    description: 'High-performance virtual security appliance',
    type: 'VNF',
    bandwidthOptions: ['2 Gbps', '10 Gbps', '20 Gbps'],
    basePrice: 1200,
    features: [
      'IPS/IDS',
      'Web filtering',
      'Anti-malware',
      'VPN gateway',
      'Traffic shaping'
    ],
    icon: 'shield',
    category: 'VNF',
    tags: ['VNF', 'Firewall', 'IPS', 'Security'],
    rating: { score: 4.7, count: 334 },
    popularity: 88,
    sla: {
      uptime: '99.99%',
      latency: '<6ms',
      support: '24/7'
    },
    vnf: true
  },
  {
    id: 'vnf-f5-load-balancer',
    provider: 'F5 Networks',
    name: 'BIG-IP Virtual Edition',
    description: 'Advanced application delivery and load balancing',
    type: 'VNF',
    bandwidthOptions: ['5 Gbps', '10 Gbps', '25 Gbps'],
    basePrice: 1800,
    features: [
      'Layer 4-7 load balancing',
      'SSL offloading',
      'Application security',
      'Traffic management',
      'Health monitoring'
    ],
    icon: 'network',
    category: 'VNF',
    tags: ['VNF', 'Load Balancer', 'ADC', 'Performance'],
    rating: { score: 4.8, count: 267 },
    popularity: 85,
    sla: {
      uptime: '99.99%',
      latency: '<4ms',
      support: '24/7'
    },
    vnf: true
  },

  // APIs & Integration
  {
    id: 'api-network-insights',
    provider: 'AT&T',
    name: 'Network Insights API',
    description: 'Real-time network telemetry and analytics API',
    type: 'API',
    bandwidthOptions: ['N/A'],
    basePrice: 500,
    features: [
      'REST API access',
      'Real-time metrics',
      'Historical data',
      'Custom dashboards',
      'Webhook notifications'
    ],
    icon: 'code',
    category: 'API',
    tags: ['API', 'Analytics', 'Monitoring', 'Integration'],
    rating: { score: 4.6, count: 156 },
    popularity: 79,
    sla: {
      uptime: '99.9%',
      latency: '<50ms',
      support: 'Business Hours'
    },
    api: true
  },
  {
    id: 'api-provisioning',
    provider: 'AT&T',
    name: 'Network Provisioning API',
    description: 'Automate network configuration and deployment',
    type: 'API',
    bandwidthOptions: ['N/A'],
    basePrice: 750,
    features: [
      'Automated provisioning',
      'Configuration management',
      'Change tracking',
      'Rollback capability',
      'Audit logs'
    ],
    icon: 'code',
    category: 'API',
    tags: ['API', 'Automation', 'DevOps', 'Provisioning'],
    rating: { score: 4.7, count: 203 },
    popularity: 82,
    sla: {
      uptime: '99.9%',
      latency: '<100ms',
      support: 'Business Hours'
    },
    api: true
  },
  {
    id: 'api-billing',
    provider: 'AT&T',
    name: 'Billing & Usage API',
    description: 'Access billing data and usage reports',
    type: 'API',
    bandwidthOptions: ['N/A'],
    basePrice: 300,
    features: [
      'Usage reports',
      'Cost allocation',
      'Invoice details',
      'Budget alerts',
      'Export capabilities'
    ],
    icon: 'code',
    category: 'API',
    tags: ['API', 'Billing', 'Reports', 'Finance'],
    rating: { score: 4.5, count: 128 },
    popularity: 74,
    sla: {
      uptime: '99.9%',
      latency: '<100ms',
      support: 'Business Hours'
    },
    api: true
  },

  // Managed Services
  {
    id: 'managed-sase',
    provider: 'AT&T',
    name: 'Managed SASE',
    description: 'Secure Access Service Edge as a managed service',
    type: 'Managed Service',
    bandwidthOptions: ['Customized'],
    basePrice: 3500,
    features: [
      'Cloud-native security',
      'Zero Trust Network Access',
      'Secure Web Gateway',
      'Cloud Access Security Broker',
      '24/7 management'
    ],
    icon: 'shield',
    category: 'Managed Service',
    tags: ['SASE', 'Security', 'Zero Trust', 'Managed'],
    rating: { score: 4.8, count: 234 },
    popularity: 89,
    sla: {
      uptime: '99.99%',
      latency: '<10ms',
      support: '24/7'
    },
    addon: true
  },
  {
    id: 'network-monitoring',
    provider: 'AT&T',
    name: 'Advanced Network Monitoring',
    description: 'Comprehensive network visibility and alerting',
    type: 'Monitoring Add-on',
    bandwidthOptions: ['Included'],
    basePrice: 400,
    features: [
      'Real-time monitoring',
      'Performance analytics',
      'Alerting & notifications',
      'Custom reports',
      'Historical trends'
    ],
    icon: 'activity',
    category: 'Monitoring',
    tags: ['Monitoring', 'Analytics', 'Alerts', 'Add-on'],
    rating: { score: 4.6, count: 189 },
    popularity: 83,
    sla: {
      uptime: '99.9%',
      latency: '<10ms',
      support: '24/7'
    },
    addon: true
  }
];

export function Marketplace({ onSelectItem }: MarketplaceProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MarketplaceFilter>({
    categories: [],
    providers: [],
    priceRange: [0, 200],
    tags: [],
    rating: null
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price'>('popular');
  const [activeTab, setActiveTab] = useState<'solutions' | 'all' | 'connections' | 'addons' | 'vnf' | 'api' | 'managed' | 'aws'>('all');

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'internet':
        return <Globe className="h-6 w-6 text-fw-link" />;
      case 'cloud':
        return <Cloud className="h-6 w-6 text-fw-link" />;
      case 'network':
        return <Network className="h-6 w-6 text-fw-link" />;
      case 'shield':
        return <Shield className="h-6 w-6 text-fw-link" />;
      case 'code':
        return <Code className="h-6 w-6 text-fw-link" />;
      case 'activity':
        return <Activity className="h-6 w-6 text-fw-link" />;
      default:
        return <Database className="h-6 w-6 text-fw-link" />;
    }
  };

  // Filter items based on active tab
  const getFilteredItems = () => {
    let items = MARKETPLACE_ITEMS;

    // Filter by tab
    if (activeTab !== 'all') {
      if (activeTab === 'connections') {
        items = items.filter(item => !item.addon && !item.vnf && !item.api);
      } else if (activeTab === 'addons') {
        items = items.filter(item => item.addon);
      } else if (activeTab === 'vnf') {
        items = items.filter(item => item.vnf);
      } else if (activeTab === 'api') {
        items = items.filter(item => item.api);
      } else if (activeTab === 'managed') {
        items = items.filter(item => item.type.includes('Managed'));
      }
    }

    // Filter by search
    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort items
    if (sortBy === 'popular') {
      items = [...items].sort((a, b) => b.popularity - a.popularity);
    } else if (sortBy === 'rating') {
      items = [...items].sort((a, b) => b.rating.score - a.rating.score);
    } else if (sortBy === 'price') {
      items = [...items].sort((a, b) => a.basePrice - b.basePrice);
    }

    return items;
  };

  const handleSelectItem = (item: MarketplaceItem) => {
    if (item.disabled) return;
    navigate('/create');
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar - Always visible */}
      <div className="w-72 shrink-0 space-y-6 animate-in fade-in slide-in-from-left duration-500">
        {/* Main Tabs */}
        <div className="bg-fw-base rounded-lg p-4 border border-fw-secondary">
          <h3 className="text-sm font-semibold text-fw-heading mb-3">Browse</h3>
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('aws')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                activeTab === 'aws'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg'
                  : 'bg-gradient-to-r from-orange-50 to-blue-50 text-gray-900 hover:from-orange-100 hover:to-blue-100 border border-orange-200'
              }`}
            >
              <Cloud className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium text-sm">AWS Partner</div>
                <div className={`text-xs ${activeTab === 'aws' ? 'text-white/90' : 'text-gray-600'}`}>
                  Direct Connect integration
                </div>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-fw-ctaPrimary text-fw-linkPrimary shadow-sm'
                  : 'bg-fw-base text-fw-body hover:bg-fw-wash border border-fw-secondary'
              }`}
            >
              <Network className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium text-sm">Browse Products</div>
                <div className={`text-xs ${activeTab === 'all' ? 'text-white/90' : 'text-fw-bodyLight'}`}>
                  Network services & add-ons
                </div>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('solutions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                activeTab === 'solutions'
                  ? 'bg-fw-ctaPrimary text-fw-linkPrimary shadow-sm'
                  : 'bg-fw-base text-fw-body hover:bg-fw-wash border border-fw-secondary'
              }`}
            >
              <Sparkles className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium text-sm">Browse Solutions</div>
                <div className={`text-xs ${activeTab === 'solutions' ? 'text-white/90' : 'text-fw-bodyLight'}`}>
                  App-specific configurations
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Category Grid - Always visible */}
        <CategoryGrid
          categories={[
            {
              id: 'business-continuity',
              name: 'Business Continuity',
              description: 'Ensure uninterrupted operations',
              icon: Clock,
              count: 3,
              color: 'blue'
            },
            {
              id: 'secure-collaboration',
              name: 'Secure Collaboration',
              description: 'Enable secure team productivity',
              icon: Users,
              count: 2,
              color: 'purple'
            },
            {
              id: 'global-expansion',
              name: 'Global Expansion',
              description: 'Extend your business worldwide',
              icon: Building,
              count: 2,
              color: 'amber'
            },
            {
              id: 'data-protection',
              name: 'Data Protection',
              description: 'Safeguard critical business data',
              icon: Shield,
              count: 1,
              color: 'rose'
            },
            {
              id: 'hybrid-workforce',
              name: 'Hybrid Workforce',
              description: 'Support remote and office teams',
              icon: Home,
              count: 2,
              color: 'emerald'
            },
            {
              id: 'digital-transformation',
              name: 'Digital Transformation',
              description: 'Accelerate business innovation',
              icon: Zap,
              count: 3,
              color: 'cyan'
            }
          ]}
          selectedCategories={[]}
          onCategoryToggle={() => {}}
          title="Browse by Category"
          className="bg-fw-base rounded-lg p-4 border border-fw-secondary"
        />
      </div>

      <div className="flex-1 space-y-6">
        {/* AWS Partner Zone */}
        {activeTab === 'aws' && (
          <AWSPartnerZone />
        )}

        {/* Application Solution Zone */}
        {activeTab === 'solutions' && (
          <ApplicationSolutionZone />
        )}

      {/* Traditional Marketplace */}
      {activeTab !== 'solutions' && activeTab !== 'aws' && (
        <>
          {/* Hero Section */}
            <div className="bg-gradient-to-br from-[#003184] via-[#0047BB] to-[#005CDB] rounded-2xl p-8 shadow-xl text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-3">
                    <Sparkles className="h-6 w-6 mr-2" />
                    <h1 className="text-2xl font-bold">Network Marketplace</h1>
                  </div>
                  <p className="text-blue-100 text-sm max-w-xl">
                    Discover enterprise-grade network solutions, security add-ons, and managed services. Build your perfect infrastructure.
                  </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{getFilteredItems().length}</div>
              <div className="text-blue-100 text-sm">Available Services</div>
            </div>
          </div>
        </div>

        {/* Sub-category Tabs */}
        <div className="bg-fw-base rounded-xl shadow-sm border border-fw-secondary p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-[#003184] text-white shadow-sm'
                  : 'text-fw-body hover:text-fw-heading hover:bg-fw-wash'
              }`}
            >
              All Services
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'connections'
                  ? 'bg-[#003184] text-white shadow-sm'
                  : 'text-fw-body hover:text-fw-heading hover:bg-fw-wash'
              }`}
            >
              <div className="flex items-center justify-center">
                <Network className="h-4 w-4 mr-1.5" />
                Connections
              </div>
            </button>
            <button
              onClick={() => setActiveTab('addons')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'addons'
                  ? 'bg-[#003184] text-white shadow-sm'
                  : 'text-fw-body hover:text-fw-heading hover:bg-fw-wash'
              }`}
            >
              <div className="flex items-center justify-center">
                <Plug className="h-4 w-4 mr-1.5" />
                Add-ons
              </div>
            </button>
            <button
              onClick={() => setActiveTab('vnf')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'vnf'
                  ? 'bg-[#003184] text-white shadow-sm'
                  : 'text-fw-body hover:text-fw-heading hover:bg-fw-wash'
              }`}
            >
              <div className="flex items-center justify-center">
                <Layers className="h-4 w-4 mr-1.5" />
                VNFs
              </div>
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'api'
                  ? 'bg-[#003184] text-white shadow-sm'
                  : 'text-fw-body hover:text-fw-heading hover:bg-fw-wash'
              }`}
            >
              <div className="flex items-center justify-center">
                <Code className="h-4 w-4 mr-1.5" />
                APIs
              </div>
            </button>
            <button
              onClick={() => setActiveTab('managed')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'managed'
                  ? 'bg-[#003184] text-white shadow-sm'
                  : 'text-fw-body hover:text-fw-heading hover:bg-fw-wash'
              }`}
            >
              <div className="flex items-center justify-center">
                <Wrench className="h-4 w-4 mr-1.5" />
                Managed
              </div>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-fw-base p-5 rounded-xl shadow-sm border border-fw-secondary">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fw-bodyLight h-5 w-5" />
              <input
                type="text"
                placeholder="Search marketplace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-fw-secondary rounded-full focus:ring-2 focus:ring-fw-active focus:border-fw-active transition-all"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="border border-fw-secondary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-fw-active focus:border-fw-active"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price">Lowest Price</option>
              </select>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                icon={Filter}
              >
                Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Connection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {getFilteredItems().map((item, index) => (
            <div
              key={item.id}
              className="group bg-fw-base rounded-xl border border-fw-secondary shadow-sm hover:shadow-2xl hover:border-[#003184] hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-visible"
            >
              {/* Recommendation badge on the first item */}
              {index === 0 && (
                <div className="absolute -top-3 -right-3 z-50">
                  <div className="flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold shadow-lg animate-pulse">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Top Pick
                  </div>
                </div>
              )}

              {/* Recommendation badge for the second item */}
              {index === 1 && (
                <div className="absolute -top-3 -right-3 z-50">
                  <div className="flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 via-[#003184] to-blue-600 text-white text-xs font-bold shadow-lg">
                    <Zap className="h-3 w-3 mr-1.5 fill-current" />
                    Recommended
                  </div>
                </div>
              )}

              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#003184]/0 to-[#003184]/0 group-hover:from-[#003184]/5 group-hover:to-transparent transition-all duration-300 pointer-events-none rounded-xl" />

              <div className="relative p-5 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm group-hover:shadow-md transition-all">
                    {getIcon(item.icon)}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.addon && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                        Add-on
                      </span>
                    )}
                    {item.vnf && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                        VNF
                      </span>
                    )}
                    {item.api && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        API
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-fw-heading mb-1 group-hover:text-[#003184] transition-colors">{item.name}</h3>
                <p className="text-xs text-gray-500 mb-2 font-medium">{item.provider}</p>
                <p className="text-sm text-fw-body leading-relaxed">{item.description}</p>
                <div className="flex items-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 ${
                        star <= item.rating.score ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-xs text-gray-500">
                    {item.rating.score} ({item.rating.count})
                  </span>
                </div>
              </div>

              <div className="relative p-5 flex-1">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {item.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Bandwidth Options</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.bandwidthOptions.map((bandwidth) => (
                        <span
                          key={bandwidth}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                        >
                          {bandwidth}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Uptime</div>
                      <div className="text-sm font-medium text-fw-heading">{item.sla.uptime}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Latency</div>
                      <div className="text-sm font-medium text-fw-heading">{item.sla.latency}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Support</div>
                      <div className="text-sm font-medium text-fw-heading">{item.sla.support}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative p-5 mt-auto border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-left">
                    <div className="text-xs text-gray-500 font-medium">Starting at</div>
                    <div className="text-2xl font-bold text-fw-heading">
                      ${item.basePrice}
                      <span className="text-sm font-normal text-gray-500">/mo</span>
                    </div>
                  </div>
                  {item.popularity >= 90 && (
                    <div className="flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                      <Zap className="h-3.5 w-3.5 mr-1 fill-current" />
                      Popular
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleSelectItem(item)}
                  className="w-full inline-flex items-center justify-center px-6 py-3.5 font-semibold transition-all duration-200 text-sm bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--button-primary-focus-ring)] focus:ring-offset-2 rounded-lg shadow-sm hover:shadow-md active:shadow-sm group/btn"
                >
                  <span>{item.addon || item.vnf || item.api ? 'Add to Connection' : 'Select Plan'}</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
      </div>
    </div>
  );
}