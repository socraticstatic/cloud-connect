import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Connection } from '../../../../../types';
import { formatCurrency } from '../../../../../utils/connections';
import { LineChart } from '../../../../monitoring/charts/LineChart';

interface CostAnalyticsWidgetProps {
  connections: Connection[];
}

export function CostAnalyticsWidget({ connections }: CostAnalyticsWidgetProps) {
  const costData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Total Cost',
        data: [12500, 13200, 14100, 13800, 14500, 15200],
        borderColor: '#10b981',
        fill: false
      },
      {
        label: 'Projected Cost',
        data: [15200, 15800, 16400, 17000, 17600, 18200],
        borderColor: '#6366f1',
        borderDash: [5, 5],
        fill: false
      }
    ]
  };

  const costByProvider = {
    AWS: 45,
    Azure: 35,
    'Google Cloud': 20
  };

  const costByType = {
    'Direct Connect': 40,
    'ExpressRoute': 30,
    'Cloud Interconnect': 20,
    'Internet Direct': 10
  };

  return (
    <div className="space-y-6">
      {/* Cost Trends */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Cost Trends</h3>
          <select className="text-sm border-gray-300 rounded-md">
            <option>Last 6 Months</option>
            <option>Last 12 Months</option>
            <option>Year to Date</option>
          </select>
        </div>
        <div className="h-48">
          <LineChart data={costData} />
        </div>
      </div>

      {/* Cost Distribution */}
      <div className="grid grid-cols-2 gap-6">
        {/* By Provider */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Cost by Provider</h4>
          <div className="space-y-3">
            {Object.entries(costByProvider).map(([provider, percentage]) => (
              <div key={provider}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{provider}</span>
                  <span className="font-medium text-gray-900">{percentage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Type */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Cost by Type</h4>
          <div className="space-y-3">
            {Object.entries(costByType).map(([type, percentage]) => (
              <div key={type}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{type}</span>
                  <span className="font-medium text-gray-900">{percentage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost Insights */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center text-green-600 mb-1">
            <ArrowDownRight className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Cost Optimization</span>
          </div>
          <p className="text-sm text-green-700">
            Potential savings of {formatCurrency(1234)} identified
          </p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center text-blue-600 mb-1">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Usage Forecast</span>
          </div>
          <p className="text-sm text-blue-700">
            15% increase expected next month
          </p>
        </div>
      </div>
    </div>
  );
}