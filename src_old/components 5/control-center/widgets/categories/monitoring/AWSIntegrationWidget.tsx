import { Cloud, ArrowRight, CheckCircle2, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../common/Button';

interface AWSConnection {
  id: string;
  requestId: string;
  connectionName: string;
  region: string;
  bandwidth: string;
  status: 'pending-config' | 'in-progress' | 'completed';
  timestamp: string;
}

export default function AWSIntegrationWidget() {
  const navigate = useNavigate();

  const connections: AWSConnection[] = [
    {
      id: 'aws-001',
      requestId: 'AWS-REQ-789012',
      connectionName: 'att-lmcc-prod-001',
      region: 'us-east-1',
      bandwidth: '10 Gbps',
      status: 'pending-config',
      timestamp: new Date().toISOString()
    }
  ];

  const stats = {
    pending: connections.filter(c => c.status === 'pending-config').length,
    inProgress: connections.filter(c => c.status === 'in-progress').length,
    completed: connections.filter(c => c.status === 'completed').length,
    total: connections.length
  };

  const handleViewAll = () => {
    navigate('/marketplace', { state: { activeTab: 'aws' } });
  };

  const handleConfigure = (connection: AWSConnection) => {
    window.addToast?.({
      type: 'info',
      title: 'AWS Connection',
      message: `Opening configuration for ${connection.connectionName}`,
      duration: 3000
    });
  };

  const getStatusIcon = (status: AWSConnection['status']) => {
    switch (status) {
      case 'pending-config':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    }
  };

  const getStatusLabel = (status: AWSConnection['status']) => {
    switch (status) {
      case 'pending-config':
        return 'Awaiting Configuration';
      case 'in-progress':
        return 'Provisioning';
      case 'completed':
        return 'Active';
    }
  };

  const getStatusColor = (status: AWSConnection['status']) => {
    switch (status) {
      case 'pending-config':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Cloud className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">AWS Integration</h3>
            <p className="text-xs text-gray-600">Partner connection status</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
          <div className="text-xs text-amber-700 font-medium">Pending</div>
          <div className="text-lg font-bold text-amber-900">{stats.pending}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <div className="text-xs text-blue-700 font-medium">In Progress</div>
          <div className="text-lg font-bold text-blue-900">{stats.inProgress}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
          <div className="text-xs text-green-700 font-medium">Completed</div>
          <div className="text-lg font-bold text-green-900">{stats.completed}</div>
        </div>
      </div>

      {/* Connections List */}
      <div className="flex-1 overflow-auto space-y-2">
        {connections.length > 0 ? (
          connections.slice(0, 3).map((connection) => (
            <div
              key={connection.id}
              className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0">
                    <Cloud className="w-4 h-4 text-orange-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {connection.connectionName}
                  </h4>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-xs font-semibold whitespace-nowrap flex-shrink-0 ${getStatusColor(connection.status)}`}>
                  {getStatusIcon(connection.status)}
                  <span>{getStatusLabel(connection.status)}</span>
                </div>
              </div>
              <div className="text-xs text-gray-600 space-y-1 mb-2 pl-10">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 font-medium min-w-[70px]">Region:</span>
                  <span className="font-mono text-gray-900">{connection.region}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 font-medium min-w-[70px]">Bandwidth:</span>
                  <span className="font-semibold text-gray-900">{connection.bandwidth}</span>
                </div>
              </div>
              {connection.status === 'pending-config' && (
                <button
                  onClick={() => handleConfigure(connection)}
                  className="w-full mt-2 px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                >
                  Configure Now
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mb-3">
              <Cloud className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-2">No AWS connections</p>
            <p className="text-xs text-gray-500 mb-3">
              Connect via AWS Direct Connect to get started
            </p>
            <a
              href="https://console.aws.amazon.com/directconnect"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-xs font-medium"
            >
              Open AWS Console
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      {connections.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={handleViewAll}
            className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1"
          >
            View All AWS Connections
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
