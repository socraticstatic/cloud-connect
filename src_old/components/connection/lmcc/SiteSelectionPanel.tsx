import { useState } from 'react';
import { MapPin, Search, CheckCircle2, Circle, Zap, Shield, TrendingUp, Info } from 'lucide-react';
import { LMCCSite } from '../../../types/lmcc';

interface SiteSelectionPanelProps {
  sites: LMCCSite[];
  selectedSites: string[];
  onSitesChange: (siteIds: string[]) => void;
}

export function SiteSelectionPanel({ sites, selectedSites, onSitesChange }: SiteSelectionPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Get unique regions
  const regions = ['all', ...Array.from(new Set(sites.map(s => s.region)))];

  // Filter sites
  const filteredSites = sites.filter(site => {
    const matchesRegion = regionFilter === 'all' || site.region === regionFilter;
    const matchesSearch = searchQuery === '' ||
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.state.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRegion && matchesSearch;
  });

  // Recommended sites (for demonstration)
  const recommendedSites = sites.slice(0, 3).map(s => s.id);

  const handleToggleSite = (siteId: string) => {
    if (selectedSites.includes(siteId)) {
      onSitesChange(selectedSites.filter(id => id !== siteId));
    } else {
      onSitesChange([...selectedSites, siteId]);
    }
  };

  const handleSelectAll = () => {
    onSitesChange(filteredSites.map(s => s.id));
  };

  const handleClearAll = () => {
    onSitesChange([]);
  };

  const handleSelectRecommended = () => {
    onSitesChange(recommendedSites);
    setShowRecommendations(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select LMCC Sites</h3>
        <p className="text-sm text-gray-600">
          Choose one or more AT&T NetBond sites where LMCC connectivity will be established. Each site provides direct connectivity to AWS regions with low latency and high bandwidth.
        </p>
      </div>

      {/* AI Recommendations */}
      {showRecommendations && selectedSites.length === 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-gray-900">AI-Recommended Sites</h4>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Optimized</span>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Based on your AWS region (us-east-1) and network topology, we recommend these sites for optimal performance and redundancy.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectRecommended}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Select Recommended Sites
                </button>
                <button
                  type="button"
                  onClick={() => setShowRecommendations(false)}
                  className="px-3 py-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm border border-gray-300"
                >
                  Choose Manually
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, city, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {regions.map(region => (
            <option key={region} value={region}>
              {region === 'all' ? 'All Regions' : region}
            </option>
          ))}
        </select>
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="text-sm font-medium text-gray-700">
          {selectedSites.length} of {sites.length} sites selected
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Select All
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm text-gray-600 hover:text-gray-700 font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredSites.map(site => {
          const isSelected = selectedSites.includes(site.id);
          const isRecommended = recommendedSites.includes(site.id);
          return (
            <div
              key={site.id}
              onClick={() => handleToggleSite(site.id)}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer transition-all group
                ${isSelected
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }
              `}
            >
              {isRecommended && !isSelected && (
                <div className="absolute -top-2 -right-2">
                  <div className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Zap className="h-3 w-3" />
                    Recommended
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Icon & Selector */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div className={`p-3 rounded-lg ${isSelected ? 'bg-blue-500' : 'bg-gray-100 group-hover:bg-blue-100'}`}>
                    <MapPin className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'}`} />
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-300 group-hover:text-blue-400" />
                  )}
                </div>

                {/* Site Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-base">{site.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {site.region}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border ${
                        site.availability === 'available'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                          site.availability === 'available' ? 'bg-green-500' : 'bg-amber-500'
                        }`} />
                        {site.availability}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    <p className="font-medium">{site.address}</p>
                    <p>{site.city}, {site.state} {site.zip}</p>
                  </div>

                  {/* Site Capabilities */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-gray-200 text-xs">
                      <Shield className="h-3 w-3 text-green-600" />
                      <span className="text-gray-700">Tier 3 Datacenter</span>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-gray-200 text-xs">
                      <TrendingUp className="h-3 w-3 text-blue-600" />
                      <span className="text-gray-700">99.99% Uptime</span>
                    </div>
                    {isRecommended && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md border border-blue-200 text-xs">
                        <Info className="h-3 w-3 text-blue-600" />
                        <span className="text-blue-700">Lowest latency to AWS</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSites.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No sites found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
