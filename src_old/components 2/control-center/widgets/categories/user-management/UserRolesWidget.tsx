import { UserPlus, Users, Shield } from 'lucide-react';
import { useStore } from '../../../../../store/useStore';

export function UserRolesWidget() {
  const users = useStore(state => state.users);

  const roles = [
    { id: 'admin', name: 'Administrator', count: users.filter(u => u.role === 'Network Administrator').length },
    { id: 'engineer', name: 'Network Engineer', count: users.filter(u => u.role === 'Network Engineer').length },
    { id: 'security', name: 'Security Analyst', count: users.filter(u => u.role === 'Security Analyst').length },
    { id: 'support', name: 'Support Engineer', count: users.filter(u => u.role === 'Support Engineer').length }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-orange-500 mr-2" />
          <span className="text-sm font-medium text-gray-900">User Roles</span>
        </div>
        <button className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <UserPlus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {roles.map((role) => (
          <div key={role.id} className="p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-900">{role.name}</span>
              </div>
              <span className="text-xs font-medium text-gray-500">
                {role.count} users
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
        Manage Roles
      </button>
    </div>
  );
}