import { User, Network, CreditCard, Activity } from 'lucide-react';
import { Group } from '../../types/group';
import { Connection } from '../../types';

interface GroupMetricsPanelProps {
  group: Group;
  connections: Connection[];
  users: any[];
}

export function GroupMetricsPanel({ group, connections, users }: GroupMetricsPanelProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 border-t border-gray-200">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Members</div>
            <div className="text-xl font-semibold text-gray-900">{group.userIds.length}</div>
          </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50">
            <Network className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Connections</div>
            <div className="text-xl font-semibold text-gray-900">{group.connectionIds.length}</div>
          </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50">
            <CreditCard className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Monthly Billing</div>
            <div className="text-xl font-semibold text-gray-900">
              ${group.billing?.monthlyRate.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50">
            <Activity className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Average Uptime</div>
            <div className="text-xl font-semibold text-gray-900">
              {group.performance?.aggregatedMetrics.averageUptime || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}