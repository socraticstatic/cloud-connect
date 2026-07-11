import { useState } from 'react';
import { Gauge, Zap, DollarSign, TrendingUp, Info } from 'lucide-react';
import { LMCCSite, LMCCBandwidthAllocation } from '../../../types/lmcc';

interface BandwidthAllocationPanelProps {
  sites: LMCCSite[];
  selectedSites: string[];
  bandwidthAllocations: LMCCBandwidthAllocation[];
  onBandwidthChange: (allocations: LMCCBandwidthAllocation[]) => void;
}

const BANDWIDTH_PRESETS = [100, 500, 1000, 10000]; // Mbps

// Cost calculation (example rates)
const calculateMonthlyCost = (bandwidth: number): number => {
  // Tiered pricing model
  if (bandwidth <= 100) return bandwidth * 10; // $10/Mbps
  if (bandwidth <= 1000) return 1000 + (bandwidth - 100) * 8; // $8/Mbps for 101-1000
  return 8200 + (bandwidth - 1000) * 6; // $6/Mbps for 1000+
};

export function BandwidthAllocationPanel({
  sites,
  selectedSites,
  bandwidthAllocations,
  onBandwidthChange
}: BandwidthAllocationPanelProps) {
  const [bulkBandwidth, setBulkBandwidth] = useState<number>(100);

  const selectedSitesData = sites.filter(s => selectedSites.includes(s.id));

  const getBandwidthForSite = (siteId: string): number => {
    const allocation = bandwidthAllocations.find(a => a.siteId === siteId);
    return allocation?.bandwidth || 100;
  };

  const handleBandwidthChange = (siteId: string, bandwidth: number) => {
    const updatedAllocations = bandwidthAllocations.filter(a => a.siteId !== siteId);
    updatedAllocations.push({ siteId, bandwidth });
    onBandwidthChange(updatedAllocations);
  };

  const handleApplyToAll = () => {
    const newAllocations = selectedSites.map(siteId => ({
      siteId,
      bandwidth: bulkBandwidth
    }));
    onBandwidthChange(newAllocations);
  };

  const totalBandwidth = bandwidthAllocations.reduce((sum, a) => sum + a.bandwidth, 0);
  const totalMonthlyCost = bandwidthAllocations.reduce((sum, a) => sum + calculateMonthlyCost(a.bandwidth), 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Allocate Bandwidth</h3>
        <p className="text-sm text-gray-600">
          Configure bandwidth allocation for each selected site. Pricing is tiered and scales with bandwidth. All costs are displayed transparently for AWS Console approval.
        </p>
      </div>

      {/* Billing Information Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <DollarSign className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Surprise-Free Billing</h4>
            <p className="text-sm text-gray-700 mb-2">
              All connection costs are calculated in real-time and will be passed back to AWS Console for your approval before provisioning.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Info className="h-3 w-3" />
              <span>Pricing includes port fees, bandwidth allocation, and TAO configuration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Bandwidth Allocation */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Bulk Bandwidth Assignment</h4>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="number"
              value={bulkBandwidth}
              onChange={(e) => setBulkBandwidth(parseInt(e.target.value) || 0)}
              min="1"
              max="100000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter bandwidth in Mbps"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyToAll}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Apply to All Sites
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <span className="text-xs text-gray-600">Quick presets:</span>
          {BANDWIDTH_PRESETS.map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => setBulkBandwidth(preset)}
              className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              {preset >= 1000 ? `${preset / 1000} Gbps` : `${preset} Mbps`}
            </button>
          ))}
        </div>
      </div>

      {/* Total Bandwidth & Cost Summary */}
      <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-xl p-5 border-2 border-green-200 shadow-lg">
        <div className="grid grid-cols-2 gap-6">
          {/* Bandwidth Summary */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Total Bandwidth</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {totalBandwidth >= 1000
                ? `${(totalBandwidth / 1000).toFixed(2)} Gbps`
                : `${totalBandwidth} Mbps`}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>{selectedSites.length} sites</span>
              <span>•</span>
              <span>Avg: {selectedSites.length > 0 ? Math.round(totalBandwidth / selectedSites.length) : 0} Mbps/site</span>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="border-l-2 border-green-300 pl-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Estimated Monthly Cost</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              ${totalMonthlyCost.toLocaleString()}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-700 font-medium">Tiered pricing applied</span>
            </div>
          </div>
        </div>

        {/* Cost Breakdown Link */}
        <div className="mt-4 pt-4 border-t border-green-200">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            <Info className="h-4 w-4" />
            View detailed pricing breakdown
          </button>
        </div>
      </div>

      {/* Individual Site Bandwidth */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Per-Site Bandwidth Allocation</h4>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {selectedSitesData.map(site => {
            const currentBandwidth = getBandwidthForSite(site.id);
            const siteCost = calculateMonthlyCost(currentBandwidth);
            return (
              <div
                key={site.id}
                className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                      <Gauge className="h-5 w-5 text-blue-700" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-900">{site.name}</h5>
                        <p className="text-sm text-gray-500">
                          {site.city}, {site.state}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-600">Monthly Cost</div>
                        <div className="text-lg font-bold text-green-600">${siteCost.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-600 block mb-1">Bandwidth Allocation</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={currentBandwidth}
                            onChange={(e) => handleBandwidthChange(site.id, parseInt(e.target.value) || 0)}
                            min="1"
                            max="100000"
                            className="w-32 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right font-semibold"
                          />
                          <span className="text-sm font-medium text-gray-700">Mbps</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-600 block mb-1">Cost per Mbps</label>
                        <div className="text-sm font-semibold text-gray-700">
                          ${(siteCost / currentBandwidth).toFixed(2)}/Mbps
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedSitesData.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Gauge className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No sites selected</p>
          <p className="text-sm text-gray-500 mt-1">Go back and select sites to configure bandwidth</p>
        </div>
      )}
    </div>
  );
}
