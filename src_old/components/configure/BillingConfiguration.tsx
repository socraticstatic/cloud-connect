import { useState } from 'react';
import { Building2, DollarSign, Users, Settings, Shield, Lock, Eye, FileText } from 'lucide-react';
import { VerticalTabGroup } from '../navigation/VerticalTabGroup';
import { TabItem } from '../../types/navigation';
import { Button } from '../common/Button';
import { PermissionBadge } from '../common/PermissionBadge';
import { useStore } from '../../store/useStore';
import { PermissionRequestModal } from '../common/PermissionRequestModal';
import { AuditLogPanel } from '../common/AuditLogPanel';
import { permissionChecker } from '../../utils/permissionChecker';

interface BillingConfigurationProps {
  defaultTab?: 'hierarchy' | 'allocation' | 'integration' | 'policies';
}

export function BillingConfiguration({ defaultTab = 'hierarchy' }: BillingConfigurationProps) {
  const [activeView, setActiveView] = useState<'hierarchy' | 'allocation' | 'integration' | 'policies'>(defaultTab);
  const { currentRole } = useStore();
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [requestedFeature, setRequestedFeature] = useState('');

  // Check permissions for billing operations
  const canViewBilling = permissionChecker.hasPermission(currentRole, { permission: 'view', resource: 'billing' });
  const canManageBilling = permissionChecker.hasPermission(currentRole, { permission: 'manage_billing', resource: 'billing' });
  const canModifyPayment = permissionChecker.hasPermission(currentRole, {
    permission: 'manage_billing',
    resource: 'billing',
    requiresMFA: true
  });

  const [hierarchy, setHierarchy] = useState({
    enableTenantHierarchy: true,
    allowSubtenantCreation: true,
    inheritBillingFromParent: false,
    consolidatedBilling: true,
    maxSubtenantLevels: 3
  });

  const [allocation, setAllocation] = useState({
    defaultAllocationMethod: 'pool',
    enableChargebacks: true,
    allowCostCenterOverride: false,
    requireBudgetApproval: true,
    enableShowback: true
  });

  const [integration, setIntegration] = useState({
    enableBusinessCenterIntegration: false,
    businessCenterAccountId: '',
    syncBillingData: false,
    syncFrequency: 'daily',
    showBusinessCenterData: false
  });

  const [policies, setPolicies] = useState({
    requirePONumbers: false,
    enableBudgetAlerts: true,
    budgetAlertThreshold: 80,
    allowOverageCharges: true,
    requireApprovalForOverages: true
  });

  const handleSaveSettings = () => {
    window.addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Billing configuration updated successfully',
      duration: 3000
    });
  };

  const tabs: TabItem[] = [
    { id: 'hierarchy', label: 'Tenant Hierarchy', icon: <Building2 className="h-5 w-5 mr-2" /> },
    { id: 'allocation', label: 'Cost Allocation', icon: <DollarSign className="h-5 w-5 mr-2" /> },
    { id: 'integration', label: 'External Integration', icon: <Users className="h-5 w-5 mr-2" /> },
    { id: 'policies', label: 'Billing Policies', icon: <Settings className="h-5 w-5 mr-2" /> }
  ];

  const handleRequestAccess = (feature: string) => {
    setRequestedFeature(feature);
    setShowPermissionRequest(true);
  };

  return (
    <div className="p-6">
      {/* Permission & Audit Controls */}
      <div className="mb-4 flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          icon={Eye}
          onClick={() => window.addToast({ type: 'info', title: 'Your Permissions', message: `Current Role: ${currentRole}\nBilling Access: ${canManageBilling.allowed ? 'Full' : 'View Only'}`, duration: 5000 })}
        >
          My Permissions
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={FileText}
          onClick={() => setShowAuditLog(true)}
        >
          View Audit Log
        </Button>
      </div>

      {/* Permission Warning Banner */}
      {!canManageBilling.allowed && (
        <div className="mb-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900 mb-1">Limited Billing Access</h3>
              <p className="text-xs text-yellow-700 mb-2">
                You can view billing settings but cannot make changes. {canManageBilling.reason}
              </p>
              <div className="flex items-center gap-2">
                <PermissionBadge requirement={{ permission: 'manage_billing', resource: 'billing' }} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRequestAccess('Billing Configuration')}
                >
                  Request Access
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Banner */}
      <div className="mb-6 bg-gradient-to-r from-fw-wash to-fw-base border border-fw-secondary rounded-lg p-4">
        <div className="flex items-start">
          <Building2 className="h-6 w-6 text-fw-link mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-fw-heading">Enterprise Billing Configuration</h3>
            <p className="text-sm text-fw-bodyLight mt-1">
              Configure account-wide billing settings, tenant hierarchy, cost allocation methods, and integration with external billing systems. These settings apply across your entire organization.
            </p>
          </div>
        </div>
      </div>

      <div className="flex">
        <VerticalTabGroup
          tabs={tabs}
          activeTab={activeView}
          onChange={(tab) => setActiveView(tab as typeof activeView)}
        />

        <div className="flex-1 pl-6">
          {/* Tenant Hierarchy */}
          {activeView === 'hierarchy' && (
            <div className="space-y-6">
              <div className="bg-fw-base rounded-lg border border-fw-secondary p-6">
                <h3 className="text-lg font-semibold text-fw-heading mb-4">Tenant & Client Account Hierarchy</h3>
                <p className="text-sm text-fw-bodyLight mb-6">
                  Configure how your organization's billing hierarchy is structured. This supports multi-tenant deployments and parent-child account relationships.
                </p>

                <div className="space-y-6">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={hierarchy.enableTenantHierarchy}
                      onChange={(e) => setHierarchy({...hierarchy, enableTenantHierarchy: e.target.checked})}
                      className="mt-1 h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-fw-body">Enable Tenant Hierarchy</span>
                      <p className="text-xs text-fw-bodyLight mt-1">Support parent-child tenant relationships for white-label deployments</p>
                    </div>
                  </label>

                  {hierarchy.enableTenantHierarchy && (
                    <>
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={hierarchy.allowSubtenantCreation}
                          onChange={(e) => setHierarchy({...hierarchy, allowSubtenantCreation: e.target.checked})}
                          className="mt-1 h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded"
                        />
                        <div>
                          <span className="text-sm font-medium text-fw-body">Allow Sub-Tenant Creation</span>
                          <p className="text-xs text-fw-bodyLight mt-1">Parent tenants can create and manage child tenant accounts</p>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={hierarchy.inheritBillingFromParent}
                          onChange={(e) => setHierarchy({...hierarchy, inheritBillingFromParent: e.target.checked})}
                          className="mt-1 h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded"
                        />
                        <div>
                          <span className="text-sm font-medium text-fw-body">Inherit Billing from Parent</span>
                          <p className="text-xs text-fw-bodyLight mt-1">Child tenants automatically inherit billing configuration from parent tenant</p>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={hierarchy.consolidatedBilling}
                          onChange={(e) => setHierarchy({...hierarchy, consolidatedBilling: e.target.checked})}
                          className="mt-1 h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded"
                        />
                        <div>
                          <span className="text-sm font-medium text-fw-body">Consolidated Billing</span>
                          <p className="text-xs text-fw-bodyLight mt-1">Roll up all child tenant charges to parent tenant's billing account</p>
                        </div>
                      </label>

                      <div>
                        <label className="block text-sm font-medium text-fw-body mb-2">Maximum Sub-Tenant Levels</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={hierarchy.maxSubtenantLevels}
                          onChange={(e) => setHierarchy({...hierarchy, maxSubtenantLevels: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link"
                        />
                        <p className="text-xs text-fw-bodyLight mt-1">Maximum depth of tenant hierarchy (1-10 levels)</p>
                      </div>
                    </>
                  )}

                  <div className="pt-4 border-t border-fw-secondary">
                    <h4 className="text-sm font-semibold text-fw-heading mb-3">Hierarchy Model</h4>
                    <div className="bg-fw-wash p-4 rounded-lg space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">🏢</div>
                        <div>
                          <p className="text-sm font-medium text-fw-body">Parent Tenant (White-Label Provider)</p>
                          <p className="text-xs text-fw-bodyLight">Master account with full administrative control</p>
                        </div>
                      </div>
                      <div className="ml-6 flex items-start space-x-3">
                        <div className="text-2xl">🏪</div>
                        <div>
                          <p className="text-sm font-medium text-fw-body">Child Tenant (Enterprise Customer)</p>
                          <p className="text-xs text-fw-bodyLight">Isolated account with dedicated resources and billing</p>
                        </div>
                      </div>
                      <div className="ml-12 flex items-start space-x-3">
                        <div className="text-2xl">👥</div>
                        <div>
                          <p className="text-sm font-medium text-fw-body">Sub-Tenant (Department/Division)</p>
                          <p className="text-xs text-fw-bodyLight">Organizational unit within enterprise customer</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <div className="flex items-center gap-2">
                    <PermissionBadge
                      requirement={{ permission: 'manage_billing', resource: 'billing' }}
                      variant="compact"
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleSaveSettings}
                    disabled={!canManageBilling.allowed}
                  >
                    {canManageBilling.allowed ? 'Save Hierarchy Settings' : 'View Only Mode'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Cost Allocation */}
          {activeView === 'allocation' && (
            <div className="space-y-6">
              <div className="bg-fw-base rounded-lg border border-fw-secondary p-6">
                <h3 className="text-lg font-semibold text-fw-heading mb-4">Cost Allocation & Chargeback</h3>
                <p className="text-sm text-fw-bodyLight mb-6">
                  Define how costs are allocated across departments, pools, and cost centers. Configure chargeback and showback reporting.
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-fw-body mb-2">Default Allocation Method</label>
                    <select
                      value={allocation.defaultAllocationMethod}
                      onChange={(e) => setAllocation({...allocation, defaultAllocationMethod: e.target.value})}
                      className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link"
                    >
                      <option value="pool">By Pool</option>
                      <option value="connection">By Connection</option>
                      <option value="costCenter">By Cost Center</option>
                      <option value="department">By Department</option>
                      <option value="project">By Project</option>
                      <option value="custom">Custom Allocation</option>
                    </select>
                    <p className="text-xs text-fw-bodyLight mt-1">How costs are distributed across organizational units</p>
                  </div>

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={allocation.enableChargebacks}
                      onChange={(e) => setAllocation({...allocation, enableChargebacks: e.target.checked})}
                      className="mt-1 h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-fw-body">Enable Chargeback</span>
                      <p className="text-xs text-fw-bodyLight mt-1">Allocate actual costs to departments/pools with billing responsibility</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={allocation.enableShowback}
                      onChange={(e) => setAllocation({...allocation, enableShowback: e.target.checked})}
                      className="mt-1 h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-fw-body">Enable Showback</span>
                      <p className="text-xs text-fw-bodyLight mt-1">Show cost allocation for reporting purposes without actual billing</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={allocation.allowCostCenterOverride}
                      onChange={(e) => setAllocation({...allocation, allowCostCenterOverride: e.target.checked})}
                      className="mt-1 h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-fw-body">Allow Cost Center Override</span>
                      <p className="text-xs text-fw-bodyLight mt-1">Users can override default cost center assignment (requires approval)</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={allocation.requireBudgetApproval}
                      onChange={(e) => setAllocation({...allocation, requireBudgetApproval: e.target.checked})}
                      className="mt-1 h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-fw-body">Require Budget Approval</span>
                      <p className="text-xs text-fw-bodyLight mt-1">New connections require approval if they exceed pool or department budgets</p>
                    </div>
                  </label>

                  <div className="pt-4 border-t border-fw-secondary">
                    <h4 className="text-sm font-semibold text-fw-heading mb-3">Allocation Rules</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-fw-wash rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-fw-body">Unallocated Resources</p>
                          <p className="text-xs text-fw-bodyLight">Resources without pool assignment</p>
                        </div>
                        <select className="text-sm border border-fw-secondary rounded px-2 py-1">
                          <option>Corporate General</option>
                          <option>IT Operations</option>
                          <option>Unassigned</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-fw-wash rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-fw-body">Shared Resources</p>
                          <p className="text-xs text-fw-bodyLight">Resources used by multiple pools</p>
                        </div>
                        <select className="text-sm border border-fw-secondary rounded px-2 py-1">
                          <option>Split Equally</option>
                          <option>By Usage</option>
                          <option>Primary Owner</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="primary" onClick={handleSaveSettings}>
                    Save Allocation Settings
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* External Integration */}
          {activeView === 'integration' && (
            <div className="space-y-6">
              <div className="bg-fw-base rounded-lg border border-fw-secondary p-6">
                <h3 className="text-lg font-semibold text-fw-heading mb-4">External Billing Integration</h3>
                <p className="text-sm text-fw-bodyLight mb-6">
                  Configure integration with external billing systems such as AT&T Business Center. Customers with existing SLAs can opt-in to display their billing data within this portal.
                </p>

                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">AT&T Business Center Integration</h4>
                        <p className="text-xs text-blue-700">
                          Connect to AT&T Business Center to sync billing data and display SLA information for customers with existing agreements.
                        </p>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={integration.enableBusinessCenterIntegration}
                      onChange={(e) => setIntegration({...integration, enableBusinessCenterIntegration: e.target.checked})}
                      className="mt-1 h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-fw-body">Enable Business Center Integration</span>
                      <p className="text-xs text-fw-bodyLight mt-1">Connect this portal to AT&T Business Center for billing synchronization</p>
                    </div>
                  </label>

                  {integration.enableBusinessCenterIntegration && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-fw-body mb-2">Business Center Account ID</label>
                        <input
                          type="text"
                          value={integration.businessCenterAccountId}
                          onChange={(e) => setIntegration({...integration, businessCenterAccountId: e.target.value})}
                          placeholder="Enter your Business Center Account ID"
                          className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link"
                        />
                        <p className="text-xs text-fw-bodyLight mt-1">Primary account identifier in AT&T Business Center</p>
                      </div>

                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={integration.syncBillingData}
                          onChange={(e) => setIntegration({...integration, syncBillingData: e.target.checked})}
                          className="mt-1 h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded"
                        />
                        <div>
                          <span className="text-sm font-medium text-fw-body">Sync Billing Data</span>
                          <p className="text-xs text-fw-bodyLight mt-1">Automatically synchronize invoices and billing data from Business Center</p>
                        </div>
                      </label>

                      {integration.syncBillingData && (
                        <div>
                          <label className="block text-sm font-medium text-fw-body mb-2">Sync Frequency</label>
                          <select
                            value={integration.syncFrequency}
                            onChange={(e) => setIntegration({...integration, syncFrequency: e.target.value})}
                            className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link"
                          >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="manual">Manual Only</option>
                          </select>
                        </div>
                      )}

                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={integration.showBusinessCenterData}
                          onChange={(e) => setIntegration({...integration, showBusinessCenterData: e.target.checked})}
                          className="mt-1 h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded"
                        />
                        <div>
                          <span className="text-sm font-medium text-fw-body">Display Business Center Data</span>
                          <p className="text-xs text-fw-bodyLight mt-1">Show Business Center SLA and billing information in this portal</p>
                        </div>
                      </label>

                      <div className="pt-4 border-t border-fw-secondary">
                        <h4 className="text-sm font-semibold text-fw-heading mb-3">Integration Status</h4>
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-sm text-green-900">Connected to Business Center</span>
                          </div>
                          <span className="text-xs text-green-700">Last sync: 2 hours ago</span>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button variant="outline">
                          Test Business Center Connection
                        </Button>
                      </div>
                    </>
                  )}

                  <div className="pt-4 border-t border-fw-secondary">
                    <h4 className="text-sm font-semibold text-fw-heading mb-3">Other Integrations</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-fw-wash rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-fw-body">Globus</p>
                          <p className="text-xs text-fw-bodyLight">Sync billing and invoicing with Globus</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-fw-wash rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-fw-body">SAP ERP Integration</p>
                          <p className="text-xs text-fw-bodyLight">Export billing data to SAP</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-fw-wash rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-fw-body">Oracle Financials</p>
                          <p className="text-xs text-fw-bodyLight">Sync with Oracle Cloud</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-fw-wash rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-fw-body">Custom API Endpoint</p>
                          <p className="text-xs text-fw-bodyLight">Send billing data to custom endpoint</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="primary" onClick={handleSaveSettings}>
                    Save Integration Settings
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Billing Policies */}
          {activeView === 'policies' && (
            <div className="space-y-6">
              <div className="bg-fw-base rounded-lg border border-fw-secondary p-6">
                <h3 className="text-lg font-semibold text-fw-heading mb-4">Billing Policies & Controls</h3>
                <p className="text-sm text-fw-bodyLight mb-6">
                  Configure account-wide billing policies, approval requirements, and budget controls.
                </p>

                <div className="space-y-6">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={policies.requirePONumbers}
                      onChange={(e) => setPolicies({...policies, requirePONumbers: e.target.checked})}
                      className="mt-1 h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-fw-body">Require Purchase Order Numbers</span>
                      <p className="text-xs text-fw-bodyLight mt-1">All billable resources must have an associated PO number</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={policies.enableBudgetAlerts}
                      onChange={(e) => setPolicies({...policies, enableBudgetAlerts: e.target.checked})}
                      className="mt-1 h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-fw-body">Enable Budget Alerts</span>
                      <p className="text-xs text-fw-bodyLight mt-1">Send notifications when spending approaches budget limits</p>
                    </div>
                  </label>

                  {policies.enableBudgetAlerts && (
                    <div>
                      <label className="block text-sm font-medium text-fw-body mb-2">Budget Alert Threshold (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={policies.budgetAlertThreshold}
                        onChange={(e) => setPolicies({...policies, budgetAlertThreshold: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link"
                      />
                      <p className="text-xs text-fw-bodyLight mt-1">Send alert when spending reaches this percentage of budget</p>
                    </div>
                  )}

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={policies.allowOverageCharges}
                      onChange={(e) => setPolicies({...policies, allowOverageCharges: e.target.checked})}
                      className="mt-1 h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-fw-body">Allow Overage Charges</span>
                      <p className="text-xs text-fw-bodyLight mt-1">Permit spending beyond allocated budgets (with optional approval)</p>
                    </div>
                  </label>

                  {policies.allowOverageCharges && (
                    <label className="flex items-start space-x-3 ml-7">
                      <input
                        type="checkbox"
                        checked={policies.requireApprovalForOverages}
                        onChange={(e) => setPolicies({...policies, requireApprovalForOverages: e.target.checked})}
                        className="mt-1 h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded"
                      />
                      <div>
                        <span className="text-sm font-medium text-fw-body">Require Approval for Overages</span>
                        <p className="text-xs text-fw-bodyLight mt-1">Overage charges must be approved before proceeding</p>
                      </div>
                    </label>
                  )}

                  <div className="pt-4 border-t border-fw-secondary">
                    <h4 className="text-sm font-semibold text-fw-heading mb-3">Billing Cycles</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-fw-body mb-2">Billing Period</label>
                        <select className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link">
                          <option>Monthly</option>
                          <option>Quarterly</option>
                          <option>Annually</option>
                          <option>Custom</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-fw-body mb-2">Billing Day</label>
                        <select className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link">
                          <option>1st of month</option>
                          <option>15th of month</option>
                          <option>Last day of month</option>
                          <option>Custom</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-fw-secondary">
                    <h4 className="text-sm font-semibold text-fw-heading mb-3">Invoice Preferences</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-fw-wash rounded-lg">
                        <span className="text-sm text-fw-body">Invoice Delivery Method</span>
                        <select className="text-sm border border-fw-secondary rounded px-2 py-1">
                          <option>Email</option>
                          <option>Portal Only</option>
                          <option>Both</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-fw-wash rounded-lg">
                        <span className="text-sm text-fw-body">Invoice Format</span>
                        <select className="text-sm border border-fw-secondary rounded px-2 py-1">
                          <option>PDF</option>
                          <option>Excel</option>
                          <option>CSV</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-fw-wash rounded-lg">
                        <span className="text-sm text-fw-body">Payment Terms</span>
                        <select className="text-sm border border-fw-secondary rounded px-2 py-1">
                          <option>Net 30</option>
                          <option>Net 60</option>
                          <option>Net 90</option>
                          <option>Due on Receipt</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="primary" onClick={handleSaveSettings}>
                    Save Billing Policies
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Permission Request Modal */}
      {showPermissionRequest && (
        <PermissionRequestModal
          isOpen={showPermissionRequest}
          onClose={() => setShowPermissionRequest(false)}
          requirement={{ permission: 'manage_billing', resource: 'billing' }}
          resourceName={requestedFeature}
        />
      )}

      {/* Audit Log Panel */}
      <AuditLogPanel
        isOpen={showAuditLog}
        onClose={() => setShowAuditLog(false)}
        filterByResource="Billing"
      />
    </div>
  );
}
