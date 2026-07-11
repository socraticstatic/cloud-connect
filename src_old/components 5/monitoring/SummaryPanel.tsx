import { Activity, Users } from 'lucide-react';

interface SummaryPanelProps {
  connections: Array<any>;
}

export function SummaryPanel({ connections }: SummaryPanelProps) {
  const topUsers = [
    { name: 'Sarah Chen', usage: '2.3 TB' },
    { name: 'John Smith', usage: '1.8 TB' },
    { name: 'Maria Garcia', usage: '1.5 TB' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          <Users className="h-5 w-5 inline-block mr-2 text-blue-500" />
          Top Users by Bandwidth
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topUsers.map((user, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-fw-blue-light flex items-center justify-center border border-fw-secondary">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-500">Total Usage</div>
              </div>
            </div>
            <div className="text-lg font-semibold text-gray-900">{user.usage}</div>
          </div>
        ))}
      </div>
    </div>
  );
}