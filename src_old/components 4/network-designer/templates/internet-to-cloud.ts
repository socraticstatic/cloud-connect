import { Globe, Router, Cloud } from 'lucide-react';
import { Template } from './types';

const internetToCloudTemplate: Template = {
  name: 'Internet to cloud',
  description: 'Connect internet to cloud services via NetBond',
  preview: {
    icons: [
      { type: 'col', icons: [
        { icon: Globe, color: 'text-blue-400' }
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
      id: 'internet-1',
      type: 'network',
      x: 100,
      y: 200,
      name: 'Internet',
      icon: Globe,
      status: 'inactive',
      config: {
        type: 'internet'
      }
    },
    {
      id: 'router-1',
      type: 'router',
      x: 300,
      y: 200,
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
      id: 'cloud-1',
      type: 'destination',
      x: 500,
      y: 200,
      name: 'AWS Cloud',
      icon: Cloud,
      status: 'inactive',
      config: {
        provider: 'AWS',
        region: 'us-east-1'
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
    }
  ]
};