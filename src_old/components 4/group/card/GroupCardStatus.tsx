import { Group } from '../../../types/group';

interface GroupCardStatusProps {
  group: Group;
}

export function GroupCardStatus({ group }: GroupCardStatusProps) {
  const getPerformanceScore = () => {
    if (!group.performance) return 75;

    const uptime = group.performance.aggregatedMetrics.averageUptime;
    if (typeof uptime === 'string') {
      const match = uptime.match(/(\d+\.\d+)/);
      if (match && match[1]) {
        return parseFloat(match[1]);
      }
    }

    return 75;
  };

  const getHealthStatus = () => {
    if (group.status !== 'active') return { label: 'Inactive', color: 'bg-fw-wash text-fw-body' };

    const score = getPerformanceScore();
    if (score > 95) {
      return { label: 'Optimal', color: 'bg-green-50 text-fw-success' };
    } else if (score > 90) {
      return { label: 'Good', color: 'bg-fw-blue-light text-fw-link' };
    } else if (score > 80) {
      return { label: 'Warning', color: 'bg-orange-50 text-fw-warn' };
    } else {
      return { label: 'Critical', color: 'bg-red-50 text-fw-error' };
    }
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="p-4 border-t border-fw-secondary">
      <div className="flex items-center justify-between mt-4">
        <button
          className={`
            inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
            transition-all duration-200 border
            ${group.status === 'active'
              ? 'bg-fw-base text-fw-success border-fw-success/20'
              : 'bg-fw-base text-fw-body border-fw-secondary'
            }
          `}
        >
          {group.status === 'active' ? 'Active' : 'Inactive'}
        </button>

        <span className={`px-3 py-1 rounded-full text-xs font-medium ${healthStatus.color}`}>
          {healthStatus.label}
        </span>
      </div>
    </div>
  );
}
