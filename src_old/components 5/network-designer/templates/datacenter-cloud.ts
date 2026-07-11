import { Server, Router, Cloud } from 'lucide-react';
import { Template } from './types';

const datacenterCloudTemplate: Template = {
  name: 'DataCenter to Cloud',
  description: 'Direct connection from datacenter to cloud services',
  preview: {
    icons: [
      { type: 'col', icons: [
        { icon: Server, color: 'text-gray-400' }
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
      id: 'source-1',
      type: 'source',
      x: 100,
      y: 150,
      name: 'Source Node',
      icon: Server,
      status: 'inactive',
      config: {
        type: 'datacenter',
        connectionType: 'dedicated',
        bandwidth: '10Gbps'
      }
    },
    {
      id: 'router-1',
      type: 'router',
      x: 100,
      y: 300,
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
      y: 225,
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
      source: 'source-1',
      target: 'cloud-1',
      type: 'Direct Connect',
      bandwidth: '10 Gbps',
      status: 'inactive'
    },
    {
      id: 'edge-2',
      source: 'source-1',
      target: 'router-1',
      type: 'Direct Connect',
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
    }
  ]
};