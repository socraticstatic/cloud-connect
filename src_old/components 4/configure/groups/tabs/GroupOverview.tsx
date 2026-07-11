import { Users, Network, CreditCard, TrendingUp, AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react';
import { Group } from '../../../../types/group';
import { Connection } from '../../../../types';
import { User } from '../../../../types';

interface GroupOverviewProps {
  group: Group;
  connections: Connection[];
  users: User[];
}

export function GroupOverview({ group, connections, users }: GroupOverviewProps) {
  // Helper function to parse bandwidth string to number (in Gbps)
  const parseBandwidth = (bandwidth: string): number => {
    if (!bandwidth) return 0;
    const match = bandwidth.match(/(\d+(?:\.\d+)?)\s*(Gbps|Mbps)/i);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    return unit === 'mbps' ? value / 1000 : value;
  };

  // Calculate aggregated metrics from connections
  const activeConnections = connections.filter(c => c.status === 'Active').length;
  const totalBandwidth = connections.reduce((sum, c) => sum + parseBandwidth(c.bandwidth), 0);
  const avgUtilization = connections.length > 0
    ? connections.reduce((sum, c) => sum + (c.performance?.bandwidthUtilization || 0), 0) / connections.length
    : 0;

  // Calculate cumulative billing
  const monthlyConnectionCost = connections.reduce((sum, c) => sum + (c.billing?.total || 250), 0);
  const totalMonthlyCost = group.billing?.monthlyRate || monthlyConnectionCost;

  // Performance health calculations
  const healthyConnections = connections.filter(c => c.status === 'Active').length;
  const warningConnections = connections.filter(c => c.status === 'Pending').length;
  const healthScore = connections.length > 0
    ? Math.round((healthyConnections / connections.length) * 100)
    : 100;

  return (
    <div className="p-6 space-y-8">
      {/* Pool Summary Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Pool Summary</h3>
        <p className="text-sm text-gray-600">
          Consolidated view of all resources and performance metrics for this pool
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Members */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Members</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{users.length}</div>
          <p className="text-sm text-blue-700">Active users in pool</p>
        </div>

        {/* Total Connections */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Network className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Connections</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{connections.length}</div>
          <p className="text-sm text-green-700">{activeConnections} active connections</p>
        </div>

        {/* Health Score */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">Health</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{healthScore}%</div>
          <p className="text-sm text-amber-700">Overall pool health</p>
        </div>

        {/* Monthly Cost */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">Cost</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">${totalMonthlyCost.toLocaleString()}</div>
          <p className="text-sm text-purple-700">Monthly billing total</p>
        </div>
      </div>

      {/* Cumulative Performance Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cumulative Performance</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-2">
                <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500">Total Bandwidth</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalBandwidth.toFixed(1)} Gbps</div>
              <p className="text-xs text-gray-500 mt-1">Across {connections.length} connections</p>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <Activity className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500">Avg Utilization</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{avgUtilization.toFixed(1)}%</div>
              <p className="text-xs text-gray-500 mt-1">Pool-wide average</p>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500">Avg Latency</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">4.2ms</div>
              <p className="text-xs text-gray-500 mt-1">Weighted average</p>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <CheckCircle className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500">Uptime</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">99.97%</div>
              <p className="text-xs text-gray-500 mt-1">30-day average</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Health Status */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Health</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{healthyConnections}</div>
                  <div className="text-sm text-gray-500">Healthy</div>
                </div>
              </div>

              {warningConnections > 0 && (
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{warningConnections}</div>
                    <div className="text-sm text-gray-500">Warning</div>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <div className="h-5 w-5 rounded-full bg-gray-300 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{connections.length - healthyConnections - warningConnections}</div>
                  <div className="text-sm text-gray-500">Inactive</div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500">Overall Health Score</div>
              <div className={`text-3xl font-bold ${
                healthScore >= 90 ? 'text-green-600' :
                healthScore >= 70 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {healthScore}%
              </div>
            </div>
          </div>

          {/* Health Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="flex h-full">
              {healthyConnections > 0 && (
                <div
                  className="bg-green-500"
                  style={{ width: `${(healthyConnections / connections.length) * 100}%` }}
                />
              )}
              {warningConnections > 0 && (
                <div
                  className="bg-amber-500"
                  style={{ width: `${(warningConnections / connections.length) * 100}%` }}
                />
              )}
              {(connections.length - healthyConnections - warningConnections) > 0 && (
                <div
                  className="bg-gray-300"
                  style={{ width: `${((connections.length - healthyConnections - warningConnections) / connections.length) * 100}%` }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Billing Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Summary</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <div className="text-sm font-medium text-gray-500">Connection Costs</div>
                <div className="text-xs text-gray-400 mt-1">{connections.length} active connections</div>
              </div>
              <div className="text-xl font-bold text-gray-900">${monthlyConnectionCost.toLocaleString()}</div>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <div className="text-sm font-medium text-gray-500">Pool Management Fee</div>
                <div className="text-xs text-gray-400 mt-1">Administrative overhead</div>
              </div>
              <div className="text-xl font-bold text-gray-900">$0</div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-base font-semibold text-gray-900">Total Monthly Cost</div>
                <div className="text-xs text-gray-400 mt-1">Billed on the 1st of each month</div>
              </div>
              <div className="text-2xl font-bold text-brand-blue">${totalMonthlyCost.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Members Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Members & Access</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{users.length} Active Members</div>
              <p className="text-sm text-gray-600">
                Users with access to manage and view pool resources
              </p>
            </div>
            <Users className="h-12 w-12 text-gray-300" />
          </div>

          {users.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex -space-x-2">
                {users.slice(0, 5).map((user, idx) => (
                  <div
                    key={user.id}
                    className="h-10 w-10 rounded-full bg-fw-link flex items-center justify-center border border-fw-secondary text-white font-medium text-sm"
                    title={user.name}
                  >
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                ))}
                {users.length > 5 && (
                  <div className="h-10 w-10 rounded-full bg-fw-wash flex items-center justify-center border border-fw-secondary text-fw-body font-medium text-sm">
                    +{users.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
