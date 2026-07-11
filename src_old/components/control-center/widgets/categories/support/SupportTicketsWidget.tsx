import { Ticket, Clock, CheckCircle } from 'lucide-react';

export function SupportTicketsWidget() {
  const tickets = [
    {
      id: '1',
      title: 'Connection Latency Issue',
      status: 'open',
      priority: 'high',
      created: '2024-03-10T15:30:00Z'
    },
    {
      id: '2',
      title: 'Bandwidth Upgrade Request',
      status: 'in-progress',
      priority: 'medium',
      created: '2024-03-09T10:15:00Z'
    },
    {
      id: '3',
      title: 'Security Configuration',
      status: 'resolved',
      priority: 'low',
      created: '2024-03-08T14:20:00Z'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Ticket className="h-5 w-5 text-purple-500 mr-2" />
          <span className="text-sm font-medium text-gray-900">Recent Tickets</span>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          Create New
        </button>
      </div>

      <div className="space-y-2">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">{ticket.title}</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(ticket.created).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          <span className="text-sm text-green-700">All caught up!</span>
        </div>
        <span className="text-xs text-green-600">100% Response Rate</span>
      </div>
    </div>
  );
}