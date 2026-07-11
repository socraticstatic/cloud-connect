import { useState } from 'react';
import { Calendar, Clock, Mail, Users } from 'lucide-react';
import { Button } from '../../common/Button';

interface Schedule {
  id: string;
  reportName: string;
  description: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  time: string;
  recipients: string[];
  lastRun: string;
  nextRun: string;
  status: 'active' | 'paused';
}

export function ScheduleSettings() {
  const [schedules] = useState<Schedule[]>([
    {
      id: '1',
      reportName: 'Monthly Performance Report',
      description: 'Comprehensive performance analysis',
      frequency: 'Monthly',
      time: '09:00',
      recipients: ['team@example.com', 'manager@example.com'],
      lastRun: '2024-03-01T09:00:00Z',
      nextRun: '2024-04-01T09:00:00Z',
      status: 'active'
    },
    {
      id: '2',
      reportName: 'Weekly Security Summary',
      description: 'Security events and compliance status',
      frequency: 'Weekly',
      time: '23:00',
      recipients: ['security@example.com'],
      lastRun: '2024-03-10T23:00:00Z',
      nextRun: '2024-03-17T23:00:00Z',
      status: 'active'
    },
    {
      id: '3',
      reportName: 'Daily Operations Report',
      description: 'Daily operational metrics and alerts',
      frequency: 'Daily',
      time: '00:00',
      recipients: ['operations@example.com'],
      lastRun: '2024-03-10T00:00:00Z',
      nextRun: '2024-03-11T00:00:00Z',
      status: 'paused'
    }
  ]);

  const getFrequencyColor = (frequency: Schedule['frequency']) => {
    switch (frequency) {
      case 'Daily':
        return 'bg-green-100 text-green-800';
      case 'Weekly':
        return 'bg-brand-lightBlue text-brand-blue';
      case 'Monthly':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Schedule Settings</h3>
        <Button
          variant="primary"
          onClick={() => {
            window.addToast({
              type: 'info',
              title: 'Add Schedule',
              message: 'Schedule creation form coming soon',
              duration: 3000
            });
          }}
        >
          Add Schedule
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{schedule.reportName}</h4>
                  <span className={`mt-2 inline-flex px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(schedule.frequency)}`}>
                    {schedule.frequency}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{schedule.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Next run: {new Date(schedule.nextRun).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {schedule.recipients.length} recipient{schedule.recipients.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {schedule.recipients[0]}{schedule.recipients.length > 1 ? ` +${schedule.recipients.length - 1} more` : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                >
                  {schedule.status === 'active' ? 'Pause' : 'Activate'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}