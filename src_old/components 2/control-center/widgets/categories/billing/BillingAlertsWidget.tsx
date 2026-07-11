import { AlertTriangle, Bell, Settings } from 'lucide-react';
import { Connection } from '../../../../../types';
import { formatCurrency } from '../../../../../utils/connections';

interface BillingAlertsWidgetProps {
  connections: Connection[];
}

export function BillingAlertsWidget({ connections }: BillingAlertsWidgetProps) {
  const alerts = [
    {
      id: '1',
      type: 'warning',
      message: 'Approaching monthly budget limit',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      type: 'info',
      message: 'Usage increased by 20% this week',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      type: 'success',
      message: 'Cost optimization savings applied',
      timestamp: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Bell className="h-5 w-5 text-orange-500 mr-2" />
          <span className="text-sm font-medium text-gray-900">Billing Alerts</span>
        </div>
        <button className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <Settings className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-2 rounded-lg ${
              alert.type === 'warning' ? 'bg-yellow-50' :
              alert.type === 'info' ? 'bg-blue-50' :
              'bg-green-50'
            }`}
          >
            <div className="flex items-start">
              <AlertTriangle className={`h-4 w-4 mt-0.5 mr-2 ${
                alert.type === 'warning' ? 'text-yellow-500' :
                alert.type === 'info' ? 'text-blue-500' :
                'text-green-500'
              }`} />
              <div>
                <p className={`text-sm ${
                  alert.type === 'warning' ? 'text-yellow-700' :
                  alert.type === 'info' ? 'text-blue-700' :
                  'text-green-700'
                }`}>
                  {alert.message}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
        Configure Alerts
      </button>
    </div>
  );
}