import { Activity, Network, Globe } from 'lucide-react';
import { Connection } from '../../../../../types';
import { LineChart } from '../../../../monitoring/charts/LineChart';

interface NetworkStatusWidgetProps {
  connections: Connection[];
}

export function NetworkStatusWidget({ connections }: NetworkStatusWidgetProps) {
  const activeConnections = connections.filter(c => c.status === 'Active');
  const avgLatency = activeConnections.reduce((sum, conn) => {
    const latency = parseFloat(conn.performance?.latency || '0');
    return sum + latency;
  }, 0) / activeConnections.length || 0;

  const performanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Network Performance',
      data: [98, 99, 97, 99],
      borderColor: '#3b82f6',
      fill: false
    }]
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-blue-600">Active</span>
          </div>
          <div className="text-xl font-semibold text-blue-900">
            {activeConnections.length}
          </div>
          <div className="text-xs text-blue-600">Connections</div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <Network className="h-4 w-4 text-green-500" />
            <span className="text-xs text-green-600">Avg</span>
          </div>
          <div className="text-xl font-semibold text-green-900">
            {avgLatency.toFixed(1)}ms
          </div>
          <div className="text-xs text-green-600">Latency</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <Globe className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-purple-600">Total</span>
          </div>
          <div className="text-xl font-semibold text-purple-900">
            {connections.length}
          </div>
          <div className="text-xs text-purple-600">Networks</div>
        </div>
      </div>

      <div className="h-32">
        <LineChart data={performanceData} />
      </div>
    </div>
  );
}