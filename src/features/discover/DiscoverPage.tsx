import { UnifiedDiscovery } from './UnifiedDiscovery';

// EstateTable remains importable for network-detail views (e.g. a future
// per-cloud drill-down) but is no longer the primary Discover body — the
// unified network+AI inventory view (UnifiedDiscovery) is.

export function DiscoverPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 space-y-6">
      <UnifiedDiscovery />
    </div>
  );
}
