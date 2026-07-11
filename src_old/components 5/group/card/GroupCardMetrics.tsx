import { Network, DollarSign } from 'lucide-react';
import { UserIcon } from '../../common/UserIcon';
import { Group } from '../../../types/group';

interface GroupCardMetricsProps {
  group: Group;
}

export function GroupCardMetrics({ group }: GroupCardMetricsProps) {
  return (
    <div className="space-y-3">
      {/* Top Row: Members & Connections */}
      <div className="grid grid-cols-2 gap-3">
        {/* Members */}
        <div className="flex items-start space-x-3 p-3 bg-fw-blue-light rounded-lg border border-fw-blue-100">
          <UserIcon size="sm" variant="primary" className="mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-medium text-fw-heading block mb-0.5">Members</span>
            <p className="text-sm font-semibold text-fw-link">
              {group.userIds.length} {group.userIds.length === 1 ? 'User' : 'Users'}
            </p>
          </div>
        </div>

        {/* Connections */}
        <div className="flex items-start space-x-3 p-3 bg-fw-wash rounded-lg border border-fw-secondary">
          <Network className="h-4 w-4 text-fw-body mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-medium text-fw-body block mb-0.5">Connections</span>
            <p className="text-sm font-semibold text-fw-heading">
              {group.connectionIds.length} Active
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Row: Monthly Cost */}
      <div>
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-fw-success">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-fw-success flex-shrink-0" />
            <span className="text-xs font-medium text-fw-success">Monthly Cost</span>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-semibold text-fw-heading">
              {formatCurrency(group.billing?.monthlyRate || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
