import { Server, Activity, Thermometer, Power } from 'lucide-react';
import { Card } from '../../../../common/Card';

export function DataCenterWidget() {
  const dataCenters = [
    {
      name: 'US East',
      status: 'Operational',
      capacity: 85,
      temperature: '22°C',
      power: '3.2 MW'
    },
    {
      name: 'US West',
      status: 'Operational',
      capacity: 72,
      temperature: '21°C',
      power: '2.8 MW'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {dataCenters.map((dc) => (
          <Card key={dc.name}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Server className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-sm font-medium text-gray-900">{dc.name}</h3>
              </div>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                {dc.status}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500">
                  <Activity className="h-4 w-4 mr-1" />
                  <span>Capacity</span>
                </div>
                <span className="font-medium text-gray-900">{dc.capacity}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500">
                  <Thermometer className="h-4 w-4 mr-1" />
                  <span>Temperature</span>
                </div>
                <span className="font-medium text-gray-900">{dc.temperature}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500">
                  <Power className="h-4 w-4 mr-1" />
                  <span>Power Usage</span>
                </div>
                <span className="font-medium text-gray-900">{dc.power}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}