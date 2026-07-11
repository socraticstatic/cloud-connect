import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Users, Palette, ToggleLeft, Activity, Settings, Eye } from 'lucide-react';
import { Button } from '../common/Button';
import { TabGroup } from '../navigation/TabGroup';
import { mockTenants } from '../../data/mockTenants';
import { BrandingCustomization } from './BrandingCustomization';

export function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const tenant = mockTenants.find((t) => t.id === id);

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <p className="text-fw-bodyLight">Tenant not found</p>
        <Button
          variant="outline"
          onClick={() => navigate('/configure/platform')}
          className="mt-4"
        >
          Back to Tenants
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Building2 className="h-5 w-5 mr-2" /> },
    { id: 'users', label: 'Users', icon: <Users className="h-5 w-5 mr-2" /> },
    { id: 'branding', label: 'Branding', icon: <Palette className="h-5 w-5 mr-2" /> },
    { id: 'features', label: 'Features', icon: <ToggleLeft className="h-5 w-5 mr-2" /> },
    { id: 'activity', label: 'Activity Log', icon: <Activity className="h-5 w-5 mr-2" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5 mr-2" /> },
  ];

  const mockFeatures = [
    { id: 'api-toolbox', name: 'API Toolbox', description: 'Advanced API integration tools', enabled: true },
    { id: 'advanced-monitoring', name: 'Advanced Monitoring', description: 'Real-time network monitoring', enabled: true },
    { id: 'hub', name: 'Hub', description: 'Multi-cloud routing capabilities', enabled: true },
    { id: 'vnf-management', name: 'VNF Management', description: 'Virtual network function management', enabled: false },
    { id: 'custom-policies', name: 'Custom Policies', description: 'Create custom routing policies', enabled: true },
    { id: 'white-labeling', name: 'White Labeling', description: 'Custom branding options', enabled: tenant.plan === 'enterprise' },
  ];

  const mockUsers = [
    { id: '1', name: 'John Smith', email: 'john@example.com', role: 'User', status: 'active', lastActive: '2 hours ago' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Admin', status: 'active', lastActive: '1 day ago' },
    { id: '3', name: 'Michael Patel', email: 'michael@example.com', role: 'User', status: 'active', lastActive: '3 hours ago' },
  ];

  const mockActivityLog = [
    { timestamp: '2025-11-12 14:32', user: 'Emilio Estevez', action: 'Updated tenant settings', details: 'Changed plan to Enterprise' },
    { timestamp: '2025-11-11 09:15', user: tenant.adminName, action: 'Added new user', details: 'Added John Smith' },
    { timestamp: '2025-11-10 16:45', user: tenant.adminName, action: 'Modified branding', details: 'Updated logo and colors' },
    { timestamp: '2025-11-09 11:20', user: 'System', action: 'Backup completed', details: 'Automated backup successful' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/configure/platform')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-figma-xl font-bold text-fw-heading tracking-[-0.03em]">{tenant.name}</h1>
            <p className="text-figma-sm font-medium text-fw-bodyLight mt-1">{tenant.subdomain}.att-netbond.com</p>
          </div>
        </div>
        <Button variant="primary" icon={Eye}>
          View as Tenant Admin
        </Button>
      </div>

      {/* Tabs */}
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-fw-base rounded-2xl border border-fw-secondary p-6">
                <h3 className="text-figma-sm font-medium text-fw-bodyLight mb-4">Tenant Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-figma-sm font-medium text-fw-bodyLight">Tenant ID</dt>
                    <dd className="text-figma-base font-medium text-fw-heading tracking-[-0.03em] mt-1">{tenant.id}</dd>
                  </div>
                  <div>
                    <dt className="text-figma-sm font-medium text-fw-bodyLight">Created</dt>
                    <dd className="text-figma-base font-medium text-fw-heading tracking-[-0.03em] mt-1">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-figma-sm font-medium text-fw-bodyLight">Last Activity</dt>
                    <dd className="text-figma-base font-medium text-fw-heading tracking-[-0.03em] mt-1">
                      {new Date(tenant.lastActivity).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-figma-sm font-medium text-fw-bodyLight">Plan</dt>
                    <dd className="text-figma-base font-medium text-fw-heading tracking-[-0.03em] mt-1 capitalize">{tenant.plan}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-fw-base rounded-2xl border border-fw-secondary p-6">
                <h3 className="text-figma-sm font-medium text-fw-bodyLight mb-4">Admin Contact</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-figma-sm font-medium text-fw-bodyLight">Name</dt>
                    <dd className="text-figma-base font-medium text-fw-heading tracking-[-0.03em] mt-1">{tenant.adminName}</dd>
                  </div>
                  <div>
                    <dt className="text-figma-sm font-medium text-fw-bodyLight">Email</dt>
                    <dd className="text-figma-base font-medium text-fw-heading tracking-[-0.03em] mt-1">{tenant.adminEmail}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-fw-base rounded-2xl border border-fw-secondary p-6">
                <h3 className="text-figma-sm font-medium text-fw-bodyLight mb-4">Usage Statistics</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-figma-sm font-medium text-fw-bodyLight">Total Users</dt>
                    <dd className="text-figma-base font-medium text-fw-heading tracking-[-0.03em] mt-1">{tenant.userCount}</dd>
                  </div>
                  <div>
                    <dt className="text-figma-sm font-medium text-fw-bodyLight">Active Connections</dt>
                    <dd className="text-figma-base font-medium text-fw-heading tracking-[-0.03em] mt-1">{tenant.connectionCount}</dd>
                  </div>
                  <div>
                    <dt className="text-figma-sm font-medium text-fw-bodyLight">Storage Used</dt>
                    <dd className="text-figma-base font-medium text-fw-heading tracking-[-0.03em] mt-1">12.4 GB</dd>
                  </div>
                  <div>
                    <dt className="text-figma-sm font-medium text-fw-bodyLight">API Calls (30d)</dt>
                    <dd className="text-figma-base font-medium text-fw-heading tracking-[-0.03em] mt-1">45,231</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-fw-base rounded-2xl border border-fw-secondary">
            <div className="p-6 border-b border-fw-secondary">
              <div className="flex items-center justify-between">
                <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em]">Tenant Users</h3>
                <Button variant="primary" size="sm">
                  Add User
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-fw-wash">
                  <tr>
                    <th className="px-6 h-12 text-left text-[14px] font-medium text-fw-heading">
                      Name
                    </th>
                    <th className="px-6 h-12 text-left text-[14px] font-medium text-fw-heading">
                      Email
                    </th>
                    <th className="px-6 h-12 text-left text-[14px] font-medium text-fw-heading">
                      Role
                    </th>
                    <th className="px-6 h-12 text-left text-[14px] font-medium text-fw-heading">
                      Status
                    </th>
                    <th className="px-6 h-12 text-left text-[14px] font-medium text-fw-heading">
                      Last Active
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-fw-base divide-y divide-fw-secondary">
                  {mockUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-fw-wash transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-figma-base font-medium text-fw-heading tracking-[-0.03em]">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-figma-base font-medium text-fw-body">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-figma-base font-medium text-fw-body">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-figma-sm font-medium bg-fw-successLight text-fw-success">
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-figma-base font-medium text-fw-bodyLight">
                        {user.lastActive}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'branding' && <BrandingCustomization tenant={tenant} />}

        {activeTab === 'features' && (
          <div className="bg-fw-base rounded-2xl border border-fw-secondary p-6">
            <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em] mb-6">Feature Toggles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-fw-secondary"
                >
                  <div className="flex-1">
                    <h4 className="text-figma-base font-medium text-fw-heading tracking-[-0.03em]">{feature.name}</h4>
                    <p className="text-figma-sm font-medium text-fw-bodyLight mt-1">{feature.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={feature.enabled}
                      onChange={() => {
                        window.addToast({
                          type: 'success',
                          title: 'Feature Updated',
                          message: `${feature.name} ${feature.enabled ? 'disabled' : 'enabled'}`,
                          duration: 3000,
                        });
                      }}
                    />
                    <div className="w-11 h-6 bg-fw-neutral peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-fw-active rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-fw-secondary after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fw-active"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-fw-base rounded-2xl border border-fw-secondary">
            <div className="p-6 border-b border-fw-secondary">
              <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em]">Activity Log</h3>
            </div>
            <div className="divide-y divide-fw-secondary">
              {mockActivityLog.map((log, index) => (
                <div key={index} className="p-6 hover:bg-fw-wash transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <p className="text-figma-base font-medium text-fw-heading tracking-[-0.03em]">{log.action}</p>
                        <span className="text-figma-sm font-medium text-fw-bodyLight">{log.timestamp}</span>
                      </div>
                      <p className="text-figma-base font-medium text-fw-body mt-1">{log.details}</p>
                      <p className="text-figma-sm font-medium text-fw-bodyLight mt-1">by {log.user}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-fw-base rounded-2xl border border-fw-secondary p-6">
            <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em] mb-6">Tenant Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-figma-base font-medium text-fw-body tracking-[-0.03em] mb-2">Tenant Name</label>
                <input
                  type="text"
                  defaultValue={tenant.name}
                  className="w-full px-3 h-9 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                />
              </div>

              <div>
                <label className="block text-figma-base font-medium text-fw-body tracking-[-0.03em] mb-2">Subdomain</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    defaultValue={tenant.subdomain}
                    className="flex-1 px-3 h-9 border border-fw-secondary rounded-l-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                  />
                  <span className="px-4 py-2 bg-fw-wash border border-l-0 border-fw-secondary rounded-r-lg text-figma-base font-medium text-fw-bodyLight">
                    .att-netbond.com
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-fw-secondary">
                <h4 className="text-figma-base font-medium text-fw-heading tracking-[-0.03em] mb-4">Danger Zone</h4>
                <div className="space-y-3">
                  <Button variant="outline-danger" className="w-full">
                    Suspend Tenant
                  </Button>
                  <Button variant="outline-danger" className="w-full">
                    Delete Tenant
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
