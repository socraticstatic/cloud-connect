import { Activity, TrendingUp, ArrowUpDown } from 'lucide-react';
import { Connection } from '../../../../../types';
import { LineChart } from '../../../../monitoring/charts/LineChart';

interface MetricsExplorerWidgetProps {
  connections: Connection[];
}

export function MetricsExplorerWidget({ connections }: MetricsExplorerWidgetProps) {
  const metrics = {
    latency: {
      current: 4.2,
      trend: [4.0, 4.1, 4.3, 4.2, 4.1, 4.2],
      unit: 'ms'
    },
    bandwidth: {
      current: 85,
      trend: [80, 82, 85, 83, 84, 85],
      unit: '%'
    },
    packetLoss: {
      current: 0.01,
      trend: [0.01, 0.02, 0.01, 0.01, 0.01, 0.01],
      unit: '%'
    }
  };

  const chartData = {
    labels: ['5m ago', '4m ago', '3m ago', '2m ago', '1m ago', 'now'],
    datasets: [
      {
        label: 'Latency',
        data: metrics.latency.trend,
        borderColor: '#3b82f6',
        fill: false
      },
      {
        label: 'Bandwidth',
        data: metrics.bandwidth.trend,
        borderColor: '#10b981',
        fill: false
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-blue-600">Latency</span>
          </div>
          <div className="text-xl font-semibold text-blue-900">
            {metrics.latency.current}ms
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-xs text-green-600">Bandwidth</span>
          </div>
          <div className="text-xl font-semibold text-green-900">
            {metrics.bandwidth.current}%
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <ArrowUpDown className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-purple-600">Packet Loss</span>
          </div>
          <div className="text-xl font-semibold text-purple-900">
            {metrics.packetLoss.current}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-900">Trends</span>
          <select className="text-sm border-gray-300 rounded-md">
            <option>Last 5 Minutes</option>
            <option>Last Hour</option>
            <option>Last Day</option>
          </select>
        </div>
        <div className="h-48">
          <LineChart data={chartData} />
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-900 mb-1">Peak Usage</div>
          <div className="text-sm text-gray-500">85% at 14:30</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-900 mb-1">Avg Response</div>
          <div className="text-sm text-gray-500">4.2ms today</div>
        </div>
      </div>
    </div>
  );
}