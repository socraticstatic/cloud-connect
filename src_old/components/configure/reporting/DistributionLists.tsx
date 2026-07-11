import { useState } from 'react';
import { Users, Plus, Mail } from 'lucide-react';
import { Button } from '../../common/Button';

export function DistributionLists() {
  const [lists] = useState([
    {
      id: '1',
      name: 'Network Operations',
      description: 'Daily and weekly performance reports',
      members: ['ops@example.com', 'noc@example.com'],
      reports: ['Daily Performance', 'Weekly Summary']
    },
    {
      id: '2',
      name: 'Security Team',
      description: 'Security alerts and audit reports',
      members: ['security@example.com'],
      reports: ['Security Audit', 'Compliance Report']
    },
    {
      id: '3',
      name: 'Management',
      description: 'Executive summaries and monthly reports',
      members: ['cto@example.com', 'vp@example.com'],
      reports: ['Monthly Executive Summary']
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Distribution Lists</h3>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            window.addToast({
              type: 'info',
              title: 'Add List',
              message: 'Feature coming soon',
              duration: 3000
            });
          }}
        >
          Add List
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {lists.map((list) => (
          <div
            key={list.id}
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{list.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{list.description}</p>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Members</h5>
                      <div className="space-y-2">
                        {list.members.map((member, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{member}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Subscribed Reports</h5>
                      <div className="space-y-2">
                        {list.reports.map((report, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {report}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    window.addToast({
                      type: 'info',
                      title: 'Edit',
                      message: 'Feature coming soon',
                      duration: 3000
                    });
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.addToast({
                      type: 'info',
                      title: 'Delete',
                      message: 'Feature coming soon',
                      duration: 3000
                    });
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}