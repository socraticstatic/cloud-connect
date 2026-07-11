import { useState, useEffect } from 'react';
import { Users, Shield, Activity } from 'lucide-react';
import { UserList } from './users/UserList';
import { RoleManagement } from './users/RoleManagement';
import { UserActivity } from './users/UserActivity';
import { VerticalTabGroup } from '../navigation/VerticalTabGroup';
import { TabItem } from '../../types/navigation';

interface UserManagementProps {
  searchQuery: string;
  defaultTab?: string;
}

export function UserManagement({ searchQuery, defaultTab = 'users' }: UserManagementProps) {
  const [activeView, setActiveView] = useState<'users' | 'roles' | 'activity'>('users');

  useEffect(() => {
    setActiveView('users'); // Always set to 'users' on mount
  }, []);

  const tabs: TabItem[] = [
    { id: 'users', label: 'Users', icon: <Users className="h-5 w-5 mr-2" /> },
    { id: 'roles', label: 'Roles', icon: <Shield className="h-5 w-5 mr-2" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="h-5 w-5 mr-2" /> }
  ];

  return (
    <div className="p-6">
      <div className="flex">
        <VerticalTabGroup
          tabs={tabs}
          activeTab={activeView}
          onChange={(tab) => setActiveView(tab as typeof activeView)}
        />

        <div className="flex-1 pl-6">
          {activeView === 'users' && <UserList searchQuery={searchQuery} />}
          {activeView === 'roles' && <RoleManagement />}
          {activeView === 'activity' && <UserActivity />}
        </div>
      </div>
    </div>
  );
}