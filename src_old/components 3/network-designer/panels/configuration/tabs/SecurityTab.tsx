import { NetworkNode } from '../../../../../types';

interface SecurityTabProps {
  node: NetworkNode;
  onUpdate: (updates: Partial<NetworkNode>) => void;
}

export function SecurityTab({ node, onUpdate }: SecurityTabProps) {
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
      {/* Common security settings for all node types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Encryption</label>
        <select
          value={node.config?.encryption || 'aes256'}
          onChange={(e) => handleConfigChange('encryption', e.target.value)}
          className="form-control w-full"
        >
          <option value="aes256">AES-256</option>
          <option value="aes128">AES-128</option>
          <option value="quantum">Quantum-resistant</option>
          <option value="none">None</option>
        </select>
      </div>
      
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={node.config?.firewall || false}
            onChange={(e) => handleConfigChange('firewall', e.target.checked)}
            className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
          />
          <span className="text-sm text-gray-700">Enable Firewall</span>
        </label>
      </div>

      {/* Source node specific security settings */}
      {node.type === 'source' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Access Control</label>
            <select
              value={node.config?.accessControl || 'private'}
              onChange={(e) => handleConfigChange('accessControl', e.target.value)}
              className="form-control w-full"
            >
              <option value="private">Private Access</option>
              <option value="public">Public Access</option>
              <option value="restricted">Restricted Access</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Security Groups</label>
            <input
              type="text"
              value={node.config?.securityGroups || ''}
              onChange={(e) => handleConfigChange('securityGroups', e.target.value)}
              placeholder="e.g., sg-123456"
              className="form-control w-full"
            />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={node.config?.ddosProtection || false}
                onChange={(e) => handleConfigChange('ddosProtection', e.target.checked)}
                className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
              />
              <span className="text-sm text-gray-700">DDoS Protection</span>
            </label>
          </div>
        </>
      )}

      {/* Destination node specific security settings */}
      {node.type === 'destination' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cloud Security</label>
            <select
              value={node.config?.cloudSecurity || 'standard'}
              onChange={(e) => handleConfigChange('cloudSecurity', e.target.value)}
              className="form-control w-full"
            >
              <option value="standard">Standard Security</option>
              <option value="enhanced">Enhanced Security</option>
              <option value="custom">Custom Security</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Level</label>
            <select
              value={node.config?.complianceLevel || 'standard'}
              onChange={(e) => handleConfigChange('complianceLevel', e.target.value)}
              className="form-control w-full"
            >
              <option value="standard">Standard</option>
              <option value="hipaa">HIPAA</option>
              <option value="pci">PCI DSS</option>
              <option value="sox">SOX</option>
            </select>
          </div>
        </>
      )}

      {/* Router node specific security settings */}
      {node.type === 'router' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Access Lists</label>
            <textarea
              value={node.config?.accessLists || ''}
              onChange={(e) => handleConfigChange('accessLists', e.target.value)}
              rows={3}
              className="form-control w-full"
              placeholder="Enter ACL rules"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Control Plane Protection</label>
            <select
              value={node.config?.controlPlaneProtection || 'standard'}
              onChange={(e) => handleConfigChange('controlPlaneProtection', e.target.value)}
              className="form-control w-full"
            >
              <option value="standard">Standard Protection</option>
              <option value="enhanced">Enhanced Protection</option>
              <option value="custom">Custom Protection</option>
            </select>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={node.config?.packetInspection || false}
                onChange={(e) => handleConfigChange('packetInspection', e.target.checked)}
                className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
              />
              <span className="text-sm text-gray-700">Enable Packet Inspection</span>
            </label>
          </div>
        </>
      )}

      {/* Network node specific security settings */}
      {node.type === 'network' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Network Security</label>
            <select
              value={node.config?.networkSecurity || 'standard'}
              onChange={(e) => handleConfigChange('networkSecurity', e.target.value)}
              className="form-control w-full"
            >
              <option value="standard">Standard Security</option>
              <option value="enhanced">Enhanced Security</option>
              <option value="custom">Custom Security</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Firewall Rules</label>
            <textarea
              value={node.config?.firewallRules || ''}
              onChange={(e) => handleConfigChange('firewallRules', e.target.value)}
              rows={3}
              className="form-control w-full"
              placeholder="Enter firewall rules"
            />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={node.config?.ipSecEnabled || false}
                onChange={(e) => handleConfigChange('ipSecEnabled', e.target.checked)}
                className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
              />
              <span className="text-sm text-gray-700">Enable IPSec</span>
            </label>
          </div>
        </>
      )}
    </div>
  );
}