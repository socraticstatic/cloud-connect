import { Network, Activity } from 'lucide-react';
import { Connection } from '../../../../../types';

interface ConnectionsWidgetProps {
  connections: Connection[];
}

export function ConnectionsWidget({ connections }: ConnectionsWidgetProps) {
  const activeConnections = connections.filter(c => c.status === 'Active');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Active Connections</span>
        <span className="text-sm font-medium text-gray-900">{activeConnections.length}/{connections.length}</span>
      </div>

      <div className="space-y-2">
        {activeConnections.slice(0, 3).map((connection) => (
          <div key={connection.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Network className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">{connection.name}</div>
                <div className="text-xs text-gray-500">{connection.type}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600">{connection.performance?.latency}</span>
            </div>
          </div>
        ))}
      </div>

      {activeConnections.length > 3 && (
        <div className="text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700">
            View {activeConnections.length - 3} more
          </button>
        </div>
      )}
    </div>
  );
}