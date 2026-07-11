import { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, Eye, Users, Crown, User as UserIcon, CheckCircle, XCircle, Info } from 'lucide-react';
import { Button } from '../../common/Button';
import { RoleCapabilityMatrix } from '../../common/RoleCapabilityMatrix';
import { useStore } from '../../../store/useStore';
import { ROLE_PERMISSIONS, PERMISSION_LABELS, Role } from '../../../types/permissions';
import { PermissionBadge } from '../../common/PermissionBadge';

export function RoleManagement() {
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);
  const { currentRole } = useStore();

  const roleDefinitions = [
    {
      id: 'super-admin',
      role: 'super-admin' as Role,
      name: 'Super Administrator',
      icon: Crown,
      color: 'red',
      description: 'Platform-wide access with all permissions across all tenants',
      userCount: 2,
      examples: ['Platform Manager', 'Chief Technology Officer'],
      restrictions: []
    },
    {
      id: 'admin',
      role: 'admin' as Role,
      name: 'Tenant Administrator',
      icon: Shield,
      color: 'purple',
      description: 'Full access within tenant scope, can manage users and billing',
      userCount: 8,
      examples: ['IT Manager', 'Operations Director', 'Billing Manager'],
      restrictions: ['Cannot access security settings', 'Cannot manage other tenants', 'Cannot impersonate users']
    },
    {
      id: 'user',
      role: 'user' as Role,
      name: 'Standard User',
      icon: UserIcon,
      color: 'blue',
      description: 'Basic access to view and manage own connections',
      userCount: 45,
      examples: ['Network Engineer', 'Developer', 'Analyst'],
      restrictions: ['Cannot create connections', 'Cannot access billing', 'Cannot manage users', 'Limited to own resources']
    }
  ];

  const getColorClasses = (color: string) => {
    const classes = {
      red: {
        bg: 'bg-red-50',
        border: 'border-red-300',
        text: 'text-red-700',
        icon: 'text-red-600',
        badge: 'bg-red-100 text-red-800'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-300',
        text: 'text-purple-700',
        icon: 'text-purple-600',
        badge: 'bg-purple-100 text-purple-800'
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        text: 'text-blue-700',
        icon: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-800'
      }
    };
    return classes[color as keyof typeof classes] || classes.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Role Management</h3>
          <p className="text-sm text-gray-600 mt-1">
            Define and manage access control through role-based permissions
          </p>
        </div>
        <Button
          variant="primary"
          icon={Eye}
          onClick={() => setShowPermissionMatrix(true)}
        >
          View Permission Matrix
        </Button>
      </div>

      {/* RBAC Principles */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">RBAC Best Practices</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• <span className="font-semibold">Principle of Least Privilege:</span> Users have only the minimum permissions needed</li>
              <li>• <span className="font-semibold">Role Hierarchy:</span> Permissions inherit upward (Admin includes all User permissions)</li>
              <li>• <span className="font-semibold">Separation of Duties:</span> Critical operations require specific elevated roles</li>
              <li>• <span className="font-semibold">Scope Isolation:</span> Each role has defined boundaries for data access</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Role Hierarchy Visualization */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Permission Inheritance Hierarchy</h4>
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-2 border-2 border-blue-300">
              <UserIcon className="h-10 w-10 text-blue-600" />
            </div>
            <div className="text-sm font-semibold text-gray-900">User</div>
            <div className="text-xs text-gray-500">1 permission</div>
          </div>

          <div className="flex items-center">
            <div className="h-0.5 w-12 bg-gray-300"></div>
            <div className="text-gray-400 text-xl">→</div>
            <div className="h-0.5 w-12 bg-gray-300"></div>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-2 border-2 border-purple-300">
              <Shield className="h-10 w-10 text-purple-600" />
            </div>
            <div className="text-sm font-semibold text-gray-900">Admin</div>
            <div className="text-xs text-gray-500">+6 permissions</div>
          </div>

          <div className="flex items-center">
            <div className="h-0.5 w-12 bg-gray-300"></div>
            <div className="text-gray-400 text-xl">→</div>
            <div className="h-0.5 w-12 bg-gray-300"></div>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-2 border-2 border-red-300">
              <Crown className="h-10 w-10 text-red-600" />
            </div>
            <div className="text-sm font-semibold text-gray-900">Super Admin</div>
            <div className="text-xs text-gray-500">+4 permissions</div>
          </div>
        </div>
        <p className="text-xs text-gray-600 text-center mt-4">
          Each role inherits all permissions from roles below it, plus additional capabilities
        </p>
      </div>

      {/* Role Cards */}
      <div className="space-y-4">
        {roleDefinitions.map((roleDef) => {
          const Icon = roleDef.icon;
          const colors = getColorClasses(roleDef.color);
          const permissions = ROLE_PERMISSIONS[roleDef.role];
          const isCurrentRole = currentRole === roleDef.role;

          return (
            <div
              key={roleDef.id}
              className={`bg-white rounded-lg border-2 p-6 transition-all ${
                isCurrentRole ? `${colors.border} shadow-lg` : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center border-2 ${colors.bg} ${colors.border}`}>
                    <Icon className={`h-7 w-7 ${colors.icon}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-bold text-gray-900">{roleDef.name}</h4>
                      {isCurrentRole && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          Your Role
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{roleDef.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{roleDef.userCount} users</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5" />
                        <span>{permissions.length} permissions</span>
                      </div>
                    </div>
                  </div>
                </div>
                <PermissionBadge
                  requirement={{ permission: 'view', role: roleDef.role }}
                  variant="compact"
                />
              </div>

              {/* Common Examples */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Common Job Titles:</p>
                <div className="flex flex-wrap gap-2">
                  {roleDef.examples.map((example, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-md text-xs font-medium ${colors.badge}`}
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>

              {/* Permissions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Permissions Granted
                  </p>
                  <div className="space-y-1">
                    {permissions.map((perm) => (
                      <div key={perm} className="flex items-center gap-2 text-xs text-gray-700">
                        <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                        <span>{PERMISSION_LABELS[perm]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {roleDef.restrictions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      Restrictions
                    </p>
                    <div className="space-y-1">
                      {roleDef.restrictions.map((rest, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                          <XCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
                          <span>{rest}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  onClick={() => {
                    window.addToast({
                      type: 'info',
                      title: `${roleDef.name} Details`,
                      message: `${permissions.length} permissions granted to ${roleDef.userCount} users`,
                      duration: 3000
                    });
                  }}
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit2}
                  onClick={() => {
                    window.addToast({
                      type: 'info',
                      title: 'Edit Role',
                      message: 'Role editing coming soon',
                      duration: 3000
                    });
                  }}
                >
                  Edit
                </Button>
                {roleDef.role !== 'super-admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    onClick={() => {
                      window.addToast({
                        type: 'warning',
                        title: 'Delete Role',
                        message: `Cannot delete ${roleDef.name} - ${roleDef.userCount} users assigned`,
                        duration: 3000
                      });
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Roles CTA */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Need Custom Roles?</h4>
            <p className="text-xs text-gray-600 mb-3">
              Create specialized roles tailored to your organization's unique access requirements
            </p>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            size="sm"
            onClick={() => {
              window.addToast({
                type: 'info',
                title: 'Custom Roles',
                message: 'Custom role creation coming soon',
                duration: 3000
              });
            }}
          >
            Create Custom Role
          </Button>
        </div>
      </div>

      {/* Permission Matrix Modal */}
      <RoleCapabilityMatrix
        isOpen={showPermissionMatrix}
        onClose={() => setShowPermissionMatrix(false)}
        currentRole={currentRole}
      />
    </div>
  );
}
