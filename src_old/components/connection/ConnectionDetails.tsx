import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Cog, Play, Pause, Trash2, Edit2, Activity, Network, Users, Globe, Cloud } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { SubNav } from '../navigation/SubNav';
import { ConnectionTabs, ConnectionTabType } from './tabs/ConnectionTabs';
import { ConnectionOverview } from './tabs/ConnectionOverview';
import { RoutingTab } from './tabs/RoutingTab';
import { AccessConfiguration } from './tabs/AccessConfiguration';
import { VersioningConfiguration } from './tabs/VersioningConfiguration';
import { BillingConfiguration } from './tabs/BillingConfiguration';
import { ConnectionLogs } from '../configure/connections/ConnectionLogs';
import { NetworkTab } from './tabs/NetworkTab';
import { LinksTab } from './tabs/LinksTab';
import { VNFTab } from './tabs/VNFTab';
import { PoliciesTab } from './tabs/PoliciesTab';
import { APIConfiguration } from './tabs/APIConfiguration';
import { AppsConfiguration } from './tabs/AppsConfiguration';
import { IconButton } from '../common/IconButton';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useEditableField } from '../../hooks/useEditableField';
import { VNF } from '../../types/vnf';
import { CloudRouter } from '../../types/cloudrouter';
import { Link } from '../../types';
import { VNFModal } from './modals/VNFModal';
import { DeleteVNFModal } from './modals/DeleteVNFModal';
import { CloudRouterModal } from './cloudrouter/CloudRouterModal';
import { DeleteCloudRouterModal } from './cloudrouter/DeleteCloudRouterModal';
import { MobileConnectionDetails } from './MobileConnectionDetails';
import { useIsMobile } from '../../hooks/useMobileDetection';
import { useVNFSync } from '../../hooks/useVNFSync';
import { ConnectionEditWarning } from '../common/ConnectionEditWarning';

