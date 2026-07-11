import { useState } from 'react';
import { Search, Filter, Download, X, Activity, Shield, Settings, Globe, Calendar, Clock } from 'lucide-react';

interface LogsContentProps {
  selectedConnection: string;
  connections: any[];
}

function LogsContent({ selectedConnection, connections }: LogsContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [showFilters, setShowFilters] = useState(false);

  // Sample log data
  const logs = [
    {
      id: '1',
      timestamp: '2024-03-11 15:30',
      type: 'system',
      severity: 'info',
      message: 'Connection status updated to Active',
      source: 'Connection Manager',
      user: 'system',
      connectionId: 'conn-1',
      metadata: {
        status: 'Active',
        previousStatus: 'Inactive'
      }
    },
    {
      id: '2',
      timestamp: '2024-03-11 15:25',
      type: 'security',
      severity: 'warning',
      message: 'Multiple failed authentication attempts detected',
      source: 'Security Monitor',
      user: 'system',
      connectionId: 'conn-2',
      metadata: {
        attempts: 3,
        ipAddress: '192.168.1.100'
      }
    },
    {
      id: '3',
      timestamp: '2024-03-11 15:15',
      type: 'user',
      severity: 'info',
      message: 'Modified connection bandwidth settings',
      source: 'User Action',
      user: 'sarah.chen@example.com',
      connectionId: 'conn-1',
      metadata: {
        oldValue: '1 Gbps',
        newValue: '10 Gbps'
      }
    },
    {
      id: '4',
      timestamp: '2024-03-11 15:00',
      type: 'performance',
      severity: 'error',
      message: 'High latency detected on connection',
      source: 'Performance Monitor',
      user: 'system',
      connectionId: 'conn-3',
      metadata: {
        latency: '150ms',
        threshold: '100ms'
      }
    }
  ];

  // Filter logs based on search and filters
  const filteredLogs = logs.filter(log => {
    // Filter by connection
    if (selectedConnection !== 'all' && log.connectionId !== selectedConnection) {
      return false;
    }

    // Filter by type
    if (selectedTypes.length > 0 && !selectedTypes.includes(log.type)) {
      return false;
    }

    // Filter by severity
    if (selectedSeverities.length > 0 && !selectedSeverities.includes(log.severity)) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const searchTerms = searchQuery.toLowerCase().split(' ');
      const searchableText = [
        log.message,
        log.source,
        log.user,
        log.type,
        log.severity
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    }

    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <Settings className="h-4 w-4 text-gray-500" />;
      case 'security':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'user':
        return <Activity className="h-4 w-4 text-brand-blue" />;
      case 'performance':
        return <Activity className="h-4 w-4 text-purple-500" />;
      default:
        return <Globe className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center min-w-[1000px]">
        <div className="flex-1 relative min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          
          <button
            onClick={() => {
              // Export logic here
              window.addToast({
                type: 'success',
                title: 'Logs Exported',
                message: 'Log data has been exported successfully',
                duration: 3000
              });
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200 overflow-x-auto">
          <div className="min-w-[1000px]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Log Types</h3>
              <div className="space-y-2">
                {['system', 'security', 'user', 'performance'].map(type => (
                  <label key={type} className="flex items-center">
                    <input 
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => {
                        if (selectedTypes.includes(type)) {
                          setSelectedTypes(selectedTypes.filter(t => t !== type));
                        } else {
                          setSelectedTypes([...selectedTypes, type]);
                        }
                      }}
                      className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                    />
                    <span className="ml-2 text-sm text-gray-600 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Severity</h3>
              <div className="space-y-2">
                {['info', 'warning', 'error'].map(severity => (
                  <label key={severity} className="flex items-center">
                    <input 
                      type="checkbox"
                      checked={selectedSeverities.includes(severity)}
                      onChange={() => {
                        if (selectedSeverities.includes(severity)) {
                          setSelectedSeverities(selectedSeverities.filter(s => s !== severity));
                        } else {
                          setSelectedSeverities([...selectedSeverities, severity]);
                        }
                      }}
                      className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                    />
                    <span className="ml-2 text-sm text-gray-600 capitalize">{severity}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Time Range</h3>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedTypes([]);
                    setSelectedSeverities([]);
                    setTimeRange('24h');
                  }}
                  className="w-full py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => {
                    // Apply custom filter preset
                  }}
                  className="w-full py-2 text-sm text-brand-blue hover:text-brand-darkBlue"
                >
                  Save as Preset
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
      
      {/* Active Filters */}
      {(selectedTypes.length > 0 || selectedSeverities.length > 0 || searchQuery) && (
        <div className="p-3 border-b border-gray-200 bg-gray-50 overflow-x-auto">
          <div className="flex flex-wrap gap-2 min-w-[1000px]">
          {selectedTypes.map(type => (
            <span
              key={type}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-lightBlue text-brand-blue"
            >
              Type: {type}
              <button
                onClick={() => setSelectedTypes(selectedTypes.filter(t => t !== type))}
                className="ml-1 hover:text-brand-darkBlue"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {selectedSeverities.map(severity => (
            <span
              key={severity}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                severity === 'error' ? 'bg-red-100 text-red-800' :
                severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              Severity: {severity}
              <button
                onClick={() => setSelectedSeverities(selectedSeverities.filter(s => s !== severity))}
                className="ml-1 hover:opacity-75"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {searchQuery && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              Search: "{searchQuery}"
              <button
                onClick={() => setSearchQuery('')}
                className="ml-1 hover:text-gray-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setSelectedTypes([]);
              setSelectedSeverities([]);
              setSearchQuery('');
            }}
            className="text-xs text-gray-500 hover:text-gray-700 ml-2"
          >
            Clear all
          </button>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 min-w-[1000px]">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No logs match the current filters
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTypeIcon(log.type)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">{log.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getSeverityColor(log.severity)
                    }`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{log.message}</div>
                    {log.metadata && (
                      <div className="mt-1 text-xs text-gray-500">
                        {Object.entries(log.metadata).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.user}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LogsContent;