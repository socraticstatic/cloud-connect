import { AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react';

export function AlertHistoryWidget() {
  const alerts = [
    {
      id: '1',
      type: 'error',
      message: 'High latency detected on AWS Direct Connect',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      status: 'active'
    },
    {
      id: '2',
      type: 'warning',
      message: 'Bandwidth utilization above 80%',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      status: 'resolved'
    },
    {
      id: '3',
      type: 'info',
      message: 'Automatic failover completed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'resolved'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
          <span className="text-sm font-medium text-gray-900">Alert History</span>
        </div>
        <button className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-2 rounded-lg ${
              alert.type === 'error' ? 'bg-red-50' :
              alert.type === 'warning' ? 'bg-yellow-50' :
              'bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                {alert.status === 'active' ? (
                  <AlertTriangle className={`h-4 w-4 mr-2 ${
                    alert.type === 'error' ? 'text-red-500' :
                    alert.type === 'warning' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                )}
                <span className={`text-sm ${
                  alert.type === 'error' ? 'text-red-700' :
                  alert.type === 'warning' ? 'text-yellow-700' :
                  'text-blue-700'
                }`}>
                  {alert.message}
                </span>
              </div>
            </div>
            <div className="flex items-center text-xs text-gray-500 ml-6">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(alert.timestamp).toLocaleString()}
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