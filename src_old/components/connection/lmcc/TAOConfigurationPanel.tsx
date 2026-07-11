import { useState, useEffect } from 'react';
import { Settings, Globe, Network as NetworkIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { LMCCSite, TAOConfiguration, TerminationType, IPAllocation } from '../../../types/lmcc';
import { FormField } from '../../form/FormField';

interface TAOConfigurationPanelProps {
  sites: LMCCSite[];
  selectedSites: string[];
  taoConfig: TAOConfiguration;
  onConfigChange: (config: TAOConfiguration) => void;
}

export function TAOConfigurationPanel({
  sites,
  selectedSites,
  taoConfig,
  onConfigChange
}: TAOConfigurationPanelProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedSitesData = sites.filter(s => selectedSites.includes(s.id));

  // Generate IP allocations when base subnet or starting VLAN changes
  useEffect(() => {
    if (taoConfig.baseSubnet && taoConfig.startingVlanId && selectedSites.length > 0) {
      generateIPAllocations();
    }
  }, [taoConfig.baseSubnet, taoConfig.startingVlanId, selectedSites]);

  const generateIPAllocations = () => {
    try {
      const [baseIP, cidr] = taoConfig.baseSubnet.split('/');
      const baseOctets = baseIP.split('.').map(Number);

      const allocations: IPAllocation[] = selectedSites.map((siteId, index) => {
        // Generate /24 subnets from base
        const thirdOctet = baseOctets[2] + index;
        const subnet = `${baseOctets[0]}.${baseOctets[1]}.${thirdOctet}.0/24`;
        const gateway = `${baseOctets[0]}.${baseOctets[1]}.${thirdOctet}.1`;

        return {
          siteId,
          subnet,
          vlanId: taoConfig.startingVlanId + index,
          gateway
        };
      });

      onConfigChange({
        ...taoConfig,
        ipAllocations: allocations
      });
    } catch (error) {
      console.error('Error generating IP allocations:', error);
    }
  };

  const validateASN = (asn: number): boolean => {
    return asn >= 1 && asn <= 4294967295;
  };

  const validateCIDR = (cidr: string): boolean => {
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    return cidrRegex.test(cidr);
  };

  const handleTerminationTypeChange = (type: TerminationType) => {
    onConfigChange({
      ...taoConfig,
      terminationType: type,
      bgpConfig: type === 'bgp' ? (taoConfig.bgpConfig || { localASN: 65000, remoteASN: 65001 }) : undefined
    });
  };

  const handleBGPChange = (field: string, value: any) => {
    if (!taoConfig.bgpConfig) return;

    onConfigChange({
      ...taoConfig,
      bgpConfig: {
        ...taoConfig.bgpConfig,
        [field]: value
      }
    });
  };

  const handleBaseSubnetChange = (subnet: string) => {
    const newErrors = { ...errors };

    if (subnet && !validateCIDR(subnet)) {
      newErrors.baseSubnet = 'Invalid CIDR notation (e.g., 10.100.0.0/16)';
    } else {
      delete newErrors.baseSubnet;
    }

    setErrors(newErrors);
    onConfigChange({ ...taoConfig, baseSubnet: subnet });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">TAO Configuration</h3>
        <p className="text-sm text-gray-600">
          Configure Termination and Orchestration settings including connection type, BGP parameters, IP addressing, and routing policies.
        </p>
      </div>

      {/* Connection Type Selection */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Connection Type <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-4">
          LMCC provides IP to Cloud connectivity (not Internet to Cloud). Choose your connection model:
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border-2 border-blue-500 relative">
            <div className="absolute -top-2 -right-2">
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold">Recommended</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <NetworkIcon className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">IP to Cloud</span>
            </div>
            <p className="text-xs text-gray-600">
              Direct IP connectivity from your private network to AWS. Provides secure, low-latency access without traversing the public internet.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700 font-medium">Selected for LMCC</span>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 opacity-60">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-5 w-5 text-gray-500" />
              <span className="font-semibold text-gray-700">Internet to Cloud</span>
            </div>
            <p className="text-xs text-gray-600">
              Connection via public internet. Not available for LMCC connections - requires different connection type.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">Not available for LMCC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Redundancy Configuration */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Redundancy Configuration
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Configure redundancy options for high availability. Metro redundancy provides failover within the same metropolitan area.
        </p>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-all">
            <input
              type="radio"
              name="redundancy"
              value="none"
              defaultChecked
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Single Connection</div>
              <div className="text-sm text-gray-600">Standard connectivity without redundancy</div>
            </div>
          </label>
          <label className="flex items-start gap-3 p-3 border-2 border-blue-200 bg-blue-50 rounded-lg hover:border-blue-400 cursor-pointer transition-all">
            <input
              type="radio"
              name="redundancy"
              value="metro"
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">Metro Redundancy</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Recommended</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">Dual connections within the same metro area for failover protection</div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>99.99% availability</span>
                <span>Automatic failover</span>
                <span>Active/Active or Active/Standby</span>
              </div>
            </div>
          </label>
          <label className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-all">
            <input
              type="radio"
              name="redundancy"
              value="geographic"
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Geographic Redundancy</div>
              <div className="text-sm text-gray-600 mb-2">Connections across multiple geographic locations for maximum resilience</div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>99.999% availability</span>
                <span>Disaster recovery</span>
                <span>Multi-region support</span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Termination Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Termination Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-4">
          {(['public', 'private', 'bgp'] as TerminationType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTerminationTypeChange(type)}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${taoConfig.terminationType === type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                {type === 'public' && <Globe className="h-5 w-5 text-blue-600" />}
                {type === 'private' && <NetworkIcon className="h-5 w-5 text-green-600" />}
                {type === 'bgp' && <Settings className="h-5 w-5 text-purple-600" />}
                <span className="font-medium text-gray-900 capitalize">{type === 'bgp' ? 'BGP Peering' : `${type} ${type === 'public' ? 'Internet' : 'Network'}`}</span>
              </div>
              <p className="text-xs text-gray-500">
                {type === 'public' && 'Public internet connectivity'}
                {type === 'private' && 'Private network termination'}
                {type === 'bgp' && 'Dynamic BGP routing'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* BGP Configuration (shown only when BGP is selected) */}
      {taoConfig.terminationType === 'bgp' && taoConfig.bgpConfig && (
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-5 w-5 text-purple-600" />
            <h4 className="text-sm font-medium text-gray-900">BGP Configuration</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Local ASN"
              error={errors.localASN}
              required
            >
              <input
                type="number"
                value={taoConfig.bgpConfig.localASN}
                onChange={(e) => {
                  const asn = parseInt(e.target.value) || 0;
                  handleBGPChange('localASN', asn);
                  if (!validateASN(asn)) {
                    setErrors({ ...errors, localASN: 'ASN must be between 1 and 4294967295' });
                  } else {
                    const newErrors = { ...errors };
                    delete newErrors.localASN;
                    setErrors(newErrors);
                  }
                }}
                min="1"
                max="4294967295"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 65000"
              />
            </FormField>

            <FormField
              label="Remote ASN"
              error={errors.remoteASN}
              required
            >
              <input
                type="number"
                value={taoConfig.bgpConfig.remoteASN}
                onChange={(e) => {
                  const asn = parseInt(e.target.value) || 0;
                  handleBGPChange('remoteASN', asn);
                  if (!validateASN(asn)) {
                    setErrors({ ...errors, remoteASN: 'ASN must be between 1 and 4294967295' });
                  } else {
                    const newErrors = { ...errors };
                    delete newErrors.remoteASN;
                    setErrors(newErrors);
                  }
                }}
                min="1"
                max="4294967295"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 65001"
              />
            </FormField>
          </div>

          <FormField
            label="Authentication Key (Optional)"
            helpText="BGP MD5 authentication key"
          >
            <input
              type="password"
              value={taoConfig.bgpConfig.authenticationKey || ''}
              onChange={(e) => handleBGPChange('authenticationKey', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter authentication key"
            />
          </FormField>
        </div>
      )}

      {/* IP Addressing Configuration */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">IP Addressing & VLANs</h4>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Base Subnet"
            error={errors.baseSubnet}
            required
            helpText="CIDR notation, e.g., 10.100.0.0/16"
          >
            <input
              type="text"
              value={taoConfig.baseSubnet}
              onChange={(e) => handleBaseSubnetChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="10.100.0.0/16"
            />
          </FormField>

          <FormField
            label="Starting VLAN ID"
            required
            helpText="VLANs will auto-increment from this value"
          >
            <input
              type="number"
              value={taoConfig.startingVlanId}
              onChange={(e) => onConfigChange({ ...taoConfig, startingVlanId: parseInt(e.target.value) || 100 })}
              min="1"
              max="4094"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="100"
            />
          </FormField>
        </div>

        {/* IP Allocation Preview */}
        {taoConfig.ipAllocations.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-medium text-gray-900">Allocation Preview</h5>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="space-y-2">
              {taoConfig.ipAllocations.map((allocation, index) => {
                const site = sites.find(s => s.id === allocation.siteId);
                return (
                  <div key={allocation.siteId} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-gray-200">
                    <span className="font-medium text-gray-900">{site?.name}</span>
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="font-mono">{allocation.subnet}</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        VLAN {allocation.vlanId}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Routing Policy */}
      <div>
        <FormField
          label="Routing Policy"
          required
        >
          <select
            value={taoConfig.routingPolicy}
            onChange={(e) => onConfigChange({ ...taoConfig, routingPolicy: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="static">Static Routes</option>
            <option value="dynamic">Dynamic Routing</option>
            <option value="policy_based">Policy-Based Routing</option>
          </select>
        </FormField>

        {taoConfig.routingPolicy === 'dynamic' && (
          <div className="mt-3 space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={taoConfig.enableDefaultRoute || false}
                onChange={(e) => onConfigChange({ ...taoConfig, enableDefaultRoute: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Enable default route advertisement</span>
            </label>
          </div>
        )}
      </div>

      {/* Validation Warning */}
      {selectedSites.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            No sites selected. Please select sites in Step 1 to configure TAO settings.
          </p>
        </div>
      )}
    </div>
  );
}
