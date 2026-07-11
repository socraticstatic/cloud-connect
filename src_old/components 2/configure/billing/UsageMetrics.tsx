import { useState } from 'react';
import { Activity, Network, History } from 'lucide-react';
import { LineChart } from '../../monitoring/charts/LineChart';

export function UsageMetrics() {
  const [timeRange, setTimeRange] = useState('30d');

  const bandwidthData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Usage (GB)',
        data: [1250, 850, 2100],
        borderColor: '#3b82f6',
        fill: false,
      }
    ]
  };

  const connectionsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Provisioned Hours',
        data: [672, 672, 672],
        borderColor: '#10b981',
        fill: false,
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Usage Metrics</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="form-control"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Data Transfer</h4>
            <Activity className="h-5 w-5 text-blue-500" />
          </div>
          <LineChart data={bandwidthData} />
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Provisioned Hours</h4>
            <Network className="h-5 w-5 text-green-500" />
          </div>
          <LineChart data={connectionsData} />
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900">Usage Summary</h4>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-500">Total Data Transferred</div>
              <div className="mt-1">
                <div className="text-2xl font-semibold text-gray-900">4,200 GB</div>
                <div className="text-sm text-green-600">Across all connections</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Average Monthly Usage</div>
              <div className="mt-1">
                <div className="text-2xl font-semibold text-gray-900">1,400 GB</div>
                <div className="text-sm text-green-600">Per connection</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Hours</div>
              <div className="mt-1">
                <div className="text-2xl font-semibold text-gray-900">2,016</div>
                <div className="text-sm text-gray-600">Provisioned this month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}