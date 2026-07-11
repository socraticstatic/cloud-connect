import { useState } from 'react';
import { Terminal, Search, Filter, Download, RefreshCw } from 'lucide-react';

export function LogStreamWidget() {
  const [filter, setFilter] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const logs = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      level: 'info',
      service: 'connection-manager',
      message: 'Connection status updated successfully'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 30000).toISOString(),
      level: 'warning',
      service: 'security',
      message: 'High latency detected on AWS Direct Connect'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      level: 'error',
      service: 'monitoring',
      message: 'Failed to collect metrics from endpoint'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 90000).toISOString(),
      level: 'info',
      service: 'auth',
      message: 'User session authenticated'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter logs..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <Filter className="h-4 w-4" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <Download className="h-4 w-4" />
        </button>
        <button 
          className={`p-2 rounded-lg transition-colors ${
            autoRefresh 
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setAutoRefresh(!autoRefresh)}
        >
          <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Log Stream */}
      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`p-2 rounded-lg font-mono text-xs ${
              log.level === 'error' ? 'bg-red-50 text-red-700' :
              log.level === 'warning' ? 'bg-yellow-50 text-yellow-700' :
              'bg-gray-50 text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                log.level === 'error' ? 'bg-red-100 text-red-800' :
                log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {log.level.toUpperCase()}
              </span>
              <span className="font-medium">{log.service}</span>
            </div>
            <div className="mt-1">{log.message}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button className="text-sm text-blue-600 hover:text-blue-700">
          Load More Logs
        </button>
      </div>
    </div>
  );
}