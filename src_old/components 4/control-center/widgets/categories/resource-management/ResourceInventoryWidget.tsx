import { Database, Server, Network, Cloud, HardDrive } from 'lucide-react';

export function ResourceInventoryWidget() {
  const resources = [
    {
      category: 'Network Devices',
      icon: Network,
      total: 248,
      active: 235,
      maintenance: 8,
      inactive: 5
    },
    {
      category: 'Servers',
      icon: Server,
      total: 156,
      active: 142,
      maintenance: 10,
      inactive: 4
    },
    {
      category: 'Storage',
      icon: HardDrive,
      total: 42,
      active: 38,
      maintenance: 2,
      inactive: 2
    },
    {
      category: 'Cloud Resources',
      icon: Cloud,
      total: 312,
      active: 298,
      maintenance: 12,
      inactive: 2
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {resources.map((resource) => (
          <div key={resource.category} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <resource.icon className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-sm font-medium text-gray-900">{resource.category}</h3>
              </div>
              <span className="text-lg font-semibold text-gray-900">{resource.total}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active</span>
                <span className="text-green-600">{resource.active}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Maintenance</span>
                <span className="text-yellow-600">{resource.maintenance}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Inactive</span>
                <span className="text-gray-600">{resource.inactive}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-blue-900">Resource Health</span>
          </div>
          <span className="text-sm text-blue-600">94.8% Healthy</span>
        </div>
      </div>
    </div>
  );
}