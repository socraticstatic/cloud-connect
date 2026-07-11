import { Zap, Sun, Wind, Battery } from 'lucide-react';
import { Connection } from '../../../../../types';

interface RenewableEnergyWidgetProps {
  connections: Connection[];
}

export function RenewableEnergyWidget({ connections }: RenewableEnergyWidgetProps) {
  // Calculate renewable energy usage
  const renewablePercentage = 73;
  const totalEnergy = connections.length * 1.2; // kWh
  const renewableEnergy = totalEnergy * (renewablePercentage / 100);
  const gridEnergy = totalEnergy - renewableEnergy;

  // Energy sources breakdown
  const energySources = [
    { name: 'Solar', percentage: 42, icon: Sun, color: 'text-yellow-500' },
    { name: 'Wind', percentage: 28, icon: Wind, color: 'text-blue-500' },
    { name: 'Hydro', percentage: 3, icon: Battery, color: 'text-cyan-500' }
  ];

  return (
    <div className="space-y-4">
      {/* Renewable Percentage */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {renewablePercentage}%
          </div>
          <div className="flex items-center mt-1">
            <Zap className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-gray-500">Renewable Energy</span>
          </div>
        </div>
        <Sun className="h-8 w-8 text-yellow-500" />
      </div>

      {/* Renewable Progress */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Clean Energy Mix</span>
          <span>{renewableEnergy.toFixed(1)} kWh</span>
        </div>
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
            style={{ width: `${renewablePercentage}%` }}
          />
        </div>
      </div>

      {/* Energy Sources */}
      <div className="space-y-2">
        {energySources.map((source) => {
          const SourceIcon = source.icon;
          const energy = totalEnergy * (source.percentage / 100);

          return (
            <div key={source.name} className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
                <SourceIcon className={`h-4 w-4 ${source.color} mr-2 flex-shrink-0`} />
                <span className="text-sm text-gray-600 truncate">{source.name}</span>
              </div>
              <div className="flex items-center ml-3">
                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden mr-2">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 w-12 text-right">
                  {source.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Energy Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-green-700">Renewable</span>
            <Zap className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-sm font-semibold text-green-900">
            {renewableEnergy.toFixed(1)} kWh
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Grid</span>
            <Zap className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {gridEnergy.toFixed(1)} kWh
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <button className="flex-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">
          Energy Report
        </button>
        <button className="flex-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">
          Add Sources
        </button>
      </div>
    </div>
  );
}
