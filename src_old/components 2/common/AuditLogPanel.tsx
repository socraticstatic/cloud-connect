import { useState, useEffect } from 'react';
import { FileText, Shield, DollarSign, Settings, Eye, Edit, Trash2, Plus, ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { UserIcon } from './UserIcon';
import { Button } from './Button';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  resource: string;
  resourceType: 'connection' | 'user' | 'billing' | 'system' | 'security';
  details: string;
  ipAddress: string;
  status: 'success' | 'denied' | 'warning';
}

interface AuditLogPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filterByResource?: string;
  filterByUser?: string;
}

export function AuditLogPanel({ isOpen, onClose, filterByResource, filterByUser }: AuditLogPanelProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Mock audit log data
  useEffect(() => {
    const mockLogs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5000),
        user: 'john.doe@company.com',
        action: 'Viewed billing settings',
        resource: 'Billing Configuration',
        resourceType: 'billing',
        details: 'Accessed payment methods section',
        ipAddress: '192.168.1.100',
        status: 'success'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 15000),
        user: 'jane.smith@company.com',
        action: 'Modified user role',
        resource: 'User: alex.jones@company.com',
        resourceType: 'user',
        details: 'Changed role from User to Admin',
        ipAddress: '192.168.1.101',
        status: 'success'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 30000),
        user: 'alice.williams@company.com',
        action: 'Attempted to access system settings',
        resource: 'System Configuration',
        resourceType: 'system',
        details: 'Access denied - insufficient permissions',
        ipAddress: '192.168.1.102',
        status: 'denied'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 60000),
        user: 'bob.brown@company.com',
        action: 'Created connection',
        resource: 'Connection: AWS-US-EAST-1',
        resourceType: 'connection',
        details: 'New connection provisioned with 10Gbps bandwidth',
        ipAddress: '192.168.1.103',
        status: 'success'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 120000),
        user: 'admin@company.com',
        action: 'Modified security policy',
        resource: 'Security Settings',
        resourceType: 'security',
        details: 'Updated password policy: minimum length set to 14 characters',
        ipAddress: '192.168.1.1',
        status: 'warning'
      }
    ];

    setLogs(mockLogs);
  }, []);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return <Shield className="h-4 w-4" />;
      case 'user':
        return <UserIcon size="sm" />;
      case 'billing':
        return <DollarSign className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'denied':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterType !== 'all' && log.resourceType !== filterType) return false;
    if (filterByResource && !log.resource.toLowerCase().includes(filterByResource.toLowerCase())) return false;
    if (filterByUser && log.user !== filterByUser) return false;
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Audit Log</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Filter */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by type:</span>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Activities</option>
          <option value="connection">Connections</option>
          <option value="user">Users</option>
          <option value="billing">Billing</option>
          <option value="system">System</option>
          <option value="security">Security</option>
        </select>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No audit logs found</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`border rounded-lg p-3 transition-all ${
                  expandedLog === log.id ? 'shadow-md' : 'shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      log.resourceType === 'billing' ? 'bg-orange-100 text-orange-600' :
                      log.resourceType === 'security' ? 'bg-red-100 text-red-600' :
                      log.resourceType === 'system' ? 'bg-purple-100 text-purple-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {getResourceIcon(log.resourceType)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{log.action}</p>
                      <p className="text-xs text-gray-500">
                        {log.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(log.status)}`}>
                    {log.status}
                  </span>
                </div>

                <div className="text-xs text-gray-700 mb-2">
                  <span className="font-medium">{log.user}</span>
                  <span className="text-gray-500"> → </span>
                  <span>{log.resource}</span>
                </div>

                <button
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  {expandedLog === log.id ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      Hide details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      Show details
                    </>
                  )}
                </button>

                {expandedLog === log.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Details:</p>
                      <p className="text-xs text-gray-700">{log.details}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">IP Address:</p>
                      <p className="text-xs text-gray-700 font-mono">{log.ipAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Timestamp:</p>
                      <p className="text-xs text-gray-700">
                        {log.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <Button variant="outline" onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </div>
  );
}

interface MiniAuditLogProps {
  resourceName: string;
  resourceType: string;
  limit?: number;
}

export function MiniAuditLog({ resourceName, resourceType, limit = 3 }: MiniAuditLogProps) {
  const recentActions = [
    { user: 'john.doe', action: 'viewed', time: '2 min ago', icon: Eye },
    { user: 'jane.smith', action: 'modified', time: '1 hour ago', icon: Edit },
    { user: 'admin', action: 'created', time: '2 days ago', icon: Plus }
  ].slice(0, limit);

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
        <FileText className="h-3 w-3" />
        Recent Activity
      </h4>
      <div className="space-y-2">
        {recentActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              <Icon className="h-3 w-3 text-gray-500" />
              <span className="text-gray-700">
                <span className="font-medium">{action.user}</span> {action.action}
              </span>
              <span className="text-gray-500 ml-auto">{action.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
