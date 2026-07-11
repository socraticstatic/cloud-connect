import { Activity, TrendingUp, ArrowUpDown } from 'lucide-react';
import { Connection } from '../../../../../types';
import { LineChart } from '../../../../monitoring/charts/LineChart';

interface PerformanceWidgetProps {
  connections: Connection[];
}

export function PerformanceWidget({ connections }: PerformanceWidgetProps) {
  const activeConnections = connections.filter(c => c.status === 'Active');
  
  const avgLatency = activeConnections.reduce((sum, conn) => {
    const latency = parseFloat(conn.performance?.latency || '0');
    return sum + latency;
  }, 0) / activeConnections.length || 0;

  const avgBandwidth = activeConnections.reduce((sum, conn) => {
    const utilization = conn.performance?.bandwidthUtilization || 0;
    return sum + utilization;
  }, 0) / activeConnections.length || 0;

  const performanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Average Latency (ms)',
      data: [4.2, 4.5, 4.1, 4.3],
      borderColor: '#3b82f6',
      fill: false
    }]
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-blue-600">Avg Latency</span>
          </div>
          <div className="text-xl font-semibold text-blue-900">
            {avgLatency.toFixed(1)}ms
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-xs text-green-600">Bandwidth</span>
          </div>
          <div className="text-xl font-semibold text-green-900">
            {avgBandwidth.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="h-32">
        <LineChart data={performanceData} />
      </div>

      <div className="space-y-2">
        {activeConnections.slice(0, 2).map((connection) => (
          <div key={connection.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <ArrowUpDown className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-700">{connection.name}</span>
            </div>
            <span className="text-sm text-gray-900">{connection.performance?.latency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}