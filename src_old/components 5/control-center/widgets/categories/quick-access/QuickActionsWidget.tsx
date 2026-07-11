import { Plus, Network, Shield, Bell, Settings, ChevronRight } from 'lucide-react';

export function QuickActionsWidget() {
  const actions = [
    {
      id: 'create-connection',
      label: 'Create Connection',
      icon: Plus,
      color: 'blue'
    },
    {
      id: 'network-test',
      label: 'Network Test',
      icon: Network,
      color: 'green'
    },
    {
      id: 'security-scan',
      label: 'Security Scan',
      icon: Shield,
      color: 'purple'
    },
    {
      id: 'view-alerts',
      label: 'View Alerts',
      icon: Bell,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            className={`
              quick-action-btn p-3 text-left transition-colors
              ${action.color === 'blue' ? 'bg-blue-50 hover:bg-blue-100' :
                action.color === 'green' ? 'bg-green-50 hover:bg-green-100' :
                action.color === 'purple' ? 'bg-purple-50 hover:bg-purple-100' :
                'bg-orange-50 hover:bg-orange-100'}
            `}
          >
            <action.icon className={`
              h-5 w-5 mb-2
              ${action.color === 'blue' ? 'text-blue-500' :
                action.color === 'green' ? 'text-green-500' :
                action.color === 'purple' ? 'text-purple-500' :
                'text-orange-500'}
            `} />
            <div className={`
              text-sm font-medium
              ${action.color === 'blue' ? 'text-blue-900' :
                action.color === 'green' ? 'text-green-900' :
                action.color === 'purple' ? 'text-purple-900' :
                'text-orange-900'}
            `}>
              {action.label}
            </div>
          </button>
        ))}
      </div>

      <button className="quick-action-btn w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
        <div className="flex items-center">
          <Settings className="h-4 w-4 text-gray-400 mr-2" />
          <span>Configure Quick Actions</span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </button>
    </div>
  );
}