import { Zap, TrendingDown, Server, ThermometerSun } from 'lucide-react';
import { Connection } from '../../../../../types';

interface PUEMetricsWidgetProps {
  connections: Connection[];
}

export function PUEMetricsWidget({ connections }: PUEMetricsWidgetProps) {
  // PUE (Power Usage Effectiveness) = Total Facility Power / IT Equipment Power
  // Ideal PUE is 1.0, industry average is ~1.58
  const currentPUE = 1.42;
  const targetPUE = 1.30;
  const industryAverage = 1.58;
  const improvement = ((industryAverage - currentPUE) / industryAverage * 100).toFixed(1);

  // Calculate energy metrics
  const totalPower = connections.length * 0.5; // kW per connection
  const coolingPower = totalPower * (currentPUE - 1);
  const carbonSaved = ((industryAverage - currentPUE) * totalPower * 0.4).toFixed(1); // kg CO2

  return (
    <div className="space-y-4">
      {/* Current PUE Score */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {currentPUE.toFixed(2)}
          </div>
          <div className="flex items-center mt-1">
            <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">{improvement}%</span>
            <span className="text-sm text-gray-500 ml-1">better than average</span>
          </div>
        </div>
        <Zap className="h-8 w-8 text-green-500" />
      </div>

      {/* PUE Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Current vs Target</span>
          <span>Target: {targetPUE.toFixed(2)}</span>
        </div>
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
            style={{ width: `${(targetPUE / currentPUE) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
          <span>Efficient</span>
          <span>Industry: {industryAverage}</span>
        </div>
      </div>

      {/* Energy Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">IT Load</span>
            <Server className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {totalPower.toFixed(1)} kW
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Cooling</span>
            <ThermometerSun className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {coolingPower.toFixed(1)} kW
          </div>
        </div>
      </div>

      {/* Carbon Impact */}
      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
        <div className="flex items-center">
          <TrendingDown className="h-4 w-4 text-green-500 mr-2" />
          <span className="text-sm text-green-700">CO₂ Saved (vs avg)</span>
        </div>
        <span className="text-sm font-medium text-green-700">
          {carbonSaved} kg/month
        </span>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <button className="flex-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">
          View Trends
        </button>
        <button className="flex-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">
          Set Goals
        </button>
      </div>
    </div>
  );
}
