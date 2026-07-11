import { useState } from 'react';
import { History, Calendar, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface HistoricalAlert {
  id: string;
  timestamp: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  connection: string;
  metric?: string;
  value?: string;
  threshold?: string;
  status: 'active' | 'resolved' | 'dismissed';
  resolvedAt?: string;
  resolvedBy?: string;
}

interface AlertHistoryProps {
  selectedConnection: string;
}

export function AlertHistory({ selectedConnection }: AlertHistoryProps) {
  const [timeRange, setTimeRange] = useState('24h');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const alertHistory: HistoricalAlert[] = [
    {
      id: '1',
      timestamp: '2024-03-11 15:30:22',
      type: 'critical',
      title: 'High Latency Detected',
      message: 'Network latency exceeded threshold',
      connection: 'AWS US-East',
      metric: 'Latency',
      value: '150ms',
      threshold: '100ms',
      status: 'resolved',
      resolvedAt: '2024-03-11 15:45:00',
      resolvedBy: 'Auto-resolved'
    },
    {
      id: '2',
      timestamp: '2024-03-11 14:15:10',
      type: 'warning',
      title: 'Bandwidth Utilization High',
      message: 'Bandwidth utilization at 85%',
      connection: 'Azure West',
      metric: 'Bandwidth',
      value: '85%',
      threshold: '80%',
      status: 'resolved',
      resolvedAt: '2024-03-11 14:30:00',
      resolvedBy: 'sarah.chen@example.com'
    },
    {
      id: '3',
      timestamp: '2024-03-11 13:20:45',
      type: 'info',
      title: 'Connection Status Change',
      message: 'Connection transitioned to Active state',
      connection: 'GCP Europe',
      status: 'dismissed',
      resolvedAt: '2024-03-11 13:25:00'
    },
    {
      id: '4',
      timestamp: '2024-03-11 12:10:30',
      type: 'critical',
      title: 'Packet Loss Detected',
      message: 'Packet loss rate exceeded acceptable threshold',
      connection: 'AWS US-West',
      metric: 'Packet Loss',
      value: '3.5%',
      threshold: '2%',
      status: 'resolved',
      resolvedAt: '2024-03-11 12:40:00',
      resolvedBy: 'Auto-resolved'
    }
  ];

  const getTypeColor = (type: HistoricalAlert['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: HistoricalAlert['status']) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'dismissed':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      case 'active':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const filteredHistory = alertHistory.filter(alert => {
    if (selectedConnection !== 'all' && alert.connection !== selectedConnection) {
      return false;
    }
    return true;
  });

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <History className="h-5 w-5 text-brand-blue mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Alert History</h3>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No alert history found</p>
          </div>
        ) : (
          filteredHistory.map((alert) => (
            <div
              key={alert.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(alert.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(alert.type)}`}>
                      {alert.type.toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{alert.title}</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{alert.message}</p>

                  <div className="flex items-center space-x-6 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {alert.timestamp}
                    </div>
                    <div>Connection: {alert.connection}</div>
                    {alert.metric && <div>Metric: {alert.metric}</div>}
                    {alert.status !== 'active' && (
                      <div className="text-green-600 font-medium">
                        {alert.status === 'resolved' ? 'Resolved' : 'Dismissed'}
                      </div>
                    )}
                  </div>

                  {expandedAlert === alert.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {alert.metric && (
                          <div>
                            <span className="text-gray-500">Metric:</span>
                            <span className="ml-2 text-gray-900 font-medium">{alert.metric}</span>
                          </div>
                        )}
                        {alert.value && (
                          <div>
                            <span className="text-gray-500">Value:</span>
                            <span className="ml-2 text-gray-900 font-medium">{alert.value}</span>
                          </div>
                        )}
                        {alert.threshold && (
                          <div>
                            <span className="text-gray-500">Threshold:</span>
                            <span className="ml-2 text-gray-900 font-medium">{alert.threshold}</span>
                          </div>
                        )}
                        {alert.resolvedAt && (
                          <div>
                            <span className="text-gray-500">Resolved At:</span>
                            <span className="ml-2 text-gray-900">{alert.resolvedAt}</span>
                          </div>
                        )}
                        {alert.resolvedBy && (
                          <div>
                            <span className="text-gray-500">Resolved By:</span>
                            <span className="ml-2 text-gray-900">{alert.resolvedBy}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                  className="ml-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  {expandedAlert === alert.id ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
