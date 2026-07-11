import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Network, Shield, Edit2, Trash2, Eye, MapPin } from 'lucide-react';
import { CloudRouter } from '../../../types/cloudrouter';
import { OverflowMenu } from '../../common/OverflowMenu';
import { VNF } from '../../../types/vnf';
import { EnhancedTable, TableColumn } from '../../common/EnhancedTable';

interface CloudRouterTableProps {
  cloudRouters: CloudRouter[];
  vnfs?: VNF[]; // VNFs to display with cloud routers
  onEdit: (cloudRouter: CloudRouter) => void;
  onDelete: (cloudRouter: CloudRouter) => void;
  connectionBandwidth?: string; // Total connection bandwidth
  usedBandwidth?: number; // Total used bandwidth across all routers
}

export function CloudRouterTable({
  cloudRouters,
  vnfs = [],
  onEdit,
  onDelete,
  connectionBandwidth = '10 Gbps',
  usedBandwidth = 0
}: CloudRouterTableProps) {
  const navigate = useNavigate();
  const [activeOverflow, setActiveOverflow] = useState<string | null>(null);

  // Count VNFs by cloud router
  const vnfCountByRouter = vnfs.reduce((counts, vnf) => {
    if (vnf.cloudRouterId) {
      counts[vnf.cloudRouterId] = (counts[vnf.cloudRouterId] || 0) + 1;
    }
    return counts;
  }, {} as Record<string, number>);

  // Calculate total bandwidth and available bandwidth
  const totalBandwidth = parseFloat(connectionBandwidth.replace(/[^\d.]/g, ''));
  const availableBandwidth = Math.max(0, totalBandwidth - usedBandwidth);

  const getBandwidthUsedByRouter = (router: CloudRouter): number => {
    if (!router.links || router.links.length === 0) return 0;

    return router.links.reduce((total, link) => {
      if (link.bandwidth) {
        const bandwidthMatch = link.bandwidth.match(/(\d+(\.\d+)?)/);
        if (bandwidthMatch) {
          return total + parseFloat(bandwidthMatch[0]);
        }
      }
      return total;
    }, 0);
  };

  const columns: TableColumn<CloudRouter>[] = [
    {
      id: 'name',
      label: 'Name',
      sortable: true,
      sortKey: 'name',
      render: (router) => (
        <div>
          <button
            onClick={() => navigate(`/cloud-routers/${router.id}`)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
          >
            {router.name}
          </button>
          {router.description && (
            <div className="text-xs text-gray-500 truncate mt-0.5">{router.description}</div>
          )}
        </div>
      ),
      csvRender: (router) => router.name
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      sortKey: 'status',
      render: (router) => (
        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${
          router.status === 'active' ? 'bg-green-100 text-green-800' :
          router.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
          router.status === 'provisioning' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {router.status.charAt(0).toUpperCase() + router.status.slice(1)}
        </span>
      ),
      csvRender: (router) => router.status.charAt(0).toUpperCase() + router.status.slice(1)
    },
    {
      id: 'resources',
      label: 'Links',
      render: (router) => (
        <div className="flex items-center text-sm text-gray-700">
          <Network className="h-3.5 w-3.5 text-gray-400 mr-1" />
          <span>{router.links?.length || 0}</span>
        </div>
      ),
      csvRender: (router) => String(router.links?.length || 0)
    }
  ];

  return (
    <EnhancedTable
        data={cloudRouters}
        columns={columns}
        keyExtractor={(router) => router.id}
        emptyMessage="No cloud routers configured"
        pageSize={50}
        showPagination={cloudRouters.length > 50}
        stickyHeader={true}
        showExport={false}
        tableId="cloudrouter"
        showColumnManager={false}
        rowActions={(router) => (
          <OverflowMenu
            items={[
              {
                id: 'view',
                label: 'View Details',
                icon: <Eye className="h-4 w-4" />,
                onClick: () => onEdit(router)
              },
              {
                id: 'edit',
                label: 'Edit Router',
                icon: <Edit2 className="h-4 w-4" />,
                onClick: () => onEdit(router)
              },
              {
                id: 'delete',
                label: 'Delete Router',
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => onDelete(router),
                variant: 'danger'
              }
            ]}
            isOpen={activeOverflow === router.id}
            onOpenChange={(isOpen) => {
              setActiveOverflow(isOpen ? router.id : null);
            }}
          />
        )}
      />
  );
}