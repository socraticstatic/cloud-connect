import { Activity, TrendingUp, Signal, Clock, ArrowUpDown, RefreshCw, Network } from 'lucide-react';
import { Group } from '../../../../types/group';
import { Connection } from '../../../../types';
import { Button } from '../../../common/Button';

interface GroupPerformanceProps {
  group: Group;
  connections: Connection[];
}

export function GroupPerformance({ group, connections }: GroupPerformanceProps) {
  if (!group.performance) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data</h3>
          <p className="text-gray-500">This group doesn't have any performance data yet.</p>
          <div className="mt-4">
            <Button
              variant="primary"
              onClick={() => {
                window.addToast({
                  type: 'info',
                  title: 'Refreshing Performance',
                  message: 'Performance data will be updated shortly.',
                  duration: 3000
                });
              }}
            >
              Refresh Performance Data
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Sample billing trend data for the group
  const billingTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Billing',
      data: [2700, 2850, 2750, 2900, 3100, 2950],
      borderColor: '#10b981',
      fill: false
    }]
  };

  return (
    <div className="p-6 space-y-6">
      {/* Connection Status Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Activity className="h-5 w-5 text-brand-blue mr-2" />
            Connection Status
          </h3>
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={() => {
              window.addToast({
                type: 'success',
                title: 'Refreshed',
                message: 'Status data has been refreshed',
                duration: 3000
              });
            }}
          >
            Refresh Data
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Active Connections</h4>
              <Network className="h-5 w-5 text-blue-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-semibold text-gray-900">
                {connections.filter(c => c.status === 'Active').length}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                of {connections.length} total
              </span>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Success Rate</h4>
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-semibold text-gray-900">
                {((connections.filter(c => c.status === 'Active').length / Math.max(1, connections.length)) * 100).toFixed(0)}%
              </span>
              <span className="text-sm text-gray-500 ml-2">
                connection rate
              </span>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Last Updated</h4>
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-semibold text-gray-900">
                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                today
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Connection Status Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Connection Status</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Connection
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {connections.length > 0 ? (
                connections.map((conn) => (
                  <tr key={conn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{conn.name}</div>
                      <div className="text-sm text-gray-500">{conn.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        conn.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {conn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-sm text-center text-gray-500">
                    No connections in this group
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Support Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Support Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600">
                Our support team is available 24/7 to assist with any connection issues or questions you might have about your group connections.
              </p>
              <Button 
                variant="outline"
                className="mt-3"
                onClick={() => {
                  window.addToast({
                    type: 'info',
                    title: 'Support',
                    message: 'Contacting support...',
                    duration: 3000
                  });
                }}
              >
                Contact Support
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Documentation</h4>
              <p className="text-sm text-gray-600">
                Find detailed information about connection statuses, troubleshooting guides, and best practices in our documentation portal.
              </p>
              <Button 
                variant="outline"
                className="mt-3"
                onClick={() => {
                  window.addToast({
                    type: 'info',
                    title: 'Documentation',
                    message: 'Opening documentation portal...',
                    duration: 3000
                  });
                }}
              >
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}