import { Server, MapPin, Activity, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import { IPE } from '../../types/ipe';
import { Card } from '../common/Card';

interface IPECardProps {
  ipe: IPE;
  onClick?: () => void;
}

export function IPECard({ ipe, onClick }: IPECardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-50';
      case 'degraded':
        return 'text-orange-600 bg-orange-50';
      case 'offline':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />;
      case 'offline':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-orange-600';
    if (utilization >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBgColor = (utilization: number) => {
    if (utilization >= 90) return 'bg-red-500';
    if (utilization >= 75) return 'bg-orange-500';
    if (utilization >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTrendIcon = () => {
    if (!ipe.utilizationTrend || ipe.utilizationTrend.length < 2) return <Minus className="h-3 w-3" />;

    const recent = ipe.utilizationTrend.slice(-3);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const older = ipe.utilizationTrend.slice(-6, -3);
    const oldAvg = older.reduce((a, b) => a + b, 0) / older.length;

    if (avg > oldAvg + 5) return <TrendingUp className="h-3 w-3 text-red-500" />;
    if (avg < oldAvg - 5) return <TrendingDown className="h-3 w-3 text-green-500" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  return (
    <Card
      onClick={onClick}
      className="hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Server className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{ipe.name}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {ipe.location}
              </div>
            </div>
          </div>
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(ipe.status)}`}>
            {getStatusIcon(ipe.status)}
            <span className="ml-1 capitalize">{ipe.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Region</div>
            <div className="text-sm font-medium text-gray-900">{ipe.region}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Data Center</div>
            <div className="text-sm font-medium text-gray-900">{ipe.dataCenterProvider}</div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Utilization</span>
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={`text-lg font-bold ${getUtilizationColor(ipe.utilization)}`}>
                {ipe.utilization}%
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getUtilizationBgColor(ipe.utilization)}`}
              style={{ width: `${ipe.utilization}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{ipe.availableCapacity} available</span>
            <span>{ipe.installedCapacity} total</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center border-t border-gray-100 pt-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Connections</div>
            <div className="text-lg font-semibold text-gray-900">{ipe.totalConnections}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Links</div>
            <div className="text-lg font-semibold text-gray-900">{ipe.totalLinks}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">VNFs</div>
            <div className="text-lg font-semibold text-gray-900">{ipe.totalVNFs}</div>
          </div>
        </div>

        {ipe.cloudOnRamps && ipe.cloudOnRamps.length > 0 && (
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="text-xs text-gray-500 mb-2">Cloud On-Ramps</div>
            <div className="flex flex-wrap gap-1.5">
              {ipe.cloudOnRamps.filter(onRamp => onRamp.available).map((onRamp) => (
                <span
                  key={onRamp.provider}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700"
                >
                  {onRamp.provider}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
