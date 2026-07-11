import { useState } from 'react';
import { MoreVertical, UserPlus, Search, Filter, Download, Shield, Eye, Lock, Globe } from 'lucide-react';
import { UserIcon } from '../../common/UserIcon';
import { ConnectionAccessDrawer } from './ConnectionAccessDrawer';
import { AddUserDrawer } from './AddUserDrawer';
import { UserType } from '../types';
import { BaseTable } from '../../common/BaseTable';
import { OverflowMenu } from '../../common/OverflowMenu';
import { useStore } from '../../../store/useStore';
import { Button } from '../../common/Button';
import { PermissionBadge } from '../../common/PermissionBadge';
import { ScopeBadge } from '../../common/ScopeBadge';
import { permissionChecker } from '../../../utils/permissionChecker';
import { Role, ROLE_PERMISSIONS, PERMISSION_LABELS } from '../../../types/permissions';

interface UserListProps {
  searchQuery: string;
}

export function UserList({ searchQuery }: UserListProps) {
  const users = useStore(state => state.users);
  const { currentRole } = useStore();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');

  // Check if current user can manage users
  const canManageUsers = permissionChecker.hasPermission(currentRole, {
    permission: 'manage_users',
    resource: 'user'
  });

  const filteredUsers = users.filter(user => {
    const query = (localSearchQuery || '').toLowerCase();
    const userName = (user.name || '').toLowerCase();
    const userEmail = (user.email || '').toLowerCase();
    const userRole = (user.role || '').toLowerCase();

    return userName.includes(query) || userEmail.includes(query) || userRole.includes(query);
  });

  const handleUpdateAccess = (userId: string, connectionAccess: any[]) => {
    window.addToast({
      type: 'success',
      title: 'Access Updated',
      message: 'User connection access has been updated successfully.',
      duration: 3000
    });
    setShowAccessModal(false);
  };

  const handleAddUser = (userData: Omit<UserType, 'id' | 'lastActive'>) => {
    window.addToast({
      type: 'success',
      title: 'User Added',
      message: 'New user has been added successfully.',
      duration: 3000
    });
    setShowAddModal(false);
  };

  // Map user role to our RBAC roles
  const mapUserRole = (role: string): Role => {
    if (role.toLowerCase().includes('admin') || role.toLowerCase().includes('administrator')) {
      return 'admin';
    }
    return 'user';
  };

  const getRoleColor = (role: string) => {
    if (role.toLowerCase().includes('admin')) return 'purple';
    return 'blue';
  };

  const getScopeForUser = (user: UserType): 'own' | 'department' | 'pool' | 'tenant' => {
    if (user.role.toLowerCase().includes('admin')) return 'tenant';
    if (user.department) return 'department';
    return 'own';
  };

  const columns = [
    {
      id: 'user',
      label: 'User',
      sortable: true,
      sortKey: 'name' as keyof UserType,
      render: (user: UserType) => (
        <div className="flex items-center min-w-[200px]">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-fw-blue-light flex items-center justify-center border border-fw-secondary">
              <UserIcon size="md" variant="primary" />
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <div className="text-sm font-semibold text-fw-heading truncate">{user.name}</div>
            <div className="text-xs text-fw-bodyLight truncate">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      id: 'role',
      label: 'Role',
      sortable: true,
      sortKey: 'role' as keyof UserType,
      render: (user: UserType) => {
        const mappedRole = mapUserRole(user.role);
        const roleColor = getRoleColor(user.role);
        const permissions = ROLE_PERMISSIONS[mappedRole];
        const colorClasses = {
          purple: 'bg-fw-accent text-fw-cobalt-700 border-fw-active',
          blue: 'bg-fw-blue-light text-fw-link border-fw-active'
        }[roleColor];

        return (
          <div className="flex items-center gap-2">
            <Shield className={`h-4 w-4 ${roleColor === 'purple' ? 'text-fw-cobalt-600' : 'text-fw-link'}`} />
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${colorClasses}`}>
              {user.role}
            </span>
          </div>
        );
      }
    },
    {
      id: 'permissions',
      label: 'Permissions',
      render: (user: UserType) => {
        const mappedRole = mapUserRole(user.role);
        const permissions = ROLE_PERMISSIONS[mappedRole];

        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-fw-heading">{permissions.length}</span>
            <span className="text-xs text-fw-bodyLight">permission{permissions.length !== 1 ? 's' : ''}</span>
            <button
              onClick={() => {
                window.addToast({
                  type: 'info',
                  title: `${user.name}'s Permissions`,
                  message: permissions.map(p => PERMISSION_LABELS[p]).join('\n'),
                  duration: 5000
                });
              }}
              className="text-xs text-fw-link hover:text-fw-linkHover font-medium ml-1"
            >
              View
            </button>
          </div>
        );
      }
    },
    {
      id: 'scope',
      label: 'Access Scope',
      render: (user: UserType) => {
        const mappedRole = mapUserRole(user.role);
        const defaultScope = permissionChecker.getDefaultScope(mappedRole);
        const maxScope = permissionChecker.getMaxScope(mappedRole);

        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <ScopeBadge scope={defaultScope} variant="detailed" showIcon={true} />
            </div>
            <div className="flex items-center gap-1 text-xs text-fw-bodyLight">
              <span>Max:</span>
              <span className="font-medium text-fw-body capitalize">{maxScope}</span>
              {user.department && defaultScope === 'department' && (
                <>
                  <span className="mx-1">•</span>
                  <span>{user.department}</span>
                </>
              )}
            </div>
          </div>
        );
      }
    },
    {
      id: 'department',
      label: 'Department',
      sortable: true,
      sortKey: 'department' as keyof UserType,
      render: (user: UserType) => (
        <div className="text-sm text-fw-body">
          {user.department || <span className="text-fw-disabled italic">Not assigned</span>}
        </div>
      )
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      sortKey: 'status' as keyof UserType,
      render: (user: UserType) => (
        <div className="flex flex-col gap-1">
          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${
            user.status === 'active'
              ? 'bg-green-50 text-fw-success'
              : 'bg-fw-neutral text-fw-disabled'
          }`}>
            {user.status === 'active' ? 'Active' : 'Inactive'}
          </span>
          <span className="text-xs text-fw-bodyLight">
            {new Date(user.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      )
    }
  ];

  return (
    <>
      {/* Permission Status Banner */}
      {!canManageUsers.allowed && (
        <div className="bg-orange-50 border-2 border-fw-warn rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-fw-warn mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-fw-heading mb-1">Limited User Management Access</h3>
              <p className="text-xs text-fw-body mb-2">
                {canManageUsers.reason}. You can view users but cannot add, edit, or delete them.
              </p>
              <div className="flex items-center gap-2">
                <PermissionBadge requirement={{ permission: 'manage_users', resource: 'user' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RBAC Info Banner */}
      <div className="bg-fw-blue-light border border-fw-active rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-fw-link mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-fw-heading mb-1">Role-Based Access Control with Scope</h3>
            <p className="text-xs text-fw-body mb-3">
              Users are assigned roles that determine their permissions. Each role has a defined scope limiting what resources they can access.
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-3 text-xs mb-3">
              <div className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-fw-link" />
                <span className="text-fw-heading font-medium">{users.length} Total Users</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-fw-cobalt-600" />
                <span className="text-fw-heading font-medium">
                  {users.filter(u => u.role.toLowerCase().includes('admin')).length} Admins
                </span>
              </div>
              <div className="flex items-center gap-1">
                <UserIcon size="xs" variant="success" />
                <span className="text-fw-heading font-medium">
                  {users.filter(u => u.status === 'active').length} Active
                </span>
              </div>
            </div>

            {/* Scope Information */}
            <div className="bg-fw-accent border border-fw-active rounded-md p-2">
              <div className="text-xs">
                <span className="text-fw-bodyLight">Your Access Scope:</span>
                <span className="ml-2 text-fw-heading font-semibold">
                  {permissionChecker.getDefaultScope(currentRole).charAt(0).toUpperCase() + permissionChecker.getDefaultScope(currentRole).slice(1)}
                </span>
                <span className="mx-2 text-fw-bodyLight">•</span>
                <span className="text-fw-bodyLight">Max Scope:</span>
                <span className="ml-1 text-fw-heading font-semibold">
                  {permissionChecker.getMaxScope(currentRole).charAt(0).toUpperCase() + permissionChecker.getMaxScope(currentRole).slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-fw-base p-4 rounded-lg border border-fw-secondary mb-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fw-disabled h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value || '')}
              className="w-full pl-10 pr-4 py-2.5 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-active focus:border-fw-active text-sm text-fw-body bg-fw-base"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="primary"
              icon={UserPlus}
              onClick={() => setShowAddModal(true)}
              disabled={!canManageUsers.allowed}
            >
              Add User
            </Button>
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => {
                window.addToast({
                  type: 'info',
                  title: 'Filter Users',
                  message: 'Advanced filtering coming soon',
                  duration: 3000
                });
              }}
            >
              Filters
            </Button>
            <Button
              variant="outline"
              icon={Download}
              onClick={() => {
                window.addToast({
                  type: 'success',
                  title: 'Export Users',
                  message: 'User list exported successfully',
                  duration: 3000
                });
              }}
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-fw-base rounded-lg border border-fw-secondary shadow-sm">
        <BaseTable
          columns={columns}
          data={filteredUsers}
          keyField="id"
          tableId="users"
          showColumnManager={true}
          actions={(user) => (
            <OverflowMenu
              items={[
                {
                  id: 'access',
                  label: 'Manage Access',
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => {
                    setSelectedUser(user);
                    setShowAccessModal(true);
                  },
                  disabled: !canManageUsers.allowed
                },
                {
                  id: 'edit',
                  label: 'Edit User',
                  icon: <UserIcon size="sm" />,
                  onClick: () => {
                    window.addToast({
                      type: 'info',
                      title: 'Edit User',
                      message: 'User editing coming soon',
                      duration: 3000
                    });
                  },
                  disabled: !canManageUsers.allowed
                },
                {
                  id: 'permissions',
                  label: 'View Permissions',
                  icon: <Shield className="h-4 w-4" />,
                  onClick: () => {
                    const mappedRole = mapUserRole(user.role);
                    const permissions = permissionChecker.hasPermission(mappedRole, { permission: 'view' });
                    window.addToast({
                      type: 'info',
                      title: `${user.name}'s Permissions`,
                      message: `Role: ${user.role}\nScope: ${getScopeForUser(user)}`,
                      duration: 5000
                    });
                  }
                }
              ]}
            />
          )}
          emptyState={
            <div className="text-center py-12">
              <UserIcon size="xl" variant="muted" className="mx-auto mb-3" />
              <h3 className="text-sm font-medium text-fw-heading mb-1">No users found</h3>
              <p className="text-sm text-fw-bodyLight">
                {localSearchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first user'}
              </p>
            </div>
          }
        />
      </div>

      {/* Drawers */}
      {selectedUser && (
        <ConnectionAccessDrawer
          isOpen={showAccessModal}
          onClose={() => setShowAccessModal(false)}
          user={selectedUser}
          onSave={handleUpdateAccess}
        />
      )}

      <AddUserDrawer
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddUser}
      />
    </>
  );
}
