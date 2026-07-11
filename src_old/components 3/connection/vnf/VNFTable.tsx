import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Router as RouterIcon, Network, Settings, Shield, Globe, CreditCard as Edit2, Trash2, Eye, ExternalLink, Scale, AlertTriangle, Zap, MapPin, Gauge } from 'lucide-react';
import { VNF } from '../../../types/vnf';
import { OverflowMenu } from '../../common/OverflowMenu';
import { CloudRouter } from '../../../types/cloudrouter';
import { EnhancedTable, TableColumn } from '../../common/EnhancedTable';
import { getVNFTypeIcon, getVNFTypeInfo } from '../../../utils/vnfTypes';

interface VNFTableProps {
  vnfs: VNF[];
  cloudRouters: CloudRouter[];
  onEdit: (vnf: VNF) => void;
  onDelete: (vnf: VNF) => void;
  connectionId?: string;
  onDetach?: () => void;
  isDetached?: boolean;
}

export function VNFTable({
  vnfs,
  cloudRouters,
  onEdit,
  onDelete,
  connectionId,
  onDetach,
  isDetached = false
}: VNFTableProps) {
  const navigate = useNavigate();
  const [activeOverflow, setActiveOverflow] = useState<string | null>(null);

  const getTypeIcon = (type: VNF['type']) => {
    const Icon = getVNFTypeIcon(type);
    const info = getVNFTypeInfo(type);
    const colorMap: Record<string, string> = {
      red: 'text-red-500',
      purple: 'text-purple-500',
      blue: 'text-blue-500',
      green: 'text-green-500',
      indigo: 'text-indigo-500',
      orange: 'text-orange-500',
      yellow: 'text-yellow-600',
      gray: 'text-gray-500'
    };
    const colorClass = colorMap[info.color] || 'text-gray-500';
    return <Icon className={`h-5 w-5 ${colorClass}`} />;
  };

  const getTypeName = (type: VNF['type']) => {
    return getVNFTypeInfo(type).label;
  };

  // Get status color
  const getStatusColor = (status: VNF['status']) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'provisioning':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCloudRouterName = (cloudRouterId?: string) => {
    if (!cloudRouterId) return 'Not assigned';
    const router = cloudRouters.find(cr => cr.id === cloudRouterId);
    return router ? router.name : 'Unknown';
  };

  const columns: TableColumn<VNF>[] = [
    {
      id: 'name',
      label: 'Name',
      sortable: true,
      sortKey: 'name',
      render: (vnf) => (
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-2 rounded-lg ${
              vnf.type === 'firewall' ? 'bg-red-100' :
              vnf.type === 'sdwan' ? 'bg-purple-100' :
              vnf.type === 'router' ? 'bg-blue-100' :
              vnf.type === 'vnat' ? 'bg-green-100' :
              vnf.type === 'lmcc' ? 'bg-sky-100' :
              'bg-gray-100'
            }`}>
              {getTypeIcon(vnf.type)}
            </div>
          </div>
          <div className="ml-3">
            <button
              onClick={() => navigate(`/vnfs/${vnf.id}`)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
            >
              {vnf.name}
            </button>
            <div className="text-xs text-gray-500">{vnf.description}</div>
            {vnf.type === 'lmcc' && vnf.configuration?.lmccConfiguration && (
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                  <MapPin className="h-3 w-3 mr-1" />
                  {vnf.configuration.lmccConfiguration.selectedSites.length} sites
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  <Gauge className="h-3 w-3 mr-1" />
                  {vnf.configuration.lmccConfiguration.bandwidthAllocations.reduce((sum, a) => sum + a.bandwidth, 0)} Mbps
                </span>
              </div>
            )}
          </div>
        </div>
      ),
      csvRender: (vnf) => vnf.name
    },
    {
      id: 'type',
      label: 'Type',
      sortable: true,
      sortKey: 'type',
      render: (vnf) => (
        <span className="text-sm text-gray-900 truncate block">{getTypeName(vnf.type)}</span>
      ),
      csvRender: (vnf) => getTypeName(vnf.type)
    },
    {
      id: 'vendor',
      label: 'Vendor',
      sortable: true,
      sortKey: 'vendor',
      render: (vnf) => (
        <span className="text-sm text-gray-900">{vnf.vendor || 'N/A'}</span>
      ),
      csvRender: (vnf) => vnf.vendor || 'N/A'
    },
    {
      id: 'model',
      label: 'Model',
      sortable: true,
      sortKey: 'model',
      render: (vnf) => (
        <span className="text-sm text-gray-700">{vnf.model || 'N/A'}</span>
      ),
      csvRender: (vnf) => vnf.model || 'N/A'
    },
    {
      id: 'version',
      label: 'Version',
      sortable: true,
      sortKey: 'version',
      render: (vnf) => (
        <span className="text-sm text-gray-700">{vnf.version || 'N/A'}</span>
      ),
      csvRender: (vnf) => vnf.version || 'N/A'
    },
    {
      id: 'throughput',
      label: 'Throughput',
      sortable: true,
      sortKey: 'throughput',
      render: (vnf) => (
        <span className="text-sm text-gray-700">{vnf.throughput || 'N/A'}</span>
      ),
      csvRender: (vnf) => vnf.throughput || 'N/A'
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      sortKey: 'status',
      render: (vnf) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(vnf.status)}`}>
          {vnf.status.charAt(0).toUpperCase() + vnf.status.slice(1)}
        </span>
      ),
      csvRender: (vnf) => vnf.status.charAt(0).toUpperCase() + vnf.status.slice(1)
    },
    {
      id: 'cloudRouter',
      label: 'Cloud Router',
      sortable: false,
      render: (vnf) => (
        <span className="text-sm text-gray-700">{getCloudRouterName(vnf.cloudRouterId)}</span>
      ),
      csvRender: (vnf) => getCloudRouterName(vnf.cloudRouterId)
    }
  ];

  return (
    <EnhancedTable
      data={vnfs}
      columns={columns}
      keyExtractor={(vnf) => vnf.id}
      emptyMessage="No network functions configured"
      pageSize={50}
      showPagination={vnfs.length > 50}
      stickyHeader={true}
      showExport={false}
      tableId="vnf"
      showColumnManager={true}
      showFilter={true}
      headerActions={
        onDetach && (
          <button
            onClick={onDetach}
            disabled={isDetached}
            className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={isDetached ? 'Table Detached' : 'Detach Table'}
            aria-label={isDetached ? 'Table Detached' : 'Detach Table'}
          >
            <ExternalLink className="h-5 w-5" />
          </button>
        )
      }
      rowActions={(vnf) => (
        <OverflowMenu
          items={[
            {
              id: 'view',
              label: 'View Details',
              icon: <Eye className="h-4 w-4" />,
              onClick: () => onEdit(vnf)
            },
            {
              id: 'edit',
              label: 'Edit Function',
              icon: <Edit2 className="h-4 w-4" />,
              onClick: () => onEdit(vnf)
            },
            {
              id: 'delete',
              label: 'Delete Function',
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => onDelete(vnf),
              variant: 'danger'
            }
          ]}
          isOpen={activeOverflow === vnf.id}
          onOpenChange={(isOpen) => {
            setActiveOverflow(isOpen ? vnf.id : null);
          }}
        />
      )}
    />
  );
}