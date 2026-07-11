import { useState } from 'react';
import { Search, Filter, Download, Clock, Activity, Shield, Terminal, Settings, X } from 'lucide-react';
import { Connection } from '../../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileLogsTabProps {
  selectedConnection: string;
  connections: Connection[];
}

export function MobileLogsTab({ selectedConnection, connections }: MobileLogsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

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
        return <Terminal className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-brand-blue bg-brand-lightBlue';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center py-2 px-4 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50"
        >
          <Search className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Search</span>
        </button>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center py-2 px-4 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50"
        >
          <Filter className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Filter</span>
        </button>
      </div>

      {/* Search Panel */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Log Filters</h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="p-1 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Log Types
                </label>
                <div className="space-y-2">
                  {['system', 'security', 'user', 'performance'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedTypes(prev =>
                        prev.includes(type)
                          ? prev.filter(t => t !== type)
                          : [...prev, type]
                      )}
                      className={`
                        block w-full text-left px-3 py-2 rounded-md text-sm
                        ${selectedTypes.includes(type)
                          ? 'bg-brand-lightBlue text-brand-blue'
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        {getTypeIcon(type)}
                        <span className="ml-2">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Levels
                </label>
                <div className="space-y-2">
                  {['error', 'warning', 'info'].map((severity) => (
                    <button
                      key={severity}
                      onClick={() => setSelectedSeverities(prev =>
                        prev.includes(severity)
                          ? prev.filter(s => s !== severity)
                          : [...prev, severity]
                      )}
                      className={`
                        block w-full text-left px-3 py-2 rounded-md text-sm
                        ${selectedSeverities.includes(severity)
                          ? getSeverityColor(severity)
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Range
                </label>
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

              <div className="pt-2 flex justify-between">
                <button
                  onClick={() => {
                    setSelectedTypes([]);
                    setSelectedSeverities([]);
                    setTimeRange('24h');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-medium hover:bg-brand-darkBlue"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters */}
      {(selectedTypes.length > 0 || selectedSeverities.length > 0 || searchQuery) && (
        <div className="flex flex-wrap gap-2">
          {selectedTypes.map(type => (
            <span
              key={type}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-lightBlue text-brand-blue"
            >
              {type}
              <button
                onClick={() => setSelectedTypes(prev => prev.filter(t => t !== type))}
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
                getSeverityColor(severity)
              }`}
            >
              {severity}
              <button
                onClick={() => setSelectedSeverities(prev => prev.filter(s => s !== severity))}
                className="ml-1 hover:text-brand-darkBlue"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {searchQuery && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              "{searchQuery}"
              <button
                onClick={() => setSearchQuery('')}
                className="ml-1 hover:text-gray-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Logs List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-200">
        {filteredLogs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p className="text-sm">No logs match the current filters</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  {getTypeIcon(log.type)}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      getSeverityColor(log.severity)
                    }`}>
                      {log.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-900">{log.message}</p>
                  <div className="mt-1 text-xs text-gray-500">
                    <span className="font-medium">Source:</span> {log.source}
                  </div>
                  {log.metadata && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500 font-medium">Details:</div>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        {Object.entries(log.metadata).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="text-gray-500">{key}:</span>{' '}
                            <span className="text-gray-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Export Button */}
      <div className="flex justify-center pt-2 pb-8">
        <button
          onClick={() => {
            window.addToast({
              type: 'success',
              title: 'Logs Exported',
              message: 'Log file has been downloaded successfully',
              duration: 3000
            });
          }}
          className="flex items-center justify-center px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-darkBlue transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          <span className="font-medium">Export Logs</span>
        </button>
      </div>
    </div>
  );
}