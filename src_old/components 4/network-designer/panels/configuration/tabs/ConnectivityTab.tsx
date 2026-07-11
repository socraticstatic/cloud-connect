import { NetworkNode } from '../../../../../types';

interface ConnectivityTabProps {
  node: NetworkNode;
  onUpdate: (updates: Partial<NetworkNode>) => void;
}

export function ConnectivityTab({ node, onUpdate }: ConnectivityTabProps) {
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
      {/* Common form elements for all node types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          value={node.status || 'inactive'}
          onChange={(e) => onUpdate({ status: e.target.value as 'active' | 'inactive' })}
          className="form-control w-full"
        >
          <option value="inactive">Inactive</option>
          <option value="active">Active</option>
        </select>
      </div>

      {/* Source node specific settings */}
      {node.type === 'source' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Connection Type</label>
            <select
              value={node.config?.connectionType || 'dedicated'}
              onChange={(e) => handleConfigChange('connectionType', e.target.value)}
              className="form-control w-full"
            >
              <option value="dedicated">Dedicated</option>
              <option value="shared">Shared</option>
              <option value="backup">Backup</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bandwidth</label>
            <select
              value={node.config?.bandwidth || '1Gbps'}
              onChange={(e) => handleConfigChange('bandwidth', e.target.value)}
              className="form-control w-full"
            >
              <option value="1Gbps">1 Gbps</option>
              <option value="10Gbps">10 Gbps</option>
              <option value="100Gbps">100 Gbps</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select
              value={node.config?.location || 'us-east-1'}
              onChange={(e) => handleConfigChange('location', e.target.value)}
              className="form-control w-full"
            >
              <option value="us-east-1">US East (Virginia)</option>
              <option value="us-west-1">US West (California)</option>
              <option value="eu-west-1">EU West (Ireland)</option>
              <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
            </select>
          </div>
        </>
      )}

      {/* Destination node specific settings */}
      {node.type === 'destination' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cloud Provider</label>
            <select
              value={node.config?.provider || 'aws'}
              onChange={(e) => handleConfigChange('provider', e.target.value)}
              className="form-control w-full"
            >
              <option value="aws">Amazon Web Services</option>
              <option value="azure">Microsoft Azure</option>
              <option value="gcp">Google Cloud Platform</option>
              <option value="oracle">Oracle Cloud</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
            <select
              value={node.config?.region || 'us-east-1'}
              onChange={(e) => handleConfigChange('region', e.target.value)}
              className="form-control w-full"
            >
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-west-1">US West (N. California)</option>
              <option value="eu-west-1">Europe (Ireland)</option>
              <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">VPC ID</label>
            <input
              type="text"
              value={node.config?.vpcId || ''}
              onChange={(e) => handleConfigChange('vpcId', e.target.value)}
              placeholder="vpc-xxxxxxxx"
              className="form-control w-full"
            />
          </div>
        </>
      )}

      {/* Router node specific settings */}
      {node.type === 'router' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Router Type</label>
            <select
              value={node.config?.routerType || 'virtual'}
              onChange={(e) => handleConfigChange('routerType', e.target.value)}
              className="form-control w-full"
            >
              <option value="virtual">Virtual Router</option>
              <option value="physical">Physical Router</option>
              <option value="cloud">Cloud Router</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interface Speed</label>
            <select
              value={node.config?.interfaceSpeed || '10Gbps'}
              onChange={(e) => handleConfigChange('interfaceSpeed', e.target.value)}
              className="form-control w-full"
            >
              <option value="1Gbps">1 Gbps</option>
              <option value="10Gbps">10 Gbps</option>
              <option value="100Gbps">100 Gbps</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ASN</label>
            <input
              type="text"
              value={node.config?.asn || ''}
              onChange={(e) => handleConfigChange('asn', e.target.value)}
              placeholder="e.g., 65000"
              className="form-control w-full"
            />
          </div>
        </>
      )}

      {/* Network node specific settings */}
      {node.type === 'network' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Network Type</label>
            <select
              value={node.config?.networkType || 'private'}
              onChange={(e) => handleConfigChange('networkType', e.target.value)}
              className="form-control w-full"
            >
              <option value="private">Private Network</option>
              <option value="public">Public Network</option>
              <option value="hybrid">Hybrid Network</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">VLAN ID</label>
            <input
              type="number"
              value={node.config?.vlanId || ''}
              onChange={(e) => handleConfigChange('vlanId', e.target.value)}
              placeholder="1-4094"
              className="form-control w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">IP Subnet</label>
            <input
              type="text"
              value={node.config?.subnet || ''}
              onChange={(e) => handleConfigChange('subnet', e.target.value)}
              placeholder="e.g., 10.0.0.0/24"
              className="form-control w-full"
            />
          </div>
        </>
      )}
    </div>
  );
}