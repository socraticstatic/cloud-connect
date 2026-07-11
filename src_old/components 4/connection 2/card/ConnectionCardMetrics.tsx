import { Router, Globe, TrendingUp, DollarSign } from 'lucide-react';
import { Connection } from '../../../types';

interface ConnectionCardMetricsProps {
  connection: Connection;
  billingInfo: {
    type: string;
    cost: number | undefined;
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
  };
  performance?: {
    bandwidthUtilization: number;
  };
}

export function ConnectionCardMetrics({
  connection,
  billingInfo,
  performance
}: ConnectionCardMetricsProps) {
  const providers = connection.providers || (connection.provider ? [connection.provider] : []);
  const locations = connection.locations || (connection.location ? [connection.location] : []);
  const datacenters = connection.datacenters || [];
  const cloudRouterCount = connection.cloudRouterCount || 0;
  const linkCount = connection.linkCount || 0;
  const bandwidthUtil = performance?.bandwidthUtilization || 0;

  const getNetworkSummary = () => {
    const parts = [];
    if (cloudRouterCount > 0) {
      parts.push(`${cloudRouterCount} Cloud Router${cloudRouterCount !== 1 ? 's' : ''}`);
    }
    if (linkCount > 0) {
      parts.push(`${linkCount} Link${linkCount !== 1 ? 's' : ''}`);
    }
    return parts.length > 0 ? parts.join(' • ') : 'Not configured';
  };

  const getGeographicSummary = () => {
    const parts = [];

    if (providers.length > 1) {
      parts.push(`${providers.length} Providers`);
    } else if (providers.length === 1) {
      parts.push(providers[0]);
    }

    if (locations.length > 1) {
      parts.push(`${locations.length} Cities`);
    } else if (locations.length === 1) {
      parts.push(locations[0]);
    }

    if (datacenters.length > 0) {
      parts.push(`${datacenters.length} DC${datacenters.length !== 1 ? 's' : ''}`);
    }

    return parts.length > 0 ? parts.join(' • ') : 'Not configured';
  };

  const getUtilizationColor = () => {
    if (bandwidthUtil > 90) return 'text-fw-error';
    if (bandwidthUtil > 80) return 'text-fw-warn';
    if (bandwidthUtil > 60) return 'text-fw-link';
    return 'text-fw-success';
  };

  const getUtilizationBgColor = () => {
    if (bandwidthUtil > 90) return 'bg-red-50';
    if (bandwidthUtil > 80) return 'bg-orange-50';
    if (bandwidthUtil > 60) return 'bg-fw-blue-light';
    return 'bg-green-50';
  };

  const networkSummary = getNetworkSummary();
  const geographicSummary = getGeographicSummary();
  const utilizationColor = getUtilizationColor();
  const utilizationBgColor = getUtilizationBgColor();

  const allLocations = locations.join(', ');
  const allProviders = providers.join(', ');
  const allDatacenters = datacenters.join(', ');
  const geographicTooltip = [allProviders, allLocations, allDatacenters].filter(Boolean).join(' • ');

  return (
    <div className="space-y-3">
      {/* Top Row: Network Resources & Geographic Scope */}
      <div className="grid grid-cols-2 gap-3">
        {/* Network Resources */}
        <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-fw-secondary">
          <Router className="h-4 w-4 text-fw-link mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-medium text-fw-heading block mb-0.5">Network Resources</span>
            <p className="text-sm font-semibold text-fw-link truncate" title={networkSummary}>
              {networkSummary}
            </p>
          </div>
        </div>

        {/* Geographic Scope */}
        <div className="flex items-start space-x-3 p-3 bg-fw-wash rounded-lg border border-fw-secondary">
          <Globe className="h-4 w-4 text-fw-body mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-medium text-fw-body block mb-0.5">Geographic Scope</span>
            <p className="text-sm font-semibold text-fw-heading truncate" title={geographicTooltip}>
              {geographicSummary}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Row: Monthly Cost */}
      <div>
        {/* Monthly Cost */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-fw-secondary">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-fw-body flex-shrink-0" />
            <span className="text-xs font-medium text-fw-heading">Monthly Cost</span>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-semibold text-fw-heading">
              {billingInfo.cost ? formatCurrency(billingInfo.cost) : '-'}
            </p>
            <span className={`text-xs font-medium ${billingInfo.textColor}`}>
              {billingInfo.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
