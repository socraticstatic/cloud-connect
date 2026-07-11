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
    { id: 'cloud-router', name: 'Cloud Router', description: 'Multi-cloud routing capabilities', enabled: true },
    { id: 'vnf-management', name: 'VNF Management', description: 'Virtual network function management', enabled: false },
    { id: 'custom-policies', name: 'Custom Policies', description: 'Create custom routing policies', enabled: true },
    { id: 'white-labeling', name: 'White Labeling', description: 'Custom branding options', enabled: tenant.plan === 'enterprise' },
  ];

  const mockUsers = [
    { id: '1', name: 'John Smith', email: 'john@example.com', role: 'User', status: 'active', lastActive: '2 hours ago' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Admin', status: 'active', lastActive: '1 day ago' },
    { id: '3', name: 'Michael Chen', email: 'michael@example.com', role: 'User', status: 'active', lastActive: '3 hours ago' },
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
            <h1 className="text-2xl font-bold text-fw-heading">{tenant.name}</h1>
            <p className="text-sm text-fw-bodyLight mt-1">{tenant.subdomain}.att-netbond.com</p>
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
              <div className="bg-fw-base rounded-lg border border-fw-secondary p-6">
                <h3 className="text-sm font-medium text-fw-bodyLight mb-4">Tenant Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs text-fw-bodyLight">Tenant ID</dt>
                    <dd className="text-sm font-medium text-fw-heading mt-1">{tenant.id}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-fw-bodyLight">Created</dt>
                    <dd className="text-sm font-medium text-fw-heading mt-1">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-fw-bodyLight">Last Activity</dt>
                    <dd className="text-sm font-medium text-fw-heading mt-1">
                      {new Date(tenant.lastActivity).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-fw-bodyLight">Plan</dt>
                    <dd className="text-sm font-medium text-fw-heading mt-1 capitalize">{tenant.plan}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-fw-base rounded-lg border border-fw-secondary p-6">
                <h3 className="text-sm font-medium text-fw-bodyLight mb-4">Admin Contact</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs text-fw-bodyLight">Name</dt>
                    <dd className="text-sm font-medium text-fw-heading mt-1">{tenant.adminName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-fw-bodyLight">Email</dt>
                    <dd className="text-sm font-medium text-fw-heading mt-1">{tenant.adminEmail}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-fw-base rounded-lg border border-fw-secondary p-6">
                <h3 className="text-sm font-medium text-fw-bodyLight mb-4">Usage Statistics</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs text-fw-bodyLight">Total Users</dt>
                    <dd className="text-sm font-medium text-fw-heading mt-1">{tenant.userCount}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-fw-bodyLight">Active Connections</dt>
                    <dd className="text-sm font-medium text-fw-heading mt-1">{tenant.connectionCount}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-fw-bodyLight">Storage Used</dt>
                    <dd className="text-sm font-medium text-fw-heading mt-1">12.4 GB</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-fw-bodyLight">API Calls (30d)</dt>
                    <dd className="text-sm font-medium text-fw-heading mt-1">45,231</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-fw-base rounded-lg border border-fw-secondary">
            <div className="p-6 border-b border-fw-secondary">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-fw-heading">Tenant Users</h3>
                <Button variant="primary" size="sm">
                  Add User
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-fw-wash">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-fw-bodyLight uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-fw-bodyLight uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-fw-bodyLight uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-fw-bodyLight uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-fw-bodyLight uppercase tracking-wider">
                      Last Active
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-fw-base divide-y divide-fw-secondary">
                  {mockUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-fw-heading">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-fw-body">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-fw-body">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-fw-bodyLight">
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
          <div className="bg-fw-base rounded-lg border border-fw-secondary p-6">
            <h3 className="text-lg font-medium text-fw-heading mb-6">Feature Toggles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-fw-secondary"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-fw-heading">{feature.name}</h4>
                    <p className="text-xs text-fw-bodyLight mt-1">{feature.description}</p>
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-fw-base rounded-lg border border-fw-secondary">
            <div className="p-6 border-b border-fw-secondary">
              <h3 className="text-lg font-medium text-fw-heading">Activity Log</h3>
            </div>
            <div className="divide-y divide-fw-secondary">
              {mockActivityLog.map((log, index) => (
                <div key={index} className="p-6 hover:bg-fw-wash transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-fw-heading">{log.action}</p>
                        <span className="text-xs text-fw-bodyLight">{log.timestamp}</span>
                      </div>
                      <p className="text-sm text-fw-body mt-1">{log.details}</p>
                      <p className="text-xs text-fw-bodyLight mt-1">by {log.user}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-fw-base rounded-lg border border-fw-secondary p-6">
            <h3 className="text-lg font-medium text-fw-heading mb-6">Tenant Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-fw-body mb-2">Tenant Name</label>
                <input
                  type="text"
                  defaultValue={tenant.name}
                  className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-fw-body mb-2">Subdomain</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    defaultValue={tenant.subdomain}
                    className="flex-1 px-4 py-2 border border-fw-secondary rounded-l-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  />
                  <span className="px-4 py-2 bg-fw-wash border border-l-0 border-fw-secondary rounded-r-lg text-sm text-fw-bodyLight">
                    .att-netbond.com
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-fw-secondary">
                <h4 className="text-sm font-medium text-fw-heading mb-4">Danger Zone</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full text-yellow-600 border-yellow-300 hover:bg-yellow-50">
                    Suspend Tenant
                  </Button>
                  <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
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
