import { AlertTriangle, Shield, Clock } from 'lucide-react';
import { Connection } from '../../../../../types';

interface SecurityAlertsWidgetProps {
  connections: Connection[];
}

export function SecurityAlertsWidget({ connections }: SecurityAlertsWidgetProps) {
  const alerts = [
    {
      id: '1',
      severity: 'high',
      message: 'Unusual traffic pattern detected',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      connection: 'AWS Direct Connect'
    },
    {
      id: '2',
      severity: 'medium',
      message: 'Multiple failed authentication attempts',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      connection: 'Azure ExpressRoute'
    },
    {
      id: '3',
      severity: 'low',
      message: 'SSL certificate expiring soon',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      connection: 'Google Cloud Interconnect'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-sm font-medium text-gray-900">Active Alerts</span>
        </div>
        <span className="text-sm text-gray-500">{alerts.length} alerts</span>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg ${
              alert.severity === 'high' ? 'bg-red-50' :
              alert.severity === 'medium' ? 'bg-yellow-50' :
              'bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <AlertTriangle className={`h-4 w-4 mr-2 ${
                  alert.severity === 'high' ? 'text-red-500' :
                  alert.severity === 'medium' ? 'text-yellow-500' :
                  'text-blue-500'
                }`} />
                <span className={`text-sm font-medium ${
                  alert.severity === 'high' ? 'text-red-700' :
                  alert.severity === 'medium' ? 'text-yellow-700' :
                  'text-blue-700'
                }`}>
                  {alert.message}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className={`${
                alert.severity === 'high' ? 'text-red-600' :
                alert.severity === 'medium' ? 'text-yellow-600' :
                'text-blue-600'
              }`}>
                {alert.connection}
              </span>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span className="text-gray-500">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
        View All Alerts
      </button>
    </div>
  );
}