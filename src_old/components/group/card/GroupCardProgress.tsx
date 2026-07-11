import { Group } from '../../../types/group';

interface GroupCardProgressProps {
  group: Group;
}

export function GroupCardProgress({ group }: GroupCardProgressProps) {
  // Calculate performance score for visualization (0-100)
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

  const performanceScore = getPerformanceScore();

  const getProgressColor = () => {
    if (performanceScore > 95) return 'bg-complementary-green';
    if (performanceScore > 90) return 'bg-brand-blue';
    if (performanceScore > 80) return 'bg-complementary-amber';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Pool Performance</span>
        <span className="font-medium text-gray-900">{performanceScore.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${performanceScore}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>0%</span>
        <span>
          {group.performance?.aggregatedMetrics.averageUptime || 'N/A'}
        </span>
      </div>
    </div>
  );
}