export function ConnectionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const connection = useStore(state => state.connections.find(c => c.id === id));
  const updateConnection = useStore(state => state.updateConnection);
  const removeConnection = useStore(state => state.removeConnection);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<ConnectionTabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // VNF state management
  const [showAddVNFModal, setShowAddVNFModal] = useState(false);
  const [editingVNF, setEditingVNF] = useState<VNF | undefined>();
  const [deletingVNF, setDeletingVNF] = useState<VNF | undefined>();
  const [vnfs, setVnfs] = useState<(VNF & { linkIds?: string[] })[]>([
    {
      id: 'vnf-1',
      name: 'Edge Firewall',
      type: 'firewall',
      vendor: 'Palo Alto Networks',
      model: 'VM-Series',
      version: '10.2.3',
      status: 'active',
      throughput: '5 Gbps',
      licenseExpiry: '2025-06-30T00:00:00Z',
      linkIds: ['link-1', 'link-2'],
      configuration: {
        interfaces: [
          { id: 'if-1', name: 'WAN1', type: 'wan', ipAddress: '203.0.113.10', subnetMask: '255.255.255.0', status: 'up' },
          { id: 'if-2', name: 'LAN1', type: 'lan', ipAddress: '10.0.0.1', subnetMask: '255.255.255.0', status: 'up' }
        ],
        routingProtocols: ['BGP', 'OSPF'],
        highAvailability: true,
        managementIP: '192.168.1.10'
      },
      createdAt: '2024-01-10T12:00:00Z',
      updatedAt: '2024-03-15T09:30:00Z',
      description: 'Primary edge firewall for cloud connectivity',
      connectionId: connection?.id.toString() || ''
    },
    {
      id: 'vnf-2',
      name: 'Branch SD-WAN',
      type: 'sdwan',
      vendor: 'Versa Networks',
      model: 'FlexVNF',
      version: '21.1.2',
      status: 'active',
      throughput: '2 Gbps',
      linkIds: ['link-3'],
      configuration: {
        interfaces: [
          { id: 'if-1', name: 'WAN1', type: 'wan', ipAddress: '203.0.113.20', subnetMask: '255.255.255.0', status: 'up' },
          { id: 'if-2', name: 'WAN2', type: 'wan', ipAddress: '198.51.100.20', subnetMask: '255.255.255.0', status: 'up' }
        ],
        routingProtocols: ['BGP'],
        highAvailability: false,
        managementIP: '192.168.1.20'
      },
      createdAt: '2024-01-15T14:30:00Z',
      updatedAt: '2024-02-20T10:15:00Z',
      description: 'SD-WAN for branch office connectivity',
      connectionId: connection?.id.toString() || ''
    },
    {
      id: 'vnf-3',
      name: 'Enterprise LMCC',
      type: 'lmcc',
      vendor: 'AT&T NetBond',
      model: 'Managed Cloud Connectivity',
      version: '2.1.0',
      status: 'active',
      throughput: '5 Gbps',
      linkIds: ['link-1', 'link-2'],
      configuration: {
        lmccConfiguration: {
          vnfId: 'vnf-3',
          selectedSites: ['site-sf', 'site-ny', 'site-chi', 'site-dal'],
          bandwidthAllocations: [
            { siteId: 'site-sf', bandwidth: 1000 },
            { siteId: 'site-ny', bandwidth: 1000 },
            { siteId: 'site-chi', bandwidth: 500 },
            { siteId: 'site-dal', bandwidth: 500 }
          ],
          taoConfig: {
            terminationType: 'bgp',
            bgpConfig: {
              localASN: 65000,
              remoteASN: 65001,
              authenticationKey: 'encrypted-key'
            },
            baseSubnet: '10.100.0.0/16',
            startingVlanId: 100,
            ipAllocations: [
              { siteId: 'site-sf', subnet: '10.100.0.0/24', vlanId: 100, gateway: '10.100.0.1' },
              { siteId: 'site-ny', subnet: '10.100.1.0/24', vlanId: 101, gateway: '10.100.1.1' },
              { siteId: 'site-chi', subnet: '10.100.2.0/24', vlanId: 102, gateway: '10.100.2.1' },
              { siteId: 'site-dal', subnet: '10.100.3.0/24', vlanId: 103, gateway: '10.100.3.1' }
            ],
            routingPolicy: 'dynamic',
            enableDefaultRoute: true
          },
          status: 'active',
          createdAt: '2024-02-01T10:00:00Z',
          updatedAt: '2024-02-26T14:30:00Z'
        }
      },
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-02-26T14:30:00Z',
      description: 'Layer 3 Managed Cloud Connectivity across 4 sites',
      connectionId: connection?.id.toString() || ''
    }
  ]);

  // Cloud Router state management
  const [showAddCloudRouterModal, setShowAddCloudRouterModal] = useState(false);
  const [editingCloudRouter, setEditingCloudRouter] = useState<CloudRouter | undefined>();
  const [deletingCloudRouter, setDeletingCloudRouter] = useState<CloudRouter | undefined>();
  const [cloudRouters, setCloudRouters] = useState<CloudRouter[]>([
    {
      id: 'cr-1',
      name: 'Primary Cloud Router',
      description: 'Main cloud router for US-East region',
      status: 'active',
      location: 'US-East',
      links: [
        {
          id: 'link-1',
          name: 'Production VLAN',
          vlanId: 100,
          status: 'active',
          ipSubnet: '10.1.0.0/24',
          bandwidth: '5 Gbps',
          description: 'Production traffic',
          cloudRouterIds: ['cr-1'],
          createdAt: '2024-01-10T00:00:00Z'
        },
        {
          id: 'link-2',
          name: 'Development VLAN',
          vlanId: 200,
          status: 'active',
          ipSubnet: '10.2.0.0/24',
          bandwidth: '2 Gbps',
          description: 'Development environment',
          cloudRouterIds: ['cr-1'],
          createdAt: '2024-01-15T00:00:00Z'
        }
      ],
      policies: {
        routingPolicy: 'default',
        securityPolicy: 'standard',
        qosPolicy: 'standard'
      },
      connectionId: connection?.id.toString() || '',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z'
    },
    {
      id: 'cr-2',
      name: 'Secondary Cloud Router',
      description: 'Backup router for redundancy',
      status: 'active',
      location: 'US-West',
      links: [
        {
          id: 'link-3',
          name: 'Backup VLAN',
          vlanId: 300,
          status: 'active',
          ipSubnet: '10.3.0.0/24',
          bandwidth: '3 Gbps',
          description: 'Backup link',
          cloudRouterIds: ['cr-2'],
          createdAt: '2024-02-01T00:00:00Z'
        },
        {
          id: 'link-4',
          name: 'Management VLAN',
          vlanId: 400,
          status: 'active',
          ipSubnet: '10.4.0.0/24',
          bandwidth: '1 Gbps',
          description: 'Management traffic',
          cloudRouterIds: ['cr-2'],
          createdAt: '2024-02-05T00:00:00Z'
        }
      ],
      policies: {
        routingPolicy: 'default',
        securityPolicy: 'standard',
        qosPolicy: 'standard'
      },
      connectionId: connection?.id.toString() || '',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-03-10T00:00:00Z'
    }
  ]);

  // Get all links from cloud routers
  const getAllLinks = (): Link[] => {
    return cloudRouters.flatMap((router) => router.links || []);
  };

  // Set up cross-window VNF synchronization
  useVNFSync({
    vnfs,
    cloudRouters,
    connectionId: connection?.id.toString() || '',
    onVNFsUpdate: setVnfs,
    onCloudRoutersUpdate: setCloudRouters
  });

  const {
    isEditing: isEditingName,
    value: newName,
    error: nameError,
    setValue: setNewName,
    handleStartEdit: startEditingName,
    handleSave: handleSaveName,
    handleCancel: handleCancelEdit
  } = useEditableField({
    initialValue: connection?.name || '',
    onSave: (name) => {
      if (connection) {
        updateConnection(connection.id, { name });
        window.addToast({
          type: 'success',
          title: 'Name Updated',
          message: 'Connection name has been updated successfully.',
          duration: 3000
        });
      }
    },
    validate: (name) => {
      if (!name.trim()) return 'Connection name cannot be empty';
    }
  });

  useEffect(() => {
    if (!connection) {
      navigate('/manage');
    }
  }, [connection, navigate]);

  if (!connection) return null;

  // Use mobile view if on mobile device
  if (isMobile) {
    return <MobileConnectionDetails connection={connection} />;
  }

  const handleToggleStatus = () => {
    const newStatus = connection.status === 'Active' ? 'Inactive' : 'Active';
    updateConnection(connection.id, { status: newStatus });

    window.addToast({
      type: 'success',
      title: 'Status Updated',
      message: `Connection is now ${newStatus}`,
      duration: 3000
    });
  };

  const handleDelete = () => {
    removeConnection(connection.id);
    navigate('/manage');

    window.addToast({
      type: 'success',
      title: 'Connection Deleted',
      message: 'Connection has been removed successfully.',
      duration: 3000
    });
  };

  // Cloud Router handlers
  const handleAddCloudRouter = () => {
    setEditingCloudRouter(undefined);
    setShowAddCloudRouterModal(true);
  };

  const handleEditCloudRouter = (cloudRouter: CloudRouter) => {
    setEditingCloudRouter(cloudRouter);
    setShowAddCloudRouterModal(true);
  };

  const handleDeleteCloudRouter = (cloudRouter: CloudRouter) => {
    setDeletingCloudRouter(cloudRouter);
  };

  const handleSaveCloudRouter = (cloudRouter: CloudRouter) => {
    if (editingCloudRouter) {
      setCloudRouters(cloudRouters.map((cr) => (cr.id === cloudRouter.id ? cloudRouter : cr)));
      window.addToast({
        type: 'success',
        title: 'Cloud Router Updated',
        message: `${cloudRouter.name} has been updated successfully.`,
        duration: 3000
      });
    } else {
      setCloudRouters([...cloudRouters, cloudRouter]);
      window.addToast({
        type: 'success',
        title: 'Cloud Router Created',
        message: `${cloudRouter.name} has been created successfully.`,
        duration: 3000
      });
    }
    setShowAddCloudRouterModal(false);
    setEditingCloudRouter(undefined);
  };

  const handleConfirmDeleteCloudRouter = () => {
    if (deletingCloudRouter) {
      setCloudRouters(cloudRouters.filter((cr) => cr.id !== deletingCloudRouter.id));
      window.addToast({
        type: 'success',
        title: 'Cloud Router Deleted',
        message: `${deletingCloudRouter.name} has been deleted successfully.`,
        duration: 3000
      });
      setDeletingCloudRouter(undefined);
    }
  };

  // VNF handlers
  const handleAddVNF = () => {
    setEditingVNF(undefined);
    setShowAddVNFModal(true);
  };

  const handleEditVNF = (vnf: VNF) => {
    setEditingVNF(vnf);
    setShowAddVNFModal(true);
  };

  const handleDeleteVNF = (vnf: VNF) => {
    setDeletingVNF(vnf);
  };

  const handleSaveVNF = (vnfData: VNF) => {
    if (editingVNF) {
      setVnfs(vnfs.map((v) => (v.id === vnfData.id ? vnfData : v)));
      window.addToast({
        type: 'success',
        title: 'VNF Updated',
        message: `${vnfData.name} has been updated successfully.`,
        duration: 3000
      });
    } else {
      setVnfs([...vnfs, vnfData]);
      window.addToast({
        type: 'success',
        title: 'VNF Created',
        message: `${vnfData.name} has been created successfully.`,
        duration: 3000
      });
    }
    setShowAddVNFModal(false);
    setEditingVNF(undefined);
  };

  const handleConfirmDeleteVNF = () => {
    if (deletingVNF) {
      setVnfs(vnfs.filter((v) => v.id !== deletingVNF.id));
      window.addToast({
        type: 'success',
        title: 'VNF Deleted',
        message: `${deletingVNF.name} has been deleted successfully.`,
        duration: 3000
      });
      setDeletingVNF(undefined);
    }
  };

  const renderContent = () => {
    const cloudRoutersCount = cloudRouters.length;
    const linksCount = getAllLinks().length;
    const vnfsCount = vnfs.length;

    switch (activeTab) {
      case 'overview':
        return <ConnectionOverview connection={connection} cloudRoutersCount={cloudRoutersCount} linksCount={linksCount} vnfsCount={vnfsCount} />;
      case 'cloudrouters':
        return (
          <NetworkTab
            connection={connection}
            cloudRouters={cloudRouters}
            vnfs={vnfs}
            onAddCloudRouter={handleAddCloudRouter}
            onEditCloudRouter={handleEditCloudRouter}
            onDeleteCloudRouter={handleDeleteCloudRouter}
            isEditing={isEditing}
          />
        );
      case 'links':
        return (
          <LinksTab
            connection={connection}
            cloudRouters={cloudRouters}
            allLinks={getAllLinks()}
            isEditing={isEditing}
          />
        );
      case 'vnfs':
        return (
          <VNFTab
            connection={connection}
            vnfs={vnfs}
            cloudRouters={cloudRouters}
            onAdd={handleAddVNF}
            onEdit={handleEditVNF}
            onDelete={handleDeleteVNF}
          />
        );
      case 'policies':
        return (
          <PoliciesTab
            connection={connection}
            cloudRouters={cloudRouters}
            vnfs={vnfs}
            allLinks={getAllLinks()}
          />
        );
      case 'access':
        return <AccessConfiguration />;
      case 'versions':
        return <VersioningConfiguration connectionId={connection.id.toString()} currentVersion="1.0.0" />;
      case 'billing':
        return <BillingConfiguration isEditing={isEditing} />;
      case 'logs':
        return <ConnectionLogs connectionId={connection.id.toString()} />;
      case 'api':
        return <APIConfiguration />;
      case 'apps':
        return <AppsConfiguration />;
      default:
        return <ConnectionOverview connection={connection} cloudRoutersCount={cloudRoutersCount} linksCount={linksCount} vnfsCount={vnfsCount} />;
    }
  };

  return (
    <div className="min-h-screen">
      <SubNav
        title={
          isEditingName ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={`px-3 py-2 text-2xl font-bold bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  nameError ? 'border-red-500' : 'border-gray-300'
                }`}
                autoFocus
              />
              <div className="flex items-center space-x-2">
                <IconButton
                  icon={<Edit2 className="h-5 w-5" />}
                  onClick={handleSaveName}
                  variant="success"
                  title="Save"
                />
                <IconButton
                  icon={<Trash2 className="h-5 w-5" />}
                  onClick={handleCancelEdit}
                  variant="danger"
                  title="Cancel"
                />
              </div>
              {nameError && (
                <span className="text-sm text-red-500">{nameError}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>{connection.name}</span>
              <IconButton
                icon={<Edit2 className="h-5 w-5" />}
                onClick={startEditingName}
                variant="ghost"
                title="Edit Name"
              />
            </div>
          )
        }
        description={`${connection.type} - ${connection.location}`}
        action={{
          label: 'Back to Connections',
          icon: <ArrowLeft className="h-5 w-5 mr-2" />,
          onClick: () => navigate('/manage')
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-6 mb-8">
          {/* Status Card */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full ${
                connection.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className="ml-2 text-lg font-medium text-gray-900">
                {connection.status}
              </span>
            </div>
          </div>

          {/* Type Card */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Type</h3>
              <Network className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900">{connection.type}</p>
          </div>

          {/* Pool Card */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Pool</h3>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900">{connection.poolName || connection.pool || 'None'}</p>
          </div>

          {/* Locations Card */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Locations</h3>
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex flex-wrap gap-1">
              {connection.locations && connection.locations.length > 0 ? (
                connection.locations.slice(0, 2).map((loc, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium">
                    {loc}
                  </span>
                ))
              ) : (
                <p className="text-sm font-medium text-gray-900">{connection.location}</p>
              )}
              {connection.locations && connection.locations.length > 2 && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                  +{connection.locations.length - 2}
                </span>
              )}
            </div>
          </div>

          {/* Vendors Card */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Vendors</h3>
              <Cloud className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex flex-wrap gap-1">
              {connection.providers && connection.providers.length > 0 ? (
                connection.providers.slice(0, 2).map((vendor, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded font-medium">
                    {vendor}
                  </span>
                ))
              ) : (
                <p className="text-sm font-medium text-gray-900">{connection.provider || 'N/A'}</p>
              )}
              {connection.providers && connection.providers.length > 2 && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                  +{connection.providers.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Connection Edit Warning */}
        <ConnectionEditWarning connection={connection} className="mb-6" />

        {/* Action Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Status Toggle Button */}
            <Button
              variant={connection.status === 'Active' ? 'primary' : 'outline'}
              icon={connection.status === 'Active' ? Pause : Play}
              onClick={handleToggleStatus}
              className={connection.status === 'Active' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {connection.status === 'Active' ? 'Active' : 'Inactive'}
            </Button>

            {/* Delete Button */}
            <Button
              variant="outline"
              icon={Trash2}
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>

          <Button
            variant={isEditing ? 'primary' : 'outline'}
            icon={Cog}
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {isEditing ? 'Save Changes' : 'Manage Settings'}
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <ConnectionTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm">
          {renderContent()}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Connection"
        message="Are you sure you want to delete this connection? This action cannot be undone."
        icon={<Trash2 className="w-6 h-6 text-red-600" />}
        confirmText="Delete"
        confirmVariant="danger"
      />

      {/* Cloud Router Modals */}
      <CloudRouterModal
        isOpen={showAddCloudRouterModal}
        onClose={() => {
          setShowAddCloudRouterModal(false);
          setEditingCloudRouter(undefined);
        }}
        onSave={handleSaveCloudRouter}
        cloudRouter={editingCloudRouter}
        connectionId={connection.id.toString()}
        links={getAllLinks()}
      />

      <DeleteCloudRouterModal
        isOpen={!!deletingCloudRouter}
        onClose={() => setDeletingCloudRouter(undefined)}
        onConfirm={handleConfirmDeleteCloudRouter}
        cloudRouterName={deletingCloudRouter?.name || ''}
      />

      {/* VNF Modals */}
      <VNFModal
        isOpen={showAddVNFModal}
        onClose={() => {
          setShowAddVNFModal(false);
          setEditingVNF(undefined);
        }}
        onSave={handleSaveVNF}
        vnf={editingVNF}
        connectionId={connection.id.toString()}
        links={getAllLinks()}
      />

      <DeleteVNFModal
        isOpen={!!deletingVNF}
        onClose={() => setDeletingVNF(undefined)}
        onConfirm={handleConfirmDeleteVNF}
        vnfName={deletingVNF?.name || ''}
      />
    </div>
  );
}
