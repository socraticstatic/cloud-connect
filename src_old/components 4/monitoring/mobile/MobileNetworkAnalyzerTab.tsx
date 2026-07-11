import { useState } from 'react';
import { Activity, Settings, Network, Shield, ChevronDown, ChevronUp, Play, CheckCircle, XCircle } from 'lucide-react';
import { Connection } from '../../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileNetworkAnalyzerTabProps {
  selectedConnection: string;
  connections: Connection[];
}

export function MobileNetworkAnalyzerTab({ selectedConnection, connections }: MobileNetworkAnalyzerTabProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    performance: true,
    path: false,
    security: false,
    routing: false
  });
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | 'running' | 'pending'>>({
    dns: 'pending',
    port: 'pending',
    latency: 'pending',
    bandwidth: 'pending',
    security: 'pending'
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const runTest = async () => {
    setIsRunningTest(true);
    
    // Reset test results
    setTestResults({
      dns: 'pending',
      port: 'pending',
      latency: 'pending',
      bandwidth: 'pending',
      security: 'pending'
    });
    
    // Simulate test running with sequential updates
    setTestResults(prev => ({ ...prev, dns: 'running' }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTestResults(prev => ({ ...prev, dns: 'success' }));
    
    setTestResults(prev => ({ ...prev, port: 'running' }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTestResults(prev => ({ ...prev, port: 'success' }));
    
    setTestResults(prev => ({ ...prev, latency: 'running' }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTestResults(prev => ({ ...prev, latency: 'success' }));
    
    setTestResults(prev => ({ ...prev, bandwidth: 'running' }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTestResults(prev => ({ ...prev, bandwidth: 'success' }));
    
    setTestResults(prev => ({ ...prev, security: 'running' }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTestResults(prev => ({ ...prev, security: Math.random() > 0.7 ? 'error' : 'success' }));
    
    setIsRunningTest(false);
  };

  // Calculate performance metrics once
  const activeConnections = connections.filter(c => c.status === 'Active');
  const avgLatency = activeConnections.reduce((sum, conn) => {
    const latency = parseFloat(conn.performance?.latency || '0');
    return sum + latency;
  }, 0) / activeConnections.length || 0;

  const avgBandwidth = activeConnections.reduce((sum, conn) => {
    const utilization = conn.performance?.bandwidthUtilization || 0;
    return sum + utilization;
  }, 0) / activeConnections.length || 0;

  return (
    <div className="space-y-4">
      {/* Performance Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('performance')}
        >
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-brand-blue mr-2" />
            <h3 className="text-base font-medium text-gray-900">Performance Metrics</h3>
          </div>
          {expandedSections.performance ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <AnimatePresence>
          {expandedSections.performance && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex flex-col items-center">
                      <div className="text-xs text-gray-500 mb-1">Avg Latency</div>
                      <div className="text-lg font-semibold text-gray-900">{avgLatency.toFixed(1)}ms</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex flex-col items-center">
                      <div className="text-xs text-gray-500 mb-1">Bandwidth</div>
                      <div className="text-lg font-semibold text-gray-900">{avgBandwidth.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  {[
                    { protocol: 'TCP', percentage: 65, color: 'bg-brand-blue' },
                    { protocol: 'UDP', percentage: 25, color: 'bg-green-500' },
                    { protocol: 'ICMP', percentage: 8, color: 'bg-purple-500' },
                    { protocol: 'Other', percentage: 2, color: 'bg-gray-500' }
                  ].map((item) => (
                    <div key={item.protocol}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{item.protocol}</span>
                        <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} transition-all duration-300`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Path Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('path')}
        >
          <div className="flex items-center">
            <Network className="h-5 w-5 text-brand-blue mr-2" />
            <h3 className="text-base font-medium text-gray-900">Path Analysis</h3>
          </div>
          {expandedSections.path ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <AnimatePresence>
          {expandedSections.path && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 pb-4">
                <div className="space-y-3">
                  {[
                    { name: 'Customer Gateway', status: 'healthy', latency: '1.2ms' },
                    { name: 'VPN Tunnel', status: 'healthy', latency: '1.5ms' },
                    { name: 'Virtual Private Gateway', status: 'healthy', latency: '1.5ms' }
                  ].map((hop, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        hop.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <div className="ml-3 flex-1">
                        <div className="text-sm text-gray-900">{hop.name}</div>
                        <div className="text-xs text-gray-500">{hop.latency} latency</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Security Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('security')}
        >
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-brand-blue mr-2" />
            <h3 className="text-base font-medium text-gray-900">Security Analysis</h3>
          </div>
          {expandedSections.security ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <AnimatePresence>
          {expandedSections.security && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 pb-4">
                <div className="space-y-3">
                  {[
                    { name: 'Encryption', status: 'compliant', details: 'AES-256 encryption enabled' },
                    { name: 'Firewall Rules', status: 'warning', details: 'Some rules need review' },
                    { name: 'DDoS Protection', status: 'compliant', details: 'Protection active' }
                  ].map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'compliant'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{item.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Connection Test */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-medium text-gray-900">Connection Test</h3>
          <button
            onClick={runTest}
            disabled={isRunningTest}
            className={`
              inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
              ${isRunningTest
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-brand-blue hover:bg-brand-darkBlue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue'
              }
            `}
          >
            {isRunningTest ? (
              <RefreshCw className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isRunningTest ? 'Running...' : 'Run Tests'}
          </button>
        </div>

        <div className="space-y-3">
          {Object.entries(testResults).map(([test, status]) => {
            const testName = {
              dns: 'DNS Resolution',
              port: 'Port Availability',
              latency: 'Latency Check',
              bandwidth: 'Bandwidth Test',
              security: 'Security Verification'
            }[test];
            
            return (
              <div
                key={test}
                className={`
                  p-3 rounded-lg border
                  ${status === 'success' ? 'border-green-200 bg-green-50' :
                    status === 'error' ? 'border-red-200 bg-red-50' :
                    status === 'running' ? 'border-brand-blue/20 bg-brand-lightBlue' :
                    'border-gray-200 bg-gray-50'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
                    {status === 'error' && <XCircle className="h-5 w-5 text-red-500 mr-2" />}
                    {status === 'running' && <RefreshCw className="h-5 w-5 text-brand-blue mr-2 animate-spin" />}
                    {status === 'pending' && <div className="h-5 w-5 rounded-full border-2 border-gray-200 mr-2" />}
                    <span className="font-medium text-gray-900">{testName}</span>
                  </div>
                  {status === 'success' && (
                    <span className="text-xs text-gray-500">
                      {Math.floor(Math.random() * 1000)}ms
                    </span>
                  )}
                </div>
                {status === 'error' && (
                  <p className="mt-1 text-xs text-red-600 ml-7">
                    Failed to complete test. Please try again.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Import at the top was missing this component
import { RefreshCw } from 'lucide-react';