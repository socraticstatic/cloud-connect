import { TrendingUp, ArrowUpDown, Activity, Clock } from 'lucide-react';

interface MetricsOverviewProps {
  metrics: {
    bandwidth: string;
    uptime: string;
  };
}

export function MetricsOverview({ metrics }: MetricsOverviewProps) {
  const summaryMetrics = [
    {
      label: 'Current Utilization',
      value: '85%',
      icon: <TrendingUp className="h-6 w-6 text-blue-500" />,
      color: 'text-blue-500'
    },
    {
      label: 'Average Utilization',
      value: '75%',
      icon: <Activity className="h-6 w-6 text-green-500" />,
      color: 'text-green-500'
    },
    {
      label: 'Peak Utilization',
      value: '95%',
      icon: <ArrowUpDown className="h-6 w-6 text-purple-500" />,
      color: 'text-purple-500'
    },
    {
      label: 'Uptime',
      value: metrics.uptime,
      icon: <Clock className="h-6 w-6 text-indigo-500" />,
      color: 'text-indigo-500'
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Performance Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {summaryMetrics.map((metric, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className={`p-3 rounded-full ${metric.color.replace('text-', 'bg-').replace('500', '100')} mb-3`}>
              {metric.icon}
            </div>
            <div className="text-lg font-medium text-gray-900 mb-1">{metric.value}</div>
            <div className="text-xs text-gray-500">{metric.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}