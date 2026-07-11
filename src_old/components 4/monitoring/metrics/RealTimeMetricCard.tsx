import { ReactNode, useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';

interface RealTimeMetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  status: 'healthy' | 'warning' | 'critical' | 'neutral';
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    timeframe: string;
  };
  sparklineData?: number[];
  target?: {
    value: number;
    label: string;
  };
  lastUpdate?: Date;
  isLive?: boolean;
}

export function RealTimeMetricCard({
  title,
  value,
  unit,
  icon,
  status,
  trend,
  sparklineData = [],
  target,
  lastUpdate,
  isLive = true
}: RealTimeMetricCardProps) {
  const [pulseActive, setPulseActive] = useState(false);

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setPulseActive(true);
        setTimeout(() => setPulseActive(false), 300);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  const getStatusStyles = () => {
    switch (status) {
      case 'healthy':
        return {
          border: 'border-green-200',
          bg: 'bg-green-50',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          badge: 'bg-green-100 text-green-800'
        };
      case 'warning':
        return {
          border: 'border-yellow-200',
          bg: 'bg-yellow-50',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-800'
        };
      case 'critical':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          badge: 'bg-red-100 text-red-800'
        };
      default:
        return {
          border: 'border-gray-200',
          bg: 'bg-gray-50',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const styles = getStatusStyles();

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-3.5 w-3.5" />;
      case 'down':
        return <TrendingDown className="h-3.5 w-3.5" />;
      case 'stable':
        return <Minus className="h-3.5 w-3.5" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    return trend.direction === 'up' ? 'text-green-600' :
           trend.direction === 'down' ? 'text-red-600' : 'text-gray-600';
  };

  const renderSparkline = () => {
    if (sparklineData.length === 0) return null;

    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;

    const points = sparklineData.map((value, index) => {
      const x = (index / (sparklineData.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={status === 'healthy' ? 'text-green-500' :
                     status === 'warning' ? 'text-yellow-500' :
                     status === 'critical' ? 'text-red-500' : 'text-gray-500'}
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={points}
          fill="currentColor"
          fillOpacity="0.1"
          stroke="none"
          className={status === 'healthy' ? 'text-green-500' :
                     status === 'warning' ? 'text-yellow-500' :
                     status === 'critical' ? 'text-red-500' : 'text-gray-500'}
        />
      </svg>
    );
  };

  return (
    <div className={`bg-white rounded-lg border-2 ${styles.border} transition-all duration-300 hover:shadow-lg ${pulseActive ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-sm font-medium text-gray-700">{title}</h3>
              {isLive && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              )}
            </div>
            {lastUpdate && (
              <p className="text-xs text-gray-500">
                Updated {new Date(lastUpdate).toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className={`p-2.5 rounded-lg ${styles.iconBg}`}>
            <div className={styles.iconColor}>
              {icon}
            </div>
          </div>
        </div>

        {/* Value */}
        <div className="mb-3">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toFixed(5).replace(/\.?0+$/, '') : value}
            </span>
            {unit && <span className="text-sm font-medium text-gray-600">{unit}</span>}
          </div>
        </div>

        {/* Trend & Status */}
        <div className="flex items-center justify-between mb-3">
          {trend && (
            <div className={`flex items-center space-x-1 text-xs font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{trend.percentage.toFixed(2)}%</span>
            </div>
          )}
          <div className={`px-2 py-1 text-xs font-semibold ${styles.badge}`}>
            {status === 'healthy' && <CheckCircle className="inline h-3 w-3 mr-1 -mt-0.5" />}
            {status === 'warning' && <AlertTriangle className="inline h-3 w-3 mr-1 -mt-0.5" />}
            {status === 'critical' && <AlertTriangle className="inline h-3 w-3 mr-1 -mt-0.5" />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>

        {/* Sparkline */}
        {sparklineData.length > 0 && (
          <div className="mb-3">
            {renderSparkline()}
          </div>
        )}

        {/* Target Progress */}
        {target && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
              <span>{target.label}</span>
              <span className="font-medium">{target.value}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  status === 'healthy' ? 'bg-green-500' :
                  status === 'warning' ? 'bg-yellow-500' :
                  status === 'critical' ? 'bg-red-500' : 'bg-gray-500'
                }`}
                style={{ width: `${Math.min(target.value, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
