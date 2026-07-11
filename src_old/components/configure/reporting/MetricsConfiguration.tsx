import { useState } from 'react';
import { BarChart2, Plus, Settings, Trash2 } from 'lucide-react';
import { Button } from '../../common/Button';

interface Metric {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'security' | 'usage';
  enabled: boolean;
  threshold?: number;
  unit?: string;
}

export function MetricsConfiguration() {
  const [metrics] = useState<Metric[]>([
    {
      id: '1',
      name: 'Connection Latency',
      description: 'Average network latency across all connections',
      type: 'performance',
      enabled: true,
      threshold: 10,
      unit: 'ms'
    },
    {
      id: '2',
      name: 'Bandwidth Utilization',
      description: 'Total bandwidth usage across all connections',
      type: 'usage',
      enabled: true,
      threshold: 80,
      unit: '%'
    },
    {
      id: '3',
      name: 'Security Events',
      description: 'Number of security-related events and alerts',
      type: 'security',
      enabled: true,
      threshold: 100,
      unit: 'events'
    }
  ]);

  const getTypeColor = (type: Metric['type']) => {
    switch (type) {
      case 'performance':
        return 'bg-brand-lightBlue text-brand-blue';
      case 'security':
        return 'bg-indigo-100 text-indigo-800';
      case 'usage':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Metrics Configuration</h3>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            window.addToast({
              type: 'info',
              title: 'Add Metric',
              message: 'Metric creation coming soon',
              duration: 3000
            });
          }}
        >
          Add Metric
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <BarChart2 className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-medium text-gray-900">{metric.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(metric.type)}`}>
                      {metric.type.charAt(0).toUpperCase() + metric.type.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{metric.description}</p>
                  {metric.threshold && (
                    <div className="mt-4 flex items-center space-x-4">
                      <div>
                        <div className="text-sm text-gray-500">Threshold</div>
                        <div className="text-sm font-medium text-gray-900">
                          {metric.threshold} {metric.unit}
                        </div>
                      </div>
                      <div className="h-10 border-l border-gray-200" />
                      <div>
                        <div className="text-sm text-gray-500">Status</div>
                        <div className="text-sm font-medium text-green-600">Active</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-brand-blue hover:bg-brand-lightBlue rounded-full">
                  <Settings className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}