import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Activity,
  Settings,
  Network,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from '../common/Button';
import { IconButton } from '../common/IconButton';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { MetricCard } from '../common/MetricCard';
import { getVNFTypeIcon, getVNFTypeInfo } from '../../utils/vnfTypes';

export function VNFDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'configuration' | 'performance'>('overview');
  const [vnf, setVNF] = useState<any>(null);
  const [parentConnection, setParentConnection] = useState<any>(null);

  useEffect(() => {
    setVNF({
      id,
      name: 'Edge Firewall',
      type: 'firewall',
      vendor: 'Palo Alto Networks',
      model: 'VM-Series',
      version: '10.2.3',
      status: 'active',
      throughput: '5 Gbps',
      licenseExpiry: '2025-06-30T00:00:00Z',
      description: 'Primary edge firewall for cloud connectivity',
      connectionId: 'conn-1',
      cloudRouterId: 'router-1',
      configuration: {
        interfaces: [
          { id: 'if-1', name: 'WAN1', type: 'wan', ipAddress: '203.0.113.10', status: 'up' },
          { id: 'if-2', name: 'LAN1', type: 'lan', ipAddress: '10.0.0.1', status: 'up' }
        ],
        routingProtocols: ['BGP', 'OSPF'],
        highAvailability: true,
        managementIP: '192.168.1.10'
      },
      performance: {
        cpuUsage: 45,
        memoryUsage: 62,
        activeSessions: 1250,
        maxSessions: 5000,
        throughput: '3.2 Gbps',
        latency: '2ms'
      },
      createdAt: '2024-01-10T12:00:00Z'
    });
  }, [id]);

  if (!vnf) {
    return null;
  }

  const vnfTypeInfo = getVNFTypeInfo(vnf.type);
  const VNFIcon = getVNFTypeIcon(vnf.type);

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    navigate('/connections');
    window.addToast({
      type: 'success',
      title: 'VNF Deleted',
      message: 'VNF has been successfully deleted.',
      duration: 3000
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <VNFIcon className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">{vnf.name}</h1>
              </div>
              {vnf.description && (
                <p className="mt-2 text-gray-600">{vnf.description}</p>
              )}
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <StatusBadge
                  status={vnf.status}
                  label={vnf.status.charAt(0).toUpperCase() + vnf.status.slice(1)}
                />
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {vnfTypeInfo.label}
                </span>
                <span className="text-sm text-gray-500">Vendor: {vnf.vendor}</span>
                {vnf.model && <span className="text-sm text-gray-500">Model: {vnf.model}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <IconButton
                icon={Edit2}
                label="Edit VNF"
                onClick={() => {}}
              />
              <IconButton
                icon={Trash2}
                label="Delete VNF"
                onClick={() => setShowDeleteConfirm(true)}
                variant="danger"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="CPU Usage"
            value={`${vnf.performance?.cpuUsage || 0}%`}
            icon={Activity}
            trend={{
              value: vnf.performance?.cpuUsage > 75 ? 'High' : 'Normal',
              isPositive: vnf.performance?.cpuUsage <= 75
            }}
          />
          <MetricCard
            title="Memory Usage"
            value={`${vnf.performance?.memoryUsage || 0}%`}
            icon={Activity}
          />
          <MetricCard
            title="Active Sessions"
            value={vnf.performance?.activeSessions?.toLocaleString() || '0'}
            icon={Network}
            trend={vnf.performance?.maxSessions ? {
              value: `of ${vnf.performance.maxSessions.toLocaleString()}`,
              isPositive: true
            } : undefined}
          />
          <MetricCard
            title="Throughput"
            value={vnf.performance?.throughput || 'N/A'}
            icon={Activity}
          />
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Settings },
                { id: 'configuration', label: 'Configuration', icon: Settings },
                { id: 'performance', label: 'Performance', icon: Activity }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">VNF Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">VNF ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{vnf.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{vnfTypeInfo.label}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Vendor</dt>
                    <dd className="mt-1 text-sm text-gray-900">{vnf.vendor}</dd>
                  </div>
                  {vnf.model && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Model</dt>
                      <dd className="mt-1 text-sm text-gray-900">{vnf.model}</dd>
                    </div>
                  )}
                  {vnf.version && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Version</dt>
                      <dd className="mt-1 text-sm text-gray-900">{vnf.version}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Throughput Capacity</dt>
                    <dd className="mt-1 text-sm text-gray-900">{vnf.throughput}</dd>
                  </div>
                  {vnf.licenseExpiry && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">License Expiry</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(vnf.licenseExpiry).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <StatusBadge
                        status={vnf.status}
                        label={vnf.status.charAt(0).toUpperCase() + vnf.status.slice(1)}
                      />
                    </dd>
                  </div>
                </dl>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {vnfTypeInfo.commonFeatures.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'configuration' && (
          <div className="space-y-6">
            {vnf.configuration?.interfaces && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Network Interfaces</h3>
                  <div className="space-y-4">
                    {vnf.configuration.interfaces.map((iface: any) => (
                      <div key={iface.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{iface.name}</h4>
                          <StatusBadge
                            status={iface.status === 'up' ? 'active' : 'inactive'}
                            label={iface.status.toUpperCase()}
                          />
                        </div>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Type</dt>
                            <dd className="mt-1 text-sm text-gray-900 uppercase">{iface.type}</dd>
                          </div>
                          {iface.ipAddress && (
                            <div>
                              <dt className="text-xs font-medium text-gray-500">IP Address</dt>
                              <dd className="mt-1 text-sm text-gray-900 font-mono">{iface.ipAddress}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vnf.configuration?.managementIP && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Management IP</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono">
                        {vnf.configuration.managementIP}
                      </dd>
                    </div>
                  )}
                  {vnf.configuration?.highAvailability !== undefined && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">High Availability</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vnf.configuration.highAvailability ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {vnf.configuration.highAvailability ? 'Enabled' : 'Disabled'}
                        </span>
                      </dd>
                    </div>
                  )}
                  {vnf.configuration?.routingProtocols && (
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 mb-2">Routing Protocols</dt>
                      <dd className="mt-1">
                        <div className="flex flex-wrap gap-2">
                          {vnf.configuration.routingProtocols.map((protocol: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {protocol}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">CPU Usage</dt>
                    <dd className="mt-2 text-3xl font-semibold text-gray-900">
                      {vnf.performance?.cpuUsage || 0}%
                    </dd>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${vnf.performance?.cpuUsage || 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Memory Usage</dt>
                    <dd className="mt-2 text-3xl font-semibold text-gray-900">
                      {vnf.performance?.memoryUsage || 0}%
                    </dd>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${vnf.performance?.memoryUsage || 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Throughput</dt>
                    <dd className="mt-2 text-3xl font-semibold text-gray-900">
                      {vnf.performance?.throughput || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Latency</dt>
                    <dd className="mt-2 text-3xl font-semibold text-gray-900">
                      {vnf.performance?.latency || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Active Sessions</dt>
                    <dd className="mt-2 text-3xl font-semibold text-gray-900">
                      {vnf.performance?.activeSessions?.toLocaleString() || 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Max Sessions</dt>
                    <dd className="mt-2 text-3xl font-semibold text-gray-900">
                      {vnf.performance?.maxSessions?.toLocaleString() || 0}
                    </dd>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete VNF"
        message={`Are you sure you want to delete "${vnf.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
