import { TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart } from '../../../../monitoring/charts/LineChart';

export function CapacityPlanningWidget() {
  const capacityData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Current Usage',
        data: [65, 72, 78, 82, 85, 88],
        borderColor: '#3b82f6',
        fill: false
      },
      {
        label: 'Projected Usage',
        data: [65, 72, 78, 82, 85, 92],
        borderColor: '#6366f1',
        borderDash: [5, 5],
        fill: false
      }
    ]
  };

  const resourceForecasts = [
    {
      name: 'Network Bandwidth',
      current: '85%',
      projected: '92%',
      trend: 'up',
      threshold: '95%',
      timeToThreshold: '45 days'
    },
    {
      name: 'Storage Capacity',
      current: '72%',
      projected: '78%',
      trend: 'up',
      threshold: '85%',
      timeToThreshold: '60 days'
    },
    {
      name: 'Compute Resources',
      current: '65%',
      projected: '68%',
      trend: 'up',
      threshold: '80%',
      timeToThreshold: '90 days'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Capacity Trends */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Capacity Trends</h3>
          <select className="text-sm border-gray-300 rounded-md">
            <option>Last 6 Months</option>
            <option>Last 12 Months</option>
            <option>Year to Date</option>
          </select>
        </div>
        <div className="h-48">
          <LineChart data={capacityData} />
        </div>
      </div>

      {/* Resource Forecasts */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Resource Forecasts</h3>
        {resourceForecasts.map((resource) => (
          <div key={resource.name} className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">{resource.name}</span>
              <div className="flex items-center">
                {resource.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-red-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-green-500" />
                )}
                <span className="ml-1 text-sm text-gray-600">{resource.projected}</span>
              </div>
            </div>
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div
                className="absolute h-full bg-blue-500 transition-all duration-300"
                style={{ width: resource.current }}
              />
              <div
                className="absolute h-full border-r-2 border-purple-500"
                style={{ left: resource.projected }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Current: {resource.current}</span>
              <div className="flex items-center text-yellow-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>Threshold in {resource.timeToThreshold}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="p-4 bg-yellow-50 rounded-lg">
        <div className="flex items-center mb-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
          <h3 className="text-sm font-medium text-yellow-900">Capacity Recommendations</h3>
        </div>
        <ul className="space-y-2 text-sm text-yellow-700">
          <li>• Consider bandwidth upgrade within 45 days</li>
          <li>• Plan storage expansion for Q3 2024</li>
          <li>• Review compute resource allocation</li>
        </ul>
      </div>
    </div>
  );
}