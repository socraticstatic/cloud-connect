import { useState } from 'react';
import { Shield, Users, Lock, Eye, FileText, Settings, Info, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '../../../common/Button';
import { RBACDemoPanel } from '../../../common/RBACDemoPanel';
import { RoleCapabilityMatrix } from '../../../common/RoleCapabilityMatrix';
import { useStore } from '../../../../store/useStore';
import { PermissionBadge } from '../../../common/PermissionBadge';
import { Role } from '../../../../types/permissions';

export function AccessControlPolicy() {
  const [showRBACDemo, setShowRBACDemo] = useState(false);
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);
  const { currentRole } = useStore();

  const features = [
    {
      icon: Shield,
      title: 'Role-Based Access Control',
      description: 'Define who can access what resources based on their role in the organization',
      color: 'blue'
    },
    {
      icon: Users,
      title: 'User & Group Management',
      description: 'Organize users into groups with shared permissions and access levels',
      color: 'green'
    },
    {
      icon: Lock,
      title: 'Resource Permissions',
      description: 'Control access to connections, pools, billing, and system settings',
      color: 'red'
    },
    {
      icon: FileText,
      title: 'Audit & Compliance',
      description: 'Track all access attempts and changes for security and compliance',
      color: 'purple'
    }
  ];

  const roleDefinitions = [
    {
      role: 'user' as Role,
      name: 'Standard User',
      icon: Users,
      permissions: ['View connections', 'View monitoring data'],
      restrictions: ['Cannot create/edit connections', 'Cannot access billing', 'Cannot manage users'],
      color: 'blue'
    },
    {
      role: 'admin' as Role,
      name: 'Tenant Administrator',
      icon: Settings,
      permissions: ['Full connection management', 'Billing access', 'User management', 'View audit logs'],
      restrictions: ['Cannot access security settings', 'Cannot manage other tenants', 'Cannot impersonate users'],
      color: 'purple'
    },
    {
      role: 'super-admin' as Role,
      name: 'Platform Administrator',
      icon: Shield,
      permissions: ['All admin permissions', 'Security configuration', 'Multi-tenant management', 'User impersonation', 'System settings'],
      restrictions: ['None - Full platform access'],
      color: 'red'
    }
  ];

  const bestPractices = [
    {
      title: 'Principle of Least Privilege',
      description: 'Users should only have the minimum permissions necessary to perform their job'
    },
    {
      title: 'Separation of Duties',
      description: 'Critical operations should require multiple approvers or roles'
    },
    {
      title: 'Regular Access Reviews',
      description: 'Periodically review and audit user permissions to ensure they remain appropriate'
    },
    {
      title: 'Just-In-Time Access',
      description: 'Grant temporary elevated permissions only when needed for specific tasks'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Access Control & Security</h2>
            </div>
            <p className="text-blue-100 text-sm max-w-3xl">
              Manage user permissions, roles, and security policies. Control who can access what resources across your organization.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowRBACDemo(true)}
            className="bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Open Interactive Demo
          </Button>
        </div>
      </div>

      {/* Current Role Status */}
      <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Your Current Role</p>
              <p className="text-lg font-bold text-gray-900 capitalize">{currentRole.replace('-', ' ')}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPermissionMatrix(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View My Permissions
          </Button>
        </div>
      </div>

      {/* Key Features */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600 border-blue-200',
              green: 'bg-green-50 text-green-600 border-green-200',
              red: 'bg-red-50 text-red-600 border-red-200',
              purple: 'bg-purple-50 text-purple-600 border-purple-200'
            }[feature.color];

            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 border ${colorClasses}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Definitions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Definitions</h3>
        <div className="space-y-4">
          {roleDefinitions.map((roleDef) => {
            const Icon = roleDef.icon;
            const isCurrentRole = currentRole === roleDef.role;
            const colorClasses = {
              blue: 'border-blue-500 bg-blue-50',
              purple: 'border-purple-500 bg-purple-50',
              red: 'border-red-500 bg-red-50'
            }[roleDef.color];

            return (
              <div
                key={roleDef.role}
                className={`bg-white rounded-lg border-2 p-5 ${
                  isCurrentRole ? colorClasses : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isCurrentRole ? colorClasses : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-6 w-6 ${isCurrentRole ? `text-${roleDef.color}-600` : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">{roleDef.name}</h4>
                      {isCurrentRole && (
                        <span className="text-xs font-medium text-blue-600">Your Current Role</span>
                      )}
                    </div>
                  </div>
                  <PermissionBadge
                    requirement={{ permission: 'view', role: roleDef.role }}
                    variant="compact"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-green-700 mb-2">✓ Permissions</p>
                    <ul className="space-y-1">
                      {roleDef.permissions.map((perm, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          {perm}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-700 mb-2">✗ Restrictions</p>
                    <ul className="space-y-1">
                      {roleDef.restrictions.map((rest, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-red-600 mt-0.5">•</span>
                          {rest}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Best Practices */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Best Practices</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <div className="space-y-4">
            {bestPractices.map((practice, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">{index + 1}</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{practice.title}</h4>
                  <p className="text-sm text-gray-700">{practice.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Demo CTA */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Try the Interactive RBAC Demo</h3>
            <p className="text-sm text-gray-700 mb-4">
              Experience how role-based access control works with our interactive demonstration. Switch between roles,
              see permission restrictions in action, view audit logs, and understand the complete access control workflow.
            </p>
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={() => setShowRBACDemo(true)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Launch Interactive Demo
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPermissionMatrix(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Permission Matrix
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Links */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
        <div className="flex items-start gap-3 mb-4">
          <Info className="h-5 w-5 text-gray-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Additional Resources</h4>
            <p className="text-sm text-gray-600">Learn more about access control and security best practices</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.open('/RBAC_SHOWCASE_SUMMARY.md', '_blank');
            }}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            Technical Documentation
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.open('/RBAC_DEMO_GUIDE.md', '_blank');
            }}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            Demo Guide
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.open('/HOW_TO_SEE_RBAC_DEMO.md', '_blank');
            }}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            Quick Start Guide
          </a>
        </div>
      </div>

      {/* RBAC Demo Panel */}
      <RBACDemoPanel
        isOpen={showRBACDemo}
        onClose={() => setShowRBACDemo(false)}
      />

      {/* Permission Matrix */}
      <RoleCapabilityMatrix
        isOpen={showPermissionMatrix}
        onClose={() => setShowPermissionMatrix(false)}
        currentRole={currentRole}
      />
    </div>
  );
}
