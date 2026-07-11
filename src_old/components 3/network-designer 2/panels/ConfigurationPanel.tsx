import { useState, useEffect } from 'react';
import { Settings, Network, Shield, Activity, Zap, Cpu } from 'lucide-react';
import { NetworkNode, NetworkEdge } from '../../../types';
import { ConnectivityTab } from './configuration/tabs/ConnectivityTab';
import { RoutingTab } from './configuration/tabs/RoutingTab';
import { SecurityTab } from './configuration/tabs/SecurityTab';
import { PerformanceTab } from './configuration/tabs/PerformanceTab';
import { Button } from '../../common/Button';

interface ConfigurationPanelProps {
  selectedNode: NetworkNode | null;
  selectedEdge: NetworkEdge | null;
  onUpdateNode: (nodeId: string, updates: Partial<NetworkNode>) => void;
  onUpdateEdge: (edgeId: string, updates: Partial<NetworkEdge>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
}

export function ConfigurationPanel({
  selectedNode,
  selectedEdge,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge
}: ConfigurationPanelProps) {
  const [activeTab, setActiveTab] = useState<'connectivity' | 'routing' | 'security' | 'performance'>('connectivity');
  const [nodeName, setNodeName] = useState<string>('');

  // Update local name state when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setNodeName(selectedNode.name || '');
    }
  }, [selectedNode]);

  if (!selectedNode && !selectedEdge) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center max-w-md">
          <Cpu className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Network Designer</h3>
          <p className="text-sm text-gray-500">
            Select a node or connection to configure it, or use the toolbar to add new elements to your network design.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'connectivity', label: 'Connectivity', icon: Network },
    { id: 'routing', label: 'Routing', icon: Activity },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'performance', label: 'Performance', icon: Zap }
  ];

  const handleNodeUpdate = (updates: Partial<NetworkNode>) => {
    if (selectedNode) {
      onUpdateNode(selectedNode.id, updates);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setNodeName(newName);
    if (selectedNode) {
      handleNodeUpdate({ name: newName });
    }
  };

  const handleEdgeUpdate = (updates: Partial<NetworkEdge>) => {
    if (selectedEdge) {
      onUpdateEdge(selectedEdge.id, updates);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <Settings className="h-5 w-5 text-brand-blue mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            {selectedNode ? 'Node Configuration' : 'Connection Configuration'}
          </h3>
        </div>
        <button
          onClick={() => selectedNode ? onDeleteNode(selectedNode.id) : selectedEdge && onDeleteEdge(selectedEdge.id)}
          className="text-sm text-red-600 hover:text-red-700 rounded-full"
        >
          Delete {selectedNode ? 'Node' : 'Connection'}
        </button>
      </div>

      {/* Content Area with Vertical Tabs */}
      <div className="flex-1 flex">
        {/* Vertical Tab Bar */}
        <div className="w-48 border-r border-gray-200 bg-gray-50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                w-full flex items-center px-4 py-3 text-sm font-medium network-config-tab
                transition-colors duration-200
                ${activeTab === tab.id
                  ? 'bg-white border-l-2 border-brand-blue text-brand-blue'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <tab.icon className={`h-5 w-5 mr-3 ${
                activeTab === tab.id ? 'text-brand-blue' : 'text-gray-400'
              }`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {selectedNode && (
            <>
              {/* Add Node Name field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node Name
                </label>
                <input
                  type="text"
                  value={nodeName}
                  onChange={handleNameChange}
                  className="form-control w-full rounded-lg"
                  placeholder="Enter node name"
                />
              </div>
              
              {/* Node Type Display */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <div className="text-sm py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
                  {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)}
                </div>
              </div>
              
              {/* Configuration Tabs */}
              {activeTab === 'connectivity' && (
                <ConnectivityTab 
                  node={selectedNode} 
                  onUpdate={handleNodeUpdate} 
                />
              )}
              {activeTab === 'routing' && (
                <RoutingTab 
                  node={selectedNode} 
                  onUpdate={handleNodeUpdate} 
                />
              )}
              {activeTab === 'security' && (
                <SecurityTab 
                  node={selectedNode} 
                  onUpdate={handleNodeUpdate} 
                />
              )}
              {activeTab === 'performance' && (
                <PerformanceTab 
                  node={selectedNode} 
                  onUpdate={handleNodeUpdate} 
                />
              )}
            </>
          )}

          {selectedEdge && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Connection Type
                </label>
                <select
                  value={selectedEdge.type}
                  onChange={(e) => handleEdgeUpdate({ type: e.target.value as any })}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                >
                  <option value="Internet to Cloud">Internet to Cloud</option>
                  <option value="Cloud to Cloud">Cloud to Cloud</option>
                  <option value="Site to Cloud">Site to Cloud</option>
                  <option value="Direct Connect">Direct Connect</option>
                  <option value="Cloud Router">Cloud Router</option>
                  <option value="Ultra-Low Latency">Ultra-Low Latency</option>
                  <option value="Quantum Secure">Quantum Secure</option>
                  <option value="Backbone">Backbone</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bandwidth
                </label>
                <select
                  value={selectedEdge.bandwidth}
                  onChange={(e) => handleEdgeUpdate({ bandwidth: e.target.value })}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                >
                  <option value="1 Gbps">1 Gbps</option>
                  <option value="10 Gbps">10 Gbps</option>
                  <option value="100 Gbps">100 Gbps</option>
                  <option value="400 Gbps">400 Gbps</option>
                  <option value="1 Tbps">1 Tbps</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={selectedEdge.status === 'inactive'}
                      onChange={() => handleEdgeUpdate({ status: 'inactive' })}
                      className="text-brand-blue focus:ring-brand-blue h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Inactive</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={selectedEdge.status === 'active'}
                      onChange={() => handleEdgeUpdate({ status: 'active' })}
                      className="text-brand-blue focus:ring-brand-blue h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VLAN ID
                </label>
                <input
                  type="number"
                  value={selectedEdge.vlan || ''}
                  onChange={(e) => handleEdgeUpdate({ vlan: parseInt(e.target.value) })}
                  placeholder="1-4094"
                  min="1"
                  max="4094"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                />
              </div>

              {activeTab === 'performance' && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Settings</h4>
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Target Latency</label>
                      <select
                        value={selectedEdge.metrics?.latency || '<10ms'}
                        onChange={(e) => handleEdgeUpdate({ 
                          metrics: { 
                            ...selectedEdge.metrics,
                            latency: e.target.value 
                          } 
                        })}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                      >
                        <option value="<1ms">&lt;1ms (Ultra Low Latency)</option>
                        <option value="<5ms">&lt;5ms (Very Low Latency)</option>
                        <option value="<10ms">&lt;10ms (Low Latency)</option>
                        <option value="<20ms">&lt;20ms (Standard)</option>
                        <option value="<50ms">&lt;50ms (Economy)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Packet Loss Target</label>
                      <select
                        value={selectedEdge.metrics?.packetLoss || '<0.01%'}
                        onChange={(e) => handleEdgeUpdate({ 
                          metrics: { 
                            ...selectedEdge.metrics,
                            packetLoss: e.target.value 
                          } 
                        })}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                      >
                        <option value="<0.001%">&lt;0.001% (Mission Critical)</option>
                        <option value="<0.01%">&lt;0.01% (Premium)</option>
                        <option value="<0.1%">&lt;0.1% (Standard)</option>
                        <option value="<0.5%">&lt;0.5% (Basic)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Quality of Service</label>
                      <select
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                      >
                        <option value="premium">Premium (Guaranteed)</option>
                        <option value="business">Business (Priority)</option>
                        <option value="standard">Standard (Best Effort)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Security Settings</h4>
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue h-4 w-4"
                        />
                        <span className="ml-2 text-sm text-gray-700">End-to-End Encryption</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue h-4 w-4"
                        />
                        <span className="ml-2 text-sm text-gray-700">DDoS Protection</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue h-4 w-4"
                        />
                        <span className="ml-2 text-sm text-gray-700">Traffic Inspection</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Encryption Level</label>
                      <select
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                      >
                        <option value="aes256">AES-256 (Standard)</option>
                        <option value="quantum">Quantum-Resistant</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}