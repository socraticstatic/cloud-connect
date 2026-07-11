import { Network, Router, Cloud } from 'lucide-react';
import { Template } from './types';

const vpnToCloudTemplate: Template = {
  name: 'VPN to cloud',
  description: 'Connect AVPN to cloud services via NetBond',
  preview: {
    icons: [
      { type: 'col', icons: [
        { icon: Network, color: 'text-blue-400' }
      ]},
      { type: 'col', icons: [
        { icon: Router, color: 'text-purple-400' }
      ]},
      { type: 'col', icons: [
        { icon: Cloud, color: 'text-blue-400' }
      ]}
    ]
  },
  nodes: [
    {
      id: 'avpn-1',
      type: 'network',
      x: 100,
      y: 200,
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
      y: 200,
      name: 'NetBond Cloud Router 2',
      icon: Router,
      status: 'inactive',
      config: {
        routerType: 'cloud',
        asn: 65000,
        capacity: '10Gbps'
      }
    },
    {
      id: 'cloud-1',
      type: 'destination',
      x: 500,
      y: 200,
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
      source: 'avpn-1',
      target: 'router-1',
      type: 'AVPN',
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
    }
  ]
};