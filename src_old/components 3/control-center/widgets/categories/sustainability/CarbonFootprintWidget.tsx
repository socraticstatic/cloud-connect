import { Leaf, TrendingDown, Cloud, TreePine } from 'lucide-react';
import { Connection } from '../../../../../types';

interface CarbonFootprintWidgetProps {
  connections: Connection[];
}

export function CarbonFootprintWidget({ connections }: CarbonFootprintWidgetProps) {
  // Calculate carbon footprint based on connections
  const monthlyEmissions = connections.length * 12.5; // kg CO2 per connection per month
  const annualEmissions = monthlyEmissions * 12 / 1000; // Convert to tonnes
  const offsetPercentage = 65;
  const netEmissions = monthlyEmissions * (1 - offsetPercentage / 100);
  const treesEquivalent = Math.floor(annualEmissions * 48); // Trees needed to offset annually

  return (
    <div className="space-y-4">
      {/* Carbon Emissions */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {monthlyEmissions.toFixed(1)} kg
          </div>
          <div className="flex items-center mt-1">
            <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">-12%</span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
        <Cloud className="h-8 w-8 text-green-500" />
      </div>

      {/* Offset Progress */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Carbon Offset</span>
          <span>{offsetPercentage}% Neutralized</span>
        </div>
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
            style={{ width: `${offsetPercentage}%` }}
          />
        </div>
      </div>

      {/* Emissions Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Gross Emissions</span>
            <Cloud className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {monthlyEmissions.toFixed(1)} kg
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Net Emissions</span>
            <Leaf className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {netEmissions.toFixed(1)} kg
          </div>
        </div>
      </div>

      {/* Tree Equivalent */}
      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
        <div className="flex items-center">
          <TreePine className="h-4 w-4 text-green-500 mr-2" />
          <span className="text-sm text-green-700">Trees to Offset</span>
        </div>
        <span className="text-sm font-medium text-green-700">
          {treesEquivalent} annually
        </span>
      </div>

      {/* Annual Impact */}
      <div className="p-3 border border-green-200 rounded-lg">
        <div className="text-xs text-gray-500 mb-1">Annual CO₂ Emissions</div>
        <div className="text-lg font-bold text-gray-900">{annualEmissions.toFixed(2)} tonnes</div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <button className="flex-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">
          Offset More
        </button>
        <button className="flex-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}
