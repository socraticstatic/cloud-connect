import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { useStore } from '../../../../../store/useStore';

export function UserOverviewWidget() {
  const users = useStore(state => state.users);
  
  const activeUsers = users.filter(u => u.status === 'active');
  const recentlyActive = users.filter(u => {
    const lastActive = new Date(u.lastActive);
    const now = new Date();
    return now.getTime() - lastActive.getTime() < 24 * 60 * 60 * 1000; // 24 hours
  });

  return (
    <div className="space-y-4">
      {/* User Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-blue-600">Total</span>
          </div>
          <div className="text-xl font-semibold text-blue-900">
            {users.length}
          </div>
          <div className="text-xs text-blue-600">Users</div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <UserCheck className="h-4 w-4 text-green-500" />
            <span className="text-xs text-green-600">Active</span>
          </div>
          <div className="text-xl font-semibold text-green-900">
            {activeUsers.length}
          </div>
          <div className="text-xs text-green-600">Users</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Recently Active</span>
          <span className="text-sm font-medium text-gray-900">
            {recentlyActive.length} users
          </span>
        </div>
        <div className="space-y-2">
          {recentlyActive.slice(0, 3).map((user) => (
            <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="ml-2">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(user.lastActive).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <button className="flex-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          Add User
        </button>
        <button className="flex-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          Manage Roles
        </button>
      </div>
    </div>
  );
}