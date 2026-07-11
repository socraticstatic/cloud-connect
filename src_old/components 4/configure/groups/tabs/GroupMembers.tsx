import { useState } from 'react';
import { UserPlus, Trash2, ShieldCheck, Edit2, X, Search, Filter, Download } from 'lucide-react';
import { UserIcon } from '../../../common/UserIcon';
import { Group } from '../../../../types/group';
import { User as UserType } from '../../../../types';
import { BaseTable } from '../../../common/BaseTable';
import { Button } from '../../../common/Button';
import { OverflowMenu } from '../../../common/OverflowMenu';
import { ConfirmDialog } from '../../../common/ConfirmDialog';
import { useStore } from '../../../../store/useStore';

interface GroupMembersProps {
  group: Group;
  users: UserType[];
  allUsers: UserType[];
}

export function GroupMembers({ group, users, allUsers }: GroupMembersProps) {
  const removeUserFromGroup = useStore(state => state.removeUserFromGroup);
  const addUserToGroup = useStore(state => state.addUserToGroup);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get available users (not already in the group)
  const availableUsers = allUsers.filter(user => !group.userIds.includes(user.id));
  
  const handleRemoveUser = async () => {
    if (userToRemove) {
      try {
        await removeUserFromGroup(group.id, userToRemove);
        setUserToRemove(null);
      } catch (error) {
        console.error('Error removing user from group:', error);
      }
    }
  };
  
  const handleAddUser = async (userId: string) => {
    try {
      await addUserToGroup(group.id, userId);
      setShowAddUserModal(false);
    } catch (error) {
      console.error('Error adding user to group:', error);
    }
  };

  // Determine user's roles
  const getUserRoles = (userId: string) => {
    const roles = [];
    if (group.ownerId === userId) roles.push('Owner');
    if (group.permissions.admin.includes(userId)) roles.push('Admin');
    else if (group.permissions.write.includes(userId)) roles.push('Editor');
    else if (group.permissions.read.includes(userId)) roles.push('Viewer');
    return roles;
  };

  const columns = [
    {
      id: 'user',
      label: 'User',
      width: '45%',
      render: (user: UserType) => (
        <div className="flex items-center max-w-xs">
          <div className="flex-shrink-0 h-10 w-10">
            {user.avatar ? (
              <img 
                className="h-10 w-10 rounded-full"
                src={user.avatar}
                alt={user.name}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-fw-blue-light flex items-center justify-center border border-fw-secondary">
                <UserIcon size="md" variant="primary" />
              </div>
            )}
          </div>
          <div className="ml-4 max-w-[calc(100%-44px)]">
            <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
            <div className="text-sm text-gray-500 truncate">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      id: 'role',
      label: 'User Role',
      width: '35%',
      render: (user: UserType) => (
        <div className="text-sm text-gray-500 truncate max-w-[120px]">{user.role}</div>
      )
    },
    {
      id: 'status',
      label: 'Status',
      width: '20%',
      render: (user: UserType) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </span>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Search and Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="primary"
              icon={UserPlus}
              onClick={() => setShowAddUserModal(true)}
            >
              Add User
            </Button>
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            <Button
              variant="outline"
              icon={Download}
              onClick={() => {
                window.addToast({
                  type: 'success',
                  title: 'Export Complete',
                  message: 'Group members exported successfully',
                  duration: 3000
                });
              }}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">User Role</h4>
                <div className="space-y-2">
                  {['Network Administrator', 'Security Engineer', 'Security Analyst'].map((role) => (
                    <label key={role} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Group Permissions</h4>
                <div className="space-y-2">
                  {['Owner', 'Admin', 'Editor', 'Viewer'].map((permission) => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-gray-700">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Status</h4>
                <div className="space-y-2">
                  {['Active', 'Inactive'].map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <BaseTable
          columns={columns}
          data={filteredUsers}
          keyField="id"
          tableId="group-members"
          showColumnManager={true}
          actions={(user) => (
            <OverflowMenu
              items={[
                {
                  id: 'edit',
                  label: 'Edit Permissions',
                  icon: <Edit2 className="h-4 w-4" />,
                  onClick: () => {
                    window.addToast({
                      type: 'info',
                      title: 'Edit Permissions',
                      message: 'Permissions management coming soon',
                      duration: 3000
                    });
                  }
                },
                {
                  id: 'make-admin',
                  label: 'Make Admin',
                  icon: <ShieldCheck className="h-4 w-4" />,
                  onClick: () => {
                    window.addToast({
                      type: 'info',
                      title: 'Make Admin',
                      message: 'Admin promotion coming soon',
                      duration: 3000
                    });
                  }
                },
                {
                  id: 'remove',
                  label: 'Remove from Group',
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => setUserToRemove(user.id),
                  variant: 'danger'
                }
              ]}
            />
          )}
          emptyState={
            <div className="text-center py-12">
              <UserIcon size="xl" variant="muted" className="mx-auto mb-4" />
              <p className="text-gray-500">No members found in this group</p>
            </div>
          }
        />
      </div>

      {/* Remove User Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!userToRemove}
        onClose={() => setUserToRemove(null)}
        onConfirm={handleRemoveUser}
        title="Remove User"
        message="Are you sure you want to remove this user from the group? They will lose all group-related permissions."
        confirmText="Remove"
        confirmVariant="danger"
      />

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowAddUserModal(false)} />

            {/* Modal panel */}
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-xl shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-blue-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Add User to Group
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Select a user to add to this group. They will automatically receive read access to group resources.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search for users */}
                <div className="relative mt-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  />
                </div>

                {/* User list */}
                <div className="mt-4 max-h-60 overflow-y-auto">
                  {availableUsers.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {availableUsers.map(user => (
                        <li key={user.id} className="py-3 flex items-center hover:bg-gray-50 px-2 rounded-lg">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar ? (
                              <img 
                                className="h-10 w-10 rounded-full"
                                src={user.avatar}
                                alt={user.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserIcon size="md" variant="muted" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                          <button
                            onClick={() => handleAddUser(user.id)}
                            className="ml-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-full shadow-sm text-white bg-brand-blue hover:bg-brand-darkBlue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                          >
                            Add
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-sm text-gray-500">No available users to add</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

