import { Suspense, lazy } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { LazyLoadSection } from '../../common/layouts/LazyLoadSection';
import { SkeletonCard } from '../../common/SkeletonCard';

// Lazy load components
const AlertCards = lazy(() => 
  import('../alerts/AlertCards').then(module => ({ 
    default: module.default 
  }))
);

const MetricsOverview = lazy(() => 
  import('../components/MetricsOverview').then(module => ({ 
    default: module.MetricsOverview 
  }))
);

const NetworkMetrics = lazy(() => 
  import('../metrics/NetworkMetrics').then(module => ({ 
    default: module.NetworkMetrics 
  }))
);

const BillingMetrics = lazy(() => 
  import('../BillingMetrics').then(module => ({ 
    default: module.BillingMetrics 
  }))
);

const SummaryPanel = lazy(() => 
  import('../SummaryPanel').then(module => ({ 
    default: module.SummaryPanel 
  }))
);

export function OverviewTab() {
  const {
    selectedConnection,
    filteredConnections,
    filteredRouters,
    filteredLinks,
    filteredVNFs,
    resourceType,
    summary
  } = useMonitoring();

  return (
    <div className="space-y-6">
      {/* Resource Hierarchy Section */}
      {selectedConnection !== 'all' && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Hierarchy</h3>
          <div className="space-y-4">
            {filteredConnections.map(connection => (
              <div key={connection.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="font-medium text-gray-900">{connection.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{connection.type}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pl-4 border-l-2 border-blue-200">
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cloud Routers</span>
                      <span className="text-lg font-semibold text-blue-600">
                        {filteredRouters.filter(r => r.connectionId === connection.id).length}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {filteredRouters.filter(r => r.connectionId === connection.id && r.status === 'active').length} active
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Links</span>
                      <span className="text-lg font-semibold text-green-600">
                        {filteredLinks.length}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {filteredLinks.filter(l => l.status === 'active').length} active
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">VNFs</span>
                      <span className="text-lg font-semibold text-purple-600">
                        {filteredVNFs.filter(v => v.connectionId === connection.id).length}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {filteredVNFs.filter(v => v.connectionId === connection.id && v.status === 'active').length} active
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Section */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Active Alerts</h3>
        <Suspense fallback={<LoadingSpinner size="md" text="Loading alerts..." />}>
          <AlertCards
            selectedConnection={selectedConnection}
            connections={filteredConnections}
          />
        </Suspense>
      </div>
      
      {/* Metrics Overview */}
      <LazyLoadSection
        placeholder={<SkeletonCard lines={4} />}
        className="w-full"
      >
        <Suspense fallback={<SkeletonCard lines={4} />}>
          <MetricsOverview metrics={summary} />
        </Suspense>
      </LazyLoadSection>
      
      {/* Network Metrics */}
      <LazyLoadSection
        placeholder={<SkeletonCard lines={6} />}
        className="w-full"
      >
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Network Performance</h3>
          <Suspense fallback={<LoadingSpinner size="md" text="Loading network metrics..." />}>
            <NetworkMetrics metrics={summary} />
          </Suspense>
        </div>
      </LazyLoadSection>
      
      {/* Billing Metrics */}
      <LazyLoadSection
        placeholder={<SkeletonCard lines={8} />}
        className="w-full"
      >
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Overview</h3>
          <Suspense fallback={<LoadingSpinner size="md" text="Loading billing data..." />}>
            <BillingMetrics connections={filteredConnections} />
          </Suspense>
        </div>
      </LazyLoadSection>
      
      {/* Summary Panel */}
      <LazyLoadSection
        placeholder={<SkeletonCard lines={4} />}
        className="w-full"
      >
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Analysis</h3>
          <Suspense fallback={<LoadingSpinner size="md" text="Loading usage data..." />}>
            <SummaryPanel connections={filteredConnections} />
          </Suspense>
        </div>
      </LazyLoadSection>
    </div>
  );
}

