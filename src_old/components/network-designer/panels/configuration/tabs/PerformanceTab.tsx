import { useState } from 'react';
import { NetworkNode } from '../../../../../types';
import { Zap, Activity, TrendingUp } from 'lucide-react';

interface PerformanceTabProps {
  node: NetworkNode;
  onUpdate: (updates: Partial<NetworkNode>) => void;
}

export function PerformanceTab({ node, onUpdate }: PerformanceTabProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleConfigChange = (key: string, value: any) => {
    onUpdate({
      config: {
        ...node.config,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-lightBlue border border-brand-blue/20 rounded-lg p-4">
        <div className="flex items-center">
          <Zap className="h-5 w-5 text-brand-blue mr-2" />
          <p className="text-sm text-brand-blue">
            Configure performance settings for optimal network operation.
          </p>
        </div>
      </div>

      {/* Common performance settings for all node types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Performance Profile</label>
        <select
          value={node.config?.performanceProfile || 'balanced'}
          onChange={(e) => handleConfigChange('performanceProfile', e.target.value)}
          className="form-control w-full"
        >
          <option value="balanced">Balanced</option>
          <option value="latency">Low Latency</option>
          <option value="throughput">High Throughput</option>
          <option value="reliability">High Reliability</option>
        </select>
      </div>

      {/* Source node specific performance settings */}
      {node.type === 'source' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Throughput Capacity</label>
            <select
              value={node.config?.throughputCapacity || 'standard'}
              onChange={(e) => handleConfigChange('throughputCapacity', e.target.value)}
              className="form-control w-full"
            >
              <option value="standard">Standard (10 Gbps)</option>
              <option value="high">High Performance (40 Gbps)</option>
              <option value="ultra">Ultra Performance (100 Gbps)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Latency Profile</label>
            <select
              value={node.config?.latencyProfile || 'standard'}
              onChange={(e) => handleConfigChange('latencyProfile', e.target.value)}
              className="form-control w-full"
            >
              <option value="standard">Standard (&lt;10ms)</option>
              <option value="low">Low Latency (&lt;5ms)</option>
              <option value="ultra">Ultra Low Latency (&lt;1ms)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Burst Capacity</label>
            <div className="flex items-center">
              <input
                type="range"
                min="100"
                max="500"
                step="10"
                value={node.config?.burstCapacity || 150}
                onChange={(e) => handleConfigChange('burstCapacity', parseInt(e.target.value))}
                className="flex-1 mr-4"
              />
              <span className="text-sm font-medium text-gray-700 w-16">
                {node.config?.burstCapacity || 150}%
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Maximum burst capacity as percentage of base throughput
            </p>
          </div>
        </>
      )}

      {/* Router node specific performance settings */}
      {node.type === 'router' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Processing Capacity</label>
            <select
              value={node.config?.processingCapacity || 'standard'}
              onChange={(e) => handleConfigChange('processingCapacity', e.target.value)}
              className="form-control w-full"
            >
              <option value="standard">Standard (1M pps)</option>
              <option value="high">High Performance (10M pps)</option>
              <option value="ultra">Ultra Performance (100M pps)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Packets per second processing capability
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buffer Size</label>
            <select
              value={node.config?.bufferSize || 'standard'}
              onChange={(e) => handleConfigChange('bufferSize', e.target.value)}
              className="form-control w-full"
            >
              <option value="small">Small (Low Latency)</option>
              <option value="standard">Standard (Balanced)</option>
              <option value="large">Large (High Throughput)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">QoS Profiles</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={node.config?.qosVoice || false}
                  onChange={(e) => handleConfigChange('qosVoice', e.target.checked)}
                  className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                />
                <span className="ml-2 text-sm text-gray-700">Voice Traffic Priority</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={node.config?.qosVideo || false}
                  onChange={(e) => handleConfigChange('qosVideo', e.target.checked)}
                  className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                />
                <span className="ml-2 text-sm text-gray-700">Video Traffic Priority</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={node.config?.qosRealtime || false}
                  onChange={(e) => handleConfigChange('qosRealtime', e.target.checked)}
                  className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                />
                <span className="ml-2 text-sm text-gray-700">Realtime Data Priority</span>
              </label>
            </div>
          </div>
        </>
      )}

      {/* Advanced button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-brand-blue hover:text-brand-darkBlue font-medium flex items-center"
        >
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
          <svg
            className={`ml-1.5 h-4 w-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Advanced settings */}
      {showAdvanced && (
        <div className="pt-2 space-y-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">Advanced Performance Settings</h3>
          
          {/* Monitoring level */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Performance Monitoring Level
            </label>
            <select
              value={node.config?.monitoringLevel || 'standard'}
              onChange={(e) => handleConfigChange('monitoringLevel', e.target.value)}
              className="form-control w-full"
            >
              <option value="basic">Basic (15 min intervals)</option>
              <option value="standard">Standard (5 min intervals)</option>
              <option value="advanced">Advanced (1 min intervals)</option>
              <option value="premium">Premium (15 sec intervals)</option>
            </select>
          </div>
          
          {/* Various thresholds and advanced settings based on node type */}
          {(node.type === 'source' || node.type === 'destination') && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Bandwidth Threshold
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={node.config?.bandwidthThreshold || 80}
                    onChange={(e) => handleConfigChange('bandwidthThreshold', parseInt(e.target.value))}
                    className="flex-1 mr-4"
                  />
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {node.config?.bandwidthThreshold || 80}%
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Alert on Threshold Breach
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={node.config?.alertOnThreshold || false}
                    onChange={(e) => handleConfigChange('alertOnThreshold', e.target.checked)}
                    className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Send alerts when thresholds are breached
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}