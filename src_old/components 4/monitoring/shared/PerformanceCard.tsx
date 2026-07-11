import { ReactNode } from 'react';
import { Activity, Wifi, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface PerformanceCardProps {
  title: string;
  value: string;
  change?: number;
  icon: ReactNode;
  status?: 'success' | 'warning' | 'error';
  description?: string;
  isMobile?: boolean;
}

export function PerformanceCard({
  title,
  value,
  change,
  icon,
  status = 'success',
  description,
  isMobile = false
}: PerformanceCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-complementary-green';
      case 'warning':
        return 'text-complementary-amber';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const getBackgroundColor = () => {
    switch (status) {
      case 'success':
        return 'bg-complementary-green/10';
      case 'warning':
        return 'bg-complementary-amber/10';
      case 'error':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };
  
  if (isMobile) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-medium text-gray-500">{title}</h3>
            {icon}
          </div>
          <div className="text-lg font-semibold text-gray-900">{value}</div>
          {change !== undefined && (
            <div className={`mt-1 text-xs flex items-center ${change < 0 ? 'text-complementary-green' : 'text-red-600'}`}>
              {change < 0 ? (
                <TrendingDown className="h-3 w-3 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 mr-1" />
              )}
              <span>{Math.abs(change).toFixed(1)}% {change < 0 ? 'decrease' : 'increase'}</span>
            </div>
          )}
          {description && (
            <div className="mt-1 text-xs text-gray-500">{description}</div>
          )}
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4 p-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className={`p-2 rounded-lg ${getBackgroundColor()}`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-center space-x-3 mb-4 px-4">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change !== undefined && (
          <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${
            change < 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {change < 0 ? (
              <TrendingDown className="h-3 w-3 mr-1" />
            ) : (
              <TrendingUp className="h-3 w-3 mr-1" />
            )}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>

      <div className="h-24 w-full px-4 pb-4">
        {/* Chart placeholder - would be replaced with actual chart */}
        <div className="h-full w-full bg-gray-50 rounded-lg flex items-center justify-center">
          <span className="text-xs text-gray-400">Chart Placeholder</span>
        </div>
      </div>
    </div>
  );
}