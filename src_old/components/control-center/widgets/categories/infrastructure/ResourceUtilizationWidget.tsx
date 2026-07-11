import { Cpu, MemoryStick as Memory, Database, HardDrive } from 'lucide-react';

export function ResourceUtilizationWidget() {
  const resources = [
    {
      name: 'CPU',
      icon: Cpu,
      usage: 65,
      total: '32 cores',
      color: 'blue'
    },
    {
      name: 'Memory',
      icon: Memory,
      usage: 78,
      total: '128 GB',
      color: 'purple'
    },
    {
      name: 'Storage',
      icon: HardDrive,
      usage: 82,
      total: '2 TB',
      color: 'green'
    },
    {
      name: 'Database',
      icon: Database,
      usage: 45,
      total: '500 GB',
      color: 'orange'
    }
  ];

  const getUsageColor = (usage: number) => {
    if (usage > 90) return 'bg-red-500';
    if (usage > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <div key={resource.name} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <resource.icon className={`h-4 w-4 text-${resource.color}-500 mr-2`} />
              <span className="text-sm font-medium text-gray-900">{resource.name}</span>
            </div>
            <div className="text-sm text-gray-500">{resource.total}</div>
          </div>
          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`absolute h-full ${getUsageColor(resource.usage)} transition-all duration-300`}
              style={{ width: `${resource.usage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{resource.usage}% used</span>
            <span>{100 - resource.usage}% available</span>
          </div>
        </div>
      ))}
    </div>
  );
}