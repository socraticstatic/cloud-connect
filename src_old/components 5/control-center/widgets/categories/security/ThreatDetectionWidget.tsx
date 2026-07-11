import { Activity, Shield, AlertTriangle } from 'lucide-react';
import { Connection } from '../../../../../types';
import { LineChart } from '../../../../monitoring/charts/LineChart';

interface ThreatDetectionWidgetProps {
  connections: Connection[];
}

export function ThreatDetectionWidget({ connections }: ThreatDetectionWidgetProps) {
  const threatData = {
    labels: ['5m ago', '4m ago', '3m ago', '2m ago', '1m ago', 'now'],
    datasets: [
      {
        label: 'Threat Level',
        data: [2, 3, 4, 2, 1, 2],
        borderColor: '#ef4444',
        fill: false
      }
    ]
  };

  const activeThreats = [
    {
      id: '1',
      type: 'DDoS',
      severity: 'high',
      target: 'AWS Direct Connect',
      status: 'mitigating'
    },
    {
      id: '2',
      type: 'Brute Force',
      severity: 'medium',
      target: 'Azure ExpressRoute',
      status: 'monitoring'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Threat Level Chart */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Threat Level</h3>
          <select className="text-sm border-gray-300 rounded-md">
            <option>Last Hour</option>
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
          </select>
        </div>
        <div className="h-32">
          <LineChart data={threatData} />
        </div>
      </div>

      {/* Active Threats */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Active Threats</h4>
        <div className="space-y-3">
          {activeThreats.map((threat) => (
            <div key={threat.id} className="p-3 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm font-medium text-red-700">{threat.type} Attack</span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  threat.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {threat.severity.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-600">{threat.target}</span>
                <span className="text-red-600">{threat.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <Activity className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">24h Threats</span>
          </div>
          <div className="text-xl font-bold text-gray-900">24</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <Shield className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">Blocked</span>
          </div>
          <div className="text-xl font-bold text-gray-900">98%</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <AlertTriangle className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">Risk Level</span>
          </div>
          <div className="text-xl font-bold text-gray-900">Low</div>
        </div>
      </div>
    </div>
  );
}