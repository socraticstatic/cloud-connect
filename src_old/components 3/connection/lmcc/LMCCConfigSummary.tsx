import { MapPin, Gauge, Settings, Edit2, CheckCircle2 } from 'lucide-react';
import { LMCCSite, LMCCConfiguration } from '../../../types/lmcc';

interface LMCCConfigSummaryProps {
  sites: LMCCSite[];
  configuration: Partial<LMCCConfiguration>;
  onEditStep: (step: 1 | 2 | 3) => void;
}

export function LMCCConfigSummary({ sites, configuration, onEditStep }: LMCCConfigSummaryProps) {
  const selectedSitesData = sites.filter(s => configuration.selectedSites?.includes(s.id));
  const totalBandwidth = configuration.bandwidthAllocations?.reduce((sum, a) => sum + a.bandwidth, 0) || 0;

  const getTerminationTypeLabel = (type: string) => {
    switch (type) {
      case 'public': return 'Public Internet';
      case 'private': return 'Private Network';
      case 'bgp': return 'BGP Peering';
      default: return type;
    }
  };

  const completionPercentage = [
    (configuration.selectedSites?.length || 0) > 0,
    (configuration.bandwidthAllocations?.length || 0) > 0,
    configuration.taoConfig?.terminationType && configuration.taoConfig?.baseSubnet
  ].filter(Boolean).length / 3 * 100;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Configuration Summary</h3>
        <p className="text-sm text-gray-600">
          Review your LMCC configuration before saving. You can edit any section by clicking the Edit button.
        </p>
      </div>

      {/* Completion Status */}
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">Configuration Completeness</span>
          <span className="text-2xl font-bold text-gray-900">{Math.round(completionPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Sites Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-700" />
            <h4 className="font-medium text-gray-900">Selected Sites</h4>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {selectedSitesData.length} sites
            </span>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </button>
        </div>
        <div className="p-4">
          {selectedSitesData.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {selectedSitesData.map(site => (
                <div key={site.id} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-gray-900">{site.name}</span>
                  <span className="text-gray-500 text-xs">({site.region})</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No sites selected</p>
          )}
        </div>
      </div>

      {/* Bandwidth Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-gray-700" />
            <h4 className="font-medium text-gray-900">Bandwidth Allocation</h4>
            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              {totalBandwidth >= 1000 ? `${(totalBandwidth / 1000).toFixed(2)} Gbps` : `${totalBandwidth} Mbps`} total
            </span>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </button>
        </div>
        <div className="p-4">
          {configuration.bandwidthAllocations && configuration.bandwidthAllocations.length > 0 ? (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {configuration.bandwidthAllocations.map(allocation => {
                const site = sites.find(s => s.id === allocation.siteId);
                return (
                  <div key={allocation.siteId} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <span className="text-gray-900">{site?.name}</span>
                    <span className="font-medium text-gray-700">{allocation.bandwidth} Mbps</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No bandwidth allocations configured</p>
          )}
        </div>
      </div>

      {/* TAO Configuration Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-700" />
            <h4 className="font-medium text-gray-900">TAO Configuration</h4>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </button>
        </div>
        <div className="p-4 space-y-4">
          {configuration.taoConfig ? (
            <>
              {/* Termination Type */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Termination Type</span>
                <span className="text-sm font-medium text-gray-900">
                  {getTerminationTypeLabel(configuration.taoConfig.terminationType)}
                </span>
              </div>

              {/* BGP Configuration (if applicable) */}
              {configuration.taoConfig.terminationType === 'bgp' && configuration.taoConfig.bgpConfig && (
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 space-y-2">
                  <p className="text-xs font-medium text-gray-900 mb-2">BGP Parameters</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Local ASN</span>
                    <span className="text-sm font-mono text-gray-900">{configuration.taoConfig.bgpConfig.localASN}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Remote ASN</span>
                    <span className="text-sm font-mono text-gray-900">{configuration.taoConfig.bgpConfig.remoteASN}</span>
                  </div>
                  {configuration.taoConfig.bgpConfig.authenticationKey && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Authentication</span>
                      <span className="text-sm text-green-600">Enabled</span>
                    </div>
                  )}
                </div>
              )}

              {/* IP Addressing */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Base Subnet</span>
                <span className="text-sm font-mono text-gray-900">{configuration.taoConfig.baseSubnet}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Starting VLAN ID</span>
                <span className="text-sm font-mono text-gray-900">{configuration.taoConfig.startingVlanId}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Routing Policy</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {configuration.taoConfig.routingPolicy.replace('_', ' ')}
                </span>
              </div>

              {/* IP Allocations */}
              {configuration.taoConfig.ipAllocations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-900 mb-2">
                    IP Allocations ({configuration.taoConfig.ipAllocations.length} sites)
                  </p>
                  <div className="space-y-1 max-h-[150px] overflow-y-auto">
                    {configuration.taoConfig.ipAllocations.map(allocation => {
                      const site = sites.find(s => s.id === allocation.siteId);
                      return (
                        <div key={allocation.siteId} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                          <span className="text-gray-700">{site?.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-gray-600">{allocation.subnet}</span>
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-medium">
                              VLAN {allocation.vlanId}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">No TAO configuration</p>
          )}
        </div>
      </div>
    </div>
  );
}
