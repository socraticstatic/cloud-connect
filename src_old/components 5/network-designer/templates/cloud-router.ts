import { Server, Cloud, Router, Network, Globe } from 'lucide-react';
import { Template } from './types';

const cloudRouterTemplate: Template = {
  name: 'Cloud Router',
  description: 'Dual router setup with Internet and AVPN networks',
  preview: {
    icons: [
      { type: 'col', icons: [
        { icon: Globe, color: 'text-gray-400' },
        { icon: Network, color: 'text-purple-400' }
      ]},
      { type: 'col', icons: [
        { icon: Router, color: 'text-blue-400' },
        { icon: Router, color: 'text-blue-400' }
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
      icon: Network,
      status: 'inactive',
      config: {
        type: 'internet',
        subnet: '0.0.0.0/0'
      }
    },
    {
      id: 'vpn-1',
      type: 'network',
      x: 100,
      y: 300,
      name: 'AVPN',
      icon: Network,
      status: 'inactive',
      config: {
        type: 'avpn',
        subnet: '10.0.0.0/8'
      }
    },
    {
      id: 'router-1',
      type: 'router',
      x: 300,
      y: 150,
      name: 'Cloud Router 1',
      icon: Router,
      status: 'inactive',
      config: {
        location: 'US East',
        asn: 65000,
        capacity: '10 Gbps'
      }
    },
    {
      id: 'router-2',
      type: 'router',
      x: 300,
      y: 300,
      name: 'Cloud Router 2',
      icon: Router,
      status: 'inactive',
      config: {
        location: 'US West',
        asn: 65001,
        capacity: '10 Gbps'
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
      source: 'router-1',
      target: 'cloud-1',
      type: 'Cloud Router',
      bandwidth: '10 Gbps',
      status: 'inactive'
    },
    {
      id: 'edge-3',
      source: 'vpn-1',
      target: 'router-2',
      type: 'VPN',
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