import { Router, Cloud } from 'lucide-react';
import { Template } from './types';

const cloudToCloudLocalTemplate: Template = {
  name: 'Cloud to cloud - local',
  description: 'Connect cloud providers in the same region',
  preview: {
    icons: [
      { type: 'col', icons: [
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
      id: 'router-1',
      type: 'router',
      x: 100,
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
      x: 300,
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
      x: 300,
      y: 250,
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
      source: 'router-1',
      target: 'cloud-1',
      type: 'Cloud Router',
      bandwidth: '10 Gbps',
      status: 'inactive'
    },
    {
      id: 'edge-2',
      source: 'router-1',
      target: 'cloud-2',
      type: 'Cloud Router',
      bandwidth: '10 Gbps',
      status: 'inactive'
    }
  ]
};