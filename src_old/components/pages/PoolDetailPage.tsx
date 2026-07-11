import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Users,
  Network,
  Activity,
  CreditCard,
  Settings,
  Plus,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from '../common/Button';
import { IconButton } from '../common/IconButton';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { MetricCard } from '../common/MetricCard';

export function PoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const groups = useStore(state => state.groups);
  const connections = useStore(state => state.connections);
  const users = useStore(state => state.users);
  const removeGroup = useStore(state => state.removeGroup);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'connections' | 'members' | 'performance'>('overview');

  const pool = groups.find(g => g.id === id);
  const poolConnections = connections.filter(c => c.pool === id);
  const poolUsers = users.filter(u => pool?.userIds.includes(u.id));

  useEffect(() => {
    if (!pool && id) {
      navigate('/groups');
    }
  }, [pool, id, navigate]);

  if (!pool) {
    return null;
  }

  const handleDelete = async () => {
    try {
      await removeGroup(pool.id);
      navigate('/groups');
      window.addToast({
        type: 'success',
        title: 'Pool Deleted',
        message: 'Pool has been successfully deleted.',
        duration: 3000
      });
    } catch (error) {
      window.addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete pool. Please try again.',
        duration: 3000
      });
    }
  };

  const totalBandwidth = poolConnections.reduce((total, conn) => {
    const bw = parseFloat(conn.bandwidth.replace(/[^\d.]/g, ''));
    return total + (isNaN(bw) ? 0 : bw);
  }, 0);

  const avgUtilization = poolConnections.reduce((total, conn) => {
    return total + (conn.performance?.bandwidthUtilization || 0);
  }, 0) / (poolConnections.length || 1);

  const activeConnections = poolConnections.filter(c => c.status === 'Active').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/groups')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Pools
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pool.name}</h1>
              {pool.description && (
                <p className="mt-2 text-gray-600">{pool.description}</p>
              )}
              <div className="mt-3 flex items-center gap-3">
                <StatusBadge
                  status={pool.status}
                  label={pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}
                />
                <span className="text-sm text-gray-500">Type: {pool.type}</span>
                <span className="text-sm text-gray-500">
                  Created {new Date(pool.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <IconButton
                icon={Edit2}
                label="Edit Pool"
                onClick={() => navigate(`/groups/${pool.id}/edit`)}
              />
              <IconButton
                icon={Trash2}
                label="Delete Pool"
                onClick={() => setShowDeleteConfirm(true)}
                variant="danger"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Connections"
            value={poolConnections.length.toString()}
            icon={Network}
            trend={activeConnections > 0 ? {
              value: `${activeConnections} active`,
              isPositive: true
            } : undefined}
          />
          <MetricCard
            title="Members"
            value={poolUsers.length.toString()}
            icon={Users}
          />
          <MetricCard
            title="Total Bandwidth"
            value={`${totalBandwidth} Gbps`}
            icon={Activity}
          />
          <MetricCard
            title="Avg Utilization"
            value={`${avgUtilization.toFixed(1)}%`}
            icon={CreditCard}
            trend={{
              value: avgUtilization > 75 ? 'High' : 'Normal',
              isPositive: avgUtilization <= 75
            }}
          />
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Settings },
                { id: 'connections', label: 'Connections', icon: Network },
                { id: 'members', label: 'Members', icon: Users },
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pool Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Pool ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{pool.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{pool.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <StatusBadge
                        status={pool.status}
                        label={pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(pool.createdAt).toLocaleString()}
                    </dd>
                  </div>
                  {pool.updatedAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(pool.updatedAt).toLocaleString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </Card>

            {pool.contacts && pool.contacts.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contacts</h3>
                  <div className="space-y-4">
                    {pool.contacts.map((contact, index) => (
                      <div key={index} className="flex items-start justify-between border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          <p className="text-sm text-gray-500">{contact.role}</p>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm text-gray-600">{contact.email}</p>
                            <p className="text-sm text-gray-600">{contact.phone}</p>
                          </div>
                        </div>
                        {contact.isPrimary && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'connections' && (
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Connections</h3>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={Plus}
                  onClick={() => navigate('/wizard')}
                >
                  Add Connection
                </Button>
              </div>

              {poolConnections.length === 0 ? (
                <div className="text-center py-12">
                  <Network className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No connections</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding a connection to this pool.
                  </p>
                  <div className="mt-6">
                    <Button
                      variant="primary"
                      leftIcon={Plus}
                      onClick={() => navigate('/wizard')}
                    >
                      Add Connection
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {poolConnections.map(connection => (
                    <Link
                      key={connection.id}
                      to={`/connections/${connection.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium text-gray-900">{connection.name}</h4>
                            <StatusBadge
                              status={connection.status.toLowerCase() as 'active' | 'inactive'}
                              label={connection.status}
                            />
                          </div>
                          <div className="mt-2 flex items-center gap-6 text-sm text-gray-500">
                            <span>{connection.type}</span>
                            <span>{connection.bandwidth}</span>
                            <span>{connection.location}</span>
                            {connection.provider && <span>{connection.provider}</span>}
                          </div>
                        </div>
                        <ExternalLink className="h-5 w-5 text-gray-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'members' && (
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Members</h3>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={Plus}
                  onClick={() => {}}
                >
                  Add Member
                </Button>
              </div>

              <div className="space-y-4">
                {poolUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-300 text-gray-700 font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 capitalize">{user.role}</span>
                  </div>
                ))}
              </div>
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
                    <dt className="text-sm font-medium text-gray-500">Avg Latency</dt>
                    <dd className="mt-2 text-3xl font-semibold text-gray-900">
                      {pool.performance?.aggregatedMetrics.averageLatency || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Avg Packet Loss</dt>
                    <dd className="mt-2 text-3xl font-semibold text-gray-900">
                      {pool.performance?.aggregatedMetrics.averagePacketLoss || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Avg Uptime</dt>
                    <dd className="mt-2 text-3xl font-semibold text-gray-900">
                      {pool.performance?.aggregatedMetrics.averageUptime || 'N/A'}
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
        title="Delete Pool"
        message={`Are you sure you want to delete "${pool.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
