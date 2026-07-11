import { useState } from 'react';
import { Shield, Eye, Users, Lock, FileText, Settings, DollarSign, X, ChevronRight, Info, Layers } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from './Button';
import { RoleCapabilityMatrix } from './RoleCapabilityMatrix';
import { AuditLogPanel } from './AuditLogPanel';
import { PermissionBadge } from './PermissionBadge';
import { ResourceFilterBadge } from './ResourceFilterBadge';
import { Role } from '../../types/permissions';
import { permissionChecker } from '../../utils/permissionChecker';

interface RBACDemoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RBACDemoPanel({ isOpen, onClose }: RBACDemoPanelProps) {
  const { currentRole, setRole } = useStore();
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  if (!isOpen) return null;

  const demoScenarios = [
    {
      id: 'billing-user',
      title: 'Limited Billing Access',
      role: 'user' as Role,
      description: 'Experience restricted access to billing settings',
      steps: [
        'Switch to User role',
        'Navigate to Configure → Billing',
        'Observe warning banner and disabled controls',
        'Try to click "Request Access" button'
      ],
      icon: DollarSign,
      color: 'blue'
    },
    {
      id: 'billing-admin',
      title: 'Full Billing Access',
      role: 'admin' as Role,
      description: 'See how admins can manage billing',
      steps: [
        'Switch to Admin role',
        'Navigate to Configure → Billing',
        'Notice no warnings - full access granted',
        'All save buttons are enabled'
      ],
      icon: DollarSign,
      color: 'green'
    },
    {
      id: 'security-locked',
      title: 'Security Settings Lockdown',
      role: 'admin' as Role,
      description: 'See tiered security permissions',
      steps: [
        'Switch to Admin role',
        'Navigate to Configure → System Settings',
        'Click on "Security" tab',
        'See lock overlay - requires Security Admin'
      ],
      icon: Lock,
      color: 'red'
    },
    {
      id: 'security-unlocked',
      title: 'Platform Administrator',
      role: 'super-admin' as Role,
      description: 'Full platform access demonstration',
      steps: [
        'Switch to Super Admin role',
        'Navigate to Configure → System Settings → Security',
        'Full access to all security controls',
        'Notice permission badge at top'
      ],
      icon: Shield,
      color: 'purple'
    }
  ];

  const quickActions = [
    {
      id: 'matrix',
      label: 'View Permission Matrix',
      icon: Eye,
      action: () => setShowPermissionMatrix(true),
      description: 'Compare permissions across all roles'
    },
    {
      id: 'audit',
      label: 'View Audit Log',
      icon: FileText,
      action: () => setShowAuditLog(true),
      description: 'See activity tracking in action'
    },
    {
      id: 'billing',
      label: 'Test Billing Access',
      icon: DollarSign,
      action: () => {
        window.location.hash = '#/configure/billing';
        onClose();
      },
      description: 'Navigate to billing configuration'
    },
    {
      id: 'system',
      label: 'Test System Settings',
      icon: Settings,
      action: () => {
        window.location.hash = '#/configure/system';
        onClose();
      },
      description: 'Navigate to system settings'
    }
  ];

  const handleRunDemo = (scenario: typeof demoScenarios[0]) => {
    setRole(scenario.role);
    setSelectedDemo(scenario.id);

    window.addToast({
      type: 'info',
      title: `Demo: ${scenario.title}`,
      message: `Switched to ${scenario.role} role. ${scenario.description}`,
      duration: 5000
    });

    // Navigate based on scenario
    if (scenario.id.includes('billing')) {
      setTimeout(() => {
        window.location.hash = '#/configure/billing';
        onClose();
      }, 1000);
    } else if (scenario.id.includes('security')) {
      setTimeout(() => {
        window.location.hash = '#/configure/system';
        onClose();
      }, 1000);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">RBAC Demo Control Panel</h2>
                <p className="text-blue-100 text-sm">
                  Interactive demonstrations of role-based access control best practices
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Current Role Status */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Current Role</p>
                    <p className="text-lg font-bold text-blue-900 capitalize">{currentRole.replace('-', ' ')}</p>
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

              {/* Scope & Filter Information */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-200">
                <div>
                  <p className="text-xs text-blue-700 font-medium mb-1">Default Resource Filter</p>
                  <ResourceFilterBadge
                    filter={permissionChecker.getDefaultScope(currentRole)}
                    showIcon={true}
                  />
                </div>
                <div>
                  <p className="text-xs text-blue-700 font-medium mb-1">Maximum Filter Scope</p>
                  <ResourceFilterBadge
                    filter={permissionChecker.getMaxScope(currentRole)}
                    showIcon={true}
                  />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">Resource Filters</span> control <em>which</em> resources you can access within your scope.
                    <span className="font-semibold"> Scope paths</span> define <em>where</em> in the hierarchy your permissions apply.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg transition-all text-left group"
                    >
                      <div className="w-10 h-10 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                        <Icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                        <p className="text-xs text-gray-500">{action.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Demo Scenarios */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Guided Demo Scenarios
              </h3>
              <div className="space-y-3">
                {demoScenarios.map((scenario) => {
                  const Icon = scenario.icon;
                  const isActive = selectedDemo === scenario.id;
                  const colorClasses = {
                    blue: 'bg-blue-50 border-blue-300 text-blue-700',
                    green: 'bg-green-50 border-green-300 text-green-700',
                    red: 'bg-red-50 border-red-300 text-red-700',
                    purple: 'bg-purple-50 border-purple-300 text-purple-700'
                  }[scenario.color];

                  return (
                    <div
                      key={scenario.id}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">{scenario.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{scenario.description}</p>
                            </div>
                            <Button
                              variant={isActive ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => handleRunDemo(scenario)}
                            >
                              {isActive ? 'Running' : 'Run Demo'}
                            </Button>
                          </div>
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-700 mb-2">Steps:</p>
                            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                              {scenario.steps.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Role Switcher */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Manual Role Switch</h4>
              <div className="grid grid-cols-3 gap-3">
                {(['user', 'admin', 'super-admin'] as Role[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setRole(role)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      currentRole === role
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <p className={`text-sm font-semibold capitalize ${
                      currentRole === role ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      {role.replace('-', ' ')}
                    </p>
                    <PermissionBadge
                      requirement={{ permission: 'view', role }}
                      variant="compact"
                      showTooltip={false}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">
                💡 Tip: Run a demo scenario to see RBAC in action
              </p>
              <Button variant="outline" onClick={onClose}>
                Close Panel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Matrix Modal */}
      <RoleCapabilityMatrix
        isOpen={showPermissionMatrix}
        onClose={() => setShowPermissionMatrix(false)}
        currentRole={currentRole}
      />

      {/* Audit Log Panel */}
      <AuditLogPanel
        isOpen={showAuditLog}
        onClose={() => setShowAuditLog(false)}
      />
    </>
  );
}
