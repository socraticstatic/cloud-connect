import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Network,
  Activity,
  Settings,
  GitBranch,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from '../common/Button';
import { IconButton } from '../common/IconButton';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { MetricCard } from '../common/MetricCard';

export function CloudRouterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const connections = useStore(state => state.connections);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'vnfs' | 'performance'>('overview');

  const [cloudRouter, setCloudRouter] = useState<any>(null);
  const [parentConnection, setParentConnection] = useState<any>(null);

  useEffect(() => {
    const foundConnection = connections.find(c =>
      c.id === id || (c as any).cloudRouters?.some((cr: any) => cr.id === id)
    );

    if (foundConnection) {
      setParentConnection(foundConnection);
      const router = (foundConnection as any).cloudRouters?.find((cr: any) => cr.id === id);
      if (router) {
        setCloudRouter(router);
      }
    } else {
      navigate('/connections');
    }
  }, [connections, id, navigate]);

  if (!cloudRouter || !parentConnection) {
    return null;
  }

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    navigate(`/connections/${parentConnection.id}`);
    window.addToast({
      type: 'success',
      title: 'Cloud Router Deleted',
      message: 'Cloud router has been successfully deleted.',
      duration: 3000
    });
  };

  const routerLinks = cloudRouter.links || [];
  const activeLinks = routerLinks.filter((l: any) => l.status === 'active').length;
  const totalBandwidth = routerLinks.reduce((total: number, link: any) => {
    const bw = parseFloat(link.bandwidth?.replace(/[^\d.]/g, '') || '0');
    return total + (isNaN(bw) ? 0 : bw);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/connections/${parentConnection.id}`)}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Connection
          </button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <GitBranch className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">{cloudRouter.name}</h1>
              </div>
              {cloudRouter.description && (
                <p className="mt-2 text-gray-600">{cloudRouter.description}</p>
              )}
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <StatusBadge
                  status={cloudRouter.status}
                  label={cloudRouter.status.charAt(0).toUpperCase() + cloudRouter.status.slice(1)}
                />
                <span className="inline-flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {cloudRouter.location}
                </span>
                {cloudRouter.vendor && (
                  <span className="text-sm text-gray-500">Vendor: {cloudRouter.vendor}</span>
                )}
                <Link
                  to={`/connections/${parentConnection.id}`}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Parent Connection
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <IconButton
                icon={Edit2}
                label="Edit Router"
                onClick={() => {}}
              />
              <IconButton
                icon={Trash2}
                label="Delete Router"
                onClick={() => setShowDeleteConfirm(true)}
                variant="danger"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Links"
            value={routerLinks.length.toString()}
            icon={Network}
            trend={activeLinks > 0 ? {
              value: `${activeLinks} active`,
              isPositive: true
            } : undefined}
          />
          <MetricCard
            title="Total Bandwidth"
            value={`${totalBandwidth} Gbps`}
            icon={Activity}
          />
          <MetricCard
            title="BGP Sessions"
            value={cloudRouter.performance?.bgpSessions?.total?.toString() || '0'}
            icon={GitBranch}
            trend={cloudRouter.performance?.bgpSessions?.active > 0 ? {
              value: `${cloudRouter.performance.bgpSessions.active} active`,
              isPositive: true
            } : undefined}
          />
          <MetricCard
            title="CPU Usage"
            value={`${cloudRouter.performance?.cpuUsage || 0}%`}
            icon={Activity}
            trend={{
              value: cloudRouter.performance?.cpuUsage > 75 ? 'High' : 'Normal',
              isPositive: cloudRouter.performance?.cpuUsage <= 75
            }}
          />
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Settings },
                { id: 'links', label: 'Links', icon: Network },
                { id: 'vnfs', label: 'VNFs', icon: GitBranch },
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Router Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Router ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{cloudRouter.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <StatusBadge
                        status={cloudRouter.status}
                        label={cloudRouter.status.charAt(0).toUpperCase() + cloudRouter.status.slice(1)}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">{cloudRouter.location}</dd>
                  </div>
                  {cloudRouter.vendor && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Vendor</dt>
                      <dd className="mt-1 text-sm text-gray-900">{cloudRouter.vendor}</dd>
                    </div>
                  )}
                  {cloudRouter.ipeName && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">IPE</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {cloudRouter.ipeName}
                        {cloudRouter.ipeLocation && ` (${cloudRouter.ipeLocation})`}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(cloudRouter.createdAt).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </Card>

            {cloudRouter.configuration && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cloudRouter.configuration.asn && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">ASN</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-mono">
                          {cloudRouter.configuration.asn}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-gray-500">BGP</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cloudRouter.configuration.bgpEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {cloudRouter.configuration.bgpEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </dd>
                    </div>
                    {cloudRouter.configuration.routeFilters && cloudRouter.configuration.routeFilters.length > 0 && (
                      <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-gray-500 mb-2">Route Filters</dt>
                        <dd className="mt-1">
                          <div className="flex flex-wrap gap-2">
                            {cloudRouter.configuration.routeFilters.map((filter: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {filter}
                              </span>
                            ))}
                          </div>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </Card>
            )}

            {cloudRouter.policies && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Policies</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cloudRouter.policies.routingPolicy && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Routing Policy</dt>
                        <dd className="mt-1 text-sm text-gray-900">{cloudRouter.policies.routingPolicy}</dd>
                      </div>
                    )}
                    {cloudRouter.policies.securityPolicy && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Security Policy</dt>
                        <dd className="mt-1 text-sm text-gray-900">{cloudRouter.policies.securityPolicy}</dd>
                      </div>
                    )}
                    {cloudRouter.policies.qosPolicy && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">QoS Policy</dt>
                        <dd className="mt-1 text-sm text-gray-900">{cloudRouter.policies.qosPolicy}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Links</h3>
              {routerLinks.length === 0 ? (
                <div className="text-center py-12">
                  <Network className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No links</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This router has no associated links.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {routerLinks.map((link: any) => (
                    <div
                      key={link.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium text-gray-900">{link.name}</h4>
                            <StatusBadge
                              status={link.status}
                              label={link.status.charAt(0).toUpperCase() + link.status.slice(1)}
                            />
                          </div>
                          <div className="mt-2 flex items-center gap-6 text-sm text-gray-500">
                            <span>VLAN {link.vlanId}</span>
                            {link.bandwidth && <span>{link.bandwidth}</span>}
                            {link.ipSubnet && <span>{link.ipSubnet}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Latency</dt>
                    <dd className="mt-2 text-3xl font-semibold text-gray-900">
                      {cloudRouter.performance?.latency || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Throughput</dt>
                    <dd className="mt-2 text-3xl font-semibold text-gray-900">
                      {cloudRouter.performance?.throughput || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">CPU Usage</dt>
                    <dd className="mt-2 text-3xl font-semibold text-gray-900">
                      {cloudRouter.performance?.cpuUsage || 0}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Memory Usage</dt>
                    <dd className="mt-2 text-3xl font-semibold text-gray-900">
                      {cloudRouter.performance?.memoryUsage || 0}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Routing Table Size</dt>
                    <dd className="mt-2 text-3xl font-semibold text-gray-900">
                      {cloudRouter.performance?.routingTableSize?.toLocaleString() || 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Packet Forwarding Rate</dt>
                    <dd className="mt-2 text-3xl font-semibold text-gray-900">
                      {cloudRouter.performance?.packetForwardingRate || 0} Mpps
                    </dd>
                  </div>
                </div>
              </div>
            </Card>

            {cloudRouter.performance?.bgpSessions && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">BGP Sessions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total</dt>
                      <dd className="mt-2 text-3xl font-semibold text-gray-900">
                        {cloudRouter.performance.bgpSessions.total}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Active</dt>
                      <dd className="mt-2 text-3xl font-semibold text-green-600">
                        {cloudRouter.performance.bgpSessions.active}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Idle</dt>
                      <dd className="mt-2 text-3xl font-semibold text-gray-400">
                        {cloudRouter.performance.bgpSessions.idle}
                      </dd>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Cloud Router"
        message={`Are you sure you want to delete "${cloudRouter.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
