import { useState } from 'react';
import { Activity, Wifi, Signal, Clock, Network, Shield, Globe, Server, TrendingUp, ArrowUpDown, Group as UserGroup, Router, Link2, Box } from 'lucide-react';
import { Connection } from '../../../types';
import { ConnectionVisualization } from '../ConnectionVisualization';
import { IPEInfoTooltip } from '../../common/IPEInfoTooltip';
import { BandwidthAdjuster } from '../BandwidthAdjuster';

interface ConnectionOverviewProps {
  connection: Connection;
  cloudRoutersCount?: number;
  linksCount?: number;
  vnfsCount?: number;
}

export function ConnectionOverview({ connection, cloudRoutersCount = 0, linksCount = 0, vnfsCount = 0 }: ConnectionOverviewProps) {
  const [currentBandwidth, setCurrentBandwidth] = useState(connection.bandwidth);

  const handleBandwidthChange = (newBandwidth: string) => {
    setCurrentBandwidth(newBandwidth);
    // In a real app, this would update the store and trigger an API call
  };
  return (
    <div className="space-y-6">
      {/* Quick Bandwidth Adjuster */}
      <BandwidthAdjuster
        currentBandwidth={currentBandwidth}
        onBandwidthChange={handleBandwidthChange}
        connectionId={connection.id}
        connectionName={connection.name}
      />

      {/* Network Architecture Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Router className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-sm font-medium text-gray-600">Cloud Routers</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{connection.cloudRouterCount || cloudRoutersCount}</p>
              <p className="text-xs text-gray-500 mt-1">Virtual routing instances</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Link2 className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-sm font-medium text-gray-600">Links (VLANs)</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{connection.linkCount || linksCount}</p>
              <p className="text-xs text-gray-500 mt-1">Virtual network segments</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Box className="h-5 w-5 text-purple-600 mr-2" />
                <p className="text-sm font-medium text-gray-600">VNFs</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{vnfsCount}</p>
              <p className="text-xs text-gray-500 mt-1">Virtual network functions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Network Visualization */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Network Topology</h3>
          <p className="text-sm text-gray-500">Interactive visualization of your network connection</p>
        </div>
        <div className="h-[400px] relative">
          <ConnectionVisualization connection={connection} />
        </div>
      </div>

      {/* Connection Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Network className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Connection Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                connection.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {connection.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Type</span>
              <span className="text-sm font-medium text-gray-900">{connection.type}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Bandwidth</span>
              <span className="text-sm font-medium text-gray-900">{currentBandwidth}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Location</span>
              <span className="text-sm font-medium text-gray-900">{connection.location}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Cloud Provider</span>
              <span className="text-sm font-medium text-gray-900">{connection.provider || 'N/A'}</span>
            </div>

            {connection.primaryIPE && (
              <>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <Server className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Primary IPE</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{connection.primaryIPE}</span>
                </div>
                {connection.secondaryIPE && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <Server className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-gray-700">Secondary IPE (Redundant)</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{connection.secondaryIPE}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {connection.primaryIPE && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-start space-x-2">
              <IPEInfoTooltip variant="connection" className="flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-500">
                <strong>IPE (Infrastructure Provider Edge Router)</strong> is the physical router at the data center where your virtual connection runs. It provides the actual network capacity and cloud provider on-ramps.
              </p>
            </div>
          )}
        </div>

        {/* Network Architecture Explanation */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Network className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Network Architecture</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Router className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Cloud Routers</h4>
                  <p className="text-sm text-gray-600">
                    Virtual routing instances that provide connectivity to cloud providers and other networks. Each cloud router can be associated with multiple links.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-gray-400">↓</div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <Link2 className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Links (VLANs)</h4>
                  <p className="text-sm text-gray-600">
                    Virtual network segments that connect to one or more cloud routers. Links provide Layer 2/3 connectivity and can carry traffic for multiple VNFs.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-gray-400">↓</div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <Box className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Virtual Network Functions</h4>
                  <p className="text-sm text-gray-600">
                    Software-based network services (firewalls, load balancers, SD-WAN) that run on one or more links. VNFs provide advanced networking capabilities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <strong>Hierarchy:</strong> Connection → Cloud Routers ← Links (many-to-many) → VNFs (many-to-many)
            </p>
          </div>
        </div>
        
        {/* Security Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Security Overview</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(connection.security || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  value === true ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : value}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Security features protect your data during transit through encryption, firewall rules, and DDoS protection mechanisms.
            </p>
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Activity className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Performance Metrics</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Latency</span>
                <span className="text-lg font-medium text-gray-900">{connection.performance?.latency || 'N/A'}</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Packet Loss</span>
                <span className="text-lg font-medium text-gray-900">{connection.performance?.packetLoss || 'N/A'}</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Uptime</span>
                <span className="text-lg font-medium text-gray-900">{connection.performance?.uptime || 'N/A'}</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Bandwidth Utilization</span>
                <span className="text-lg font-medium text-gray-900">{connection.performance?.bandwidthUtilization || 0}%</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Performance metrics are updated every 5 minutes. These metrics help you monitor the health and efficiency of your connection.
            </p>
          </div>
        </div>
        
        {/* Connection Features */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Server className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Connection Features</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(connection.features || {}).map(([key, value]) => (
              <div key={key} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Server className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : value}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Connection features define capabilities like redundancy, load balancing, and auto-scaling that enhance your network's resilience and performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}