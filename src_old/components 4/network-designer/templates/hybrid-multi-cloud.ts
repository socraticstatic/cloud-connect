import { Globe, Network, Router, Cloud } from 'lucide-react';
import { Template } from './types';

const hybridMultiCloudTemplate: Template = {
  name: 'Hybrid multi-cloud',
  description: 'Combined internet and AVPN access to multiple clouds',
  preview: {
    icons: [
      { type: 'col', icons: [
        { icon: Globe, color: 'text-blue-400' },
        { icon: Network, color: 'text-purple-400' }
      ]},
      { type: 'col', icons: [
        { icon: Router, color: 'text-purple-400' },
        { icon: Router, color: 'text-purple-400' }
      ]},
      { type: 'col', icons: [
        { icon: Cloud, color: 'text-blue-400' },
        { icon: Cloud, color: 'text-blue-400' }
      ]}
    ]
  },
  nodes: [
    {
      id: 'internet-1',
      type: 'network',
      x: 100,
      y: 150,
      name: 'Internet',
      icon: Globe,
      status: 'inactive',
      config: {
        type: 'internet'
      }
    },
    {
      id: 'avpn-1',
      type: 'network',
      x: 100,
      y: 300,
      name: 'AVPN',
      icon: Network,
      status: 'inactive',
      config: {
        type: 'avpn'
      }
    },
    {
      id: 'router-1',
      type: 'router',
      x: 300,
      y: 150,
      name: 'NetBond Cloud Router 1',
      icon: Router,
      status: 'inactive',
      config: {
        routerType: 'cloud',
        asn: 65000,
        capacity: '10Gbps'
      }
    },
    {
      id: 'router-2',
      type: 'router',
      x: 300,
      y: 300,
      name: 'NetBond Cloud Router 2',
      icon: Router,
      status: 'inactive',
      config: {
        routerType: 'cloud',
        asn: 65001,
        capacity: '10Gbps'
      }
    },
    {
      id: 'cloud-1',
      type: 'destination',
      x: 500,
      y: 150,
      name: 'AWS Cloud',
      icon: Cloud,
      status: 'inactive',
      config: {
        provider: 'AWS',
        region: 'us-east-1'
      }
    },
    {
      id: 'cloud-2',
      type: 'destination',
      x: 500,
      y: 300,
      name: 'Azure Cloud',
      icon: Cloud,
      status: 'inactive',
      config: {
        provider: 'Azure',
        region: 'eastus'
      }
    }
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'internet-1',
      target: 'router-1',
      type: 'Internet Direct',
      bandwidth: '10 Gbps',
      status: 'inactive'
    },
    {
      id: 'edge-2',
      source: 'avpn-1',
      target: 'router-2',
      type: 'AVPN',
      bandwidth: '10 Gbps',
      status: 'inactive'
    },
    {
      id: 'edge-3',
      source: 'router-1',
      target: 'cloud-1',
      type: 'Cloud Router',
      bandwidth: '10 Gbps',
      status: 'inactive'
    },
    {
      id: 'edge-4',
      source: 'router-2',
      target: 'cloud-2',
      type: 'Cloud Router',
      bandwidth: '10 Gbps',
      status: 'inactive'
    },
    {
      id: 'edge-5',
      source: 'router-1',
      target: 'router-2',
      type: 'Cloud Router',
      bandwidth: '10 Gbps',
      status: 'inactive'
    }
  ]
};