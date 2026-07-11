import { useState } from 'react';
import { Activity, Filter } from 'lucide-react';
import { UserIcon } from '../../common/UserIcon';
import { ActivityLog } from '../types';
import { Button } from '../../common/Button';

export function UserActivity() {
  const [logs] = useState<ActivityLog[]>([
    {
      id: '1',
      userId: 'user1',
      action: 'Created new connection',
      timestamp: '2024-03-10T15:30:00Z',
      details: 'AWS Direct Connect connection created'
    },
    {
      id: '2',
      userId: 'user2',
      action: 'Modified user permissions',
      timestamp: '2024-03-10T14:45:00Z',
      details: 'Updated role assignments for Security team'
    },
    {
      id: '3',
      userId: 'user1',
      action: 'Generated report',
      timestamp: '2024-03-10T13:15:00Z',
      details: 'Monthly performance report generated'
    }
  ]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">User Activity</h3>
        <Button
          variant="outline"
          icon={Filter}
          onClick={() => {
            window.addToast({
              type: 'info',
              title: 'Filter',
              message: 'Filtering options coming soon',
              duration: 3000
            });
          }}
        >
          Filter
        </Button>
      </div>

      <div className="flow-root">
        <ul className="-mb-8">
          {logs.map((log, index) => (
            <li key={log.id}>
              <div className="relative pb-8">
                {index !== logs.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-fw-blue-light flex items-center justify-center border border-fw-secondary">
                      <UserIcon size="md" variant="primary" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-900">{log.action}</p>
                      <p className="text-sm text-gray-500">{log.details}</p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}