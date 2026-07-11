import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit2, AlertCircle, CheckCircle, Clock, Download } from 'lucide-react';
import { Button } from '../common/Button';
import { SearchFilterBar } from '../common/SearchFilterBar';
import { TableFilterPanel, useTableFilters, FilterGroup } from '../common/TableFilterPanel';
import { BaseTable } from '../common/BaseTable';
import { OverflowMenu } from '../common/OverflowMenu';
import { mockTenants, Tenant } from '../../data/mockTenants';

const FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'checkbox',
    options: [
      { value: 'active', label: 'Active', color: 'success' },
      { value: 'trial', label: 'Trial', color: 'info' },
      { value: 'suspended', label: 'Suspended', color: 'warning' },
      { value: 'archived', label: 'Archived', color: 'default' },
    ],
  },
  {
    id: 'plan',
    label: 'Plan',
    type: 'checkbox',
    options: [
      { value: 'starter', label: 'Starter' },
      { value: 'professional', label: 'Professional' },
      { value: 'enterprise', label: 'Enterprise' },
    ],
  },
];

export function PlatformAdminPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { filters, setFilters, isOpen, toggle, activeCount } = useTableFilters({ groups: FILTER_GROUPS });

  const getStatusBadge = (status: Tenant['status']) => {
    const config = {
      active: { bg: 'bg-fw-successLight', text: 'text-fw-success', icon: CheckCircle },
      trial: { bg: 'bg-fw-accent', text: 'text-fw-linkHover', icon: Clock },
      suspended: { bg: 'bg-fw-warnLight', text: 'text-fw-warn', icon: AlertCircle },
      archived: { bg: 'bg-fw-neutral', text: 'text-fw-heading', icon: AlertCircle },
    }[status];

    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-figma-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPlanBadge = (plan: Tenant['plan']) => {
    const config = {
      starter: { bg: 'bg-fw-neutral', text: 'text-fw-heading' },
      professional: { bg: 'bg-fw-accent', text: 'text-fw-linkHover' },
      enterprise: { bg: 'bg-fw-wash', text: 'text-fw-purple' },
    }[plan];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-figma-sm font-medium ${config.bg} ${config.text}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      id: 'name',
      label: 'Tenant Name',
      sortable: true,
      render: (tenant: Tenant) => (
        <div>
          <div className="text-figma-base font-medium text-fw-heading tracking-[-0.03em]">{tenant.name}</div>
          <div className="text-figma-sm font-medium text-fw-bodyLight">{tenant.subdomain}.att-netbond.com</div>
        </div>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (tenant: Tenant) => getStatusBadge(tenant.status),
    },
    {
      id: 'plan',
      label: 'Plan',
      sortable: true,
      render: (tenant: Tenant) => getPlanBadge(tenant.plan),
    },
    {
      id: 'admin',
      label: 'Admin Contact',
      sortable: true,
      render: (tenant: Tenant) => (
        <div>
          <div className="text-figma-base font-medium text-fw-body">{tenant.adminName}</div>
          <div className="text-figma-sm font-medium text-fw-bodyLight">{tenant.adminEmail}</div>
        </div>
      ),
    },
    {
      id: 'users',
      label: 'Users',
      sortable: true,
      render: (tenant: Tenant) => (
        <div className="text-figma-base font-medium text-fw-body">{tenant.userCount}</div>
      ),
    },
    {
      id: 'connections',
      label: 'Connections',
      sortable: true,
      render: (tenant: Tenant) => (
        <div className="text-figma-base font-medium text-fw-body">{tenant.connectionCount}</div>
      ),
    },
    {
      id: 'created',
      label: 'Created',
      sortable: true,
      render: (tenant: Tenant) => (
        <div className="text-figma-sm font-medium text-fw-bodyLight">
          {new Date(tenant.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ];

  const filteredTenants = mockTenants.filter((tenant) => {
    const matchesSearch =
      searchQuery === '' ||
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.adminName.toLowerCase().includes(searchQuery.toLowerCase());

    const statusFilters = filters['status'] || [];
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(tenant.status);

    const planFilters = filters['plan'] || [];
    const matchesPlan = planFilters.length === 0 || planFilters.includes(tenant.plan);

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleCreateTenant = () => {
    window.addToast({
      type: 'info',
      title: 'Create Tenant',
      message: 'Tenant creation wizard coming soon',
      duration: 3000,
    });
  };

  const handleViewDetails = (tenant: Tenant) => {
    navigate(`/configure/platform/tenants/${tenant.id}`);
  };

  const handleEditBranding = (tenant: Tenant) => {
    navigate(`/configure/platform/tenants/${tenant.id}/branding`);
  };

  const handleExport = () => {
    window.addToast({
      type: 'success',
      title: 'Export Complete',
      message: 'Tenant list has been exported successfully',
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-fw-base rounded-2xl border border-fw-secondary p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-figma-sm font-medium text-fw-bodyLight">Total Tenants</p>
              <p className="text-figma-xl font-bold text-fw-heading tracking-[-0.03em] mt-1">{mockTenants.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-fw-success" />
          </div>
        </div>

        <div className="bg-fw-base rounded-2xl border border-fw-secondary p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-figma-sm font-medium text-fw-bodyLight">Active Tenants</p>
              <p className="text-figma-xl font-bold text-fw-heading tracking-[-0.03em] mt-1">
                {mockTenants.filter((t) => t.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-fw-link" />
          </div>
        </div>

        <div className="bg-fw-base rounded-2xl border border-fw-secondary p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-figma-sm font-medium text-fw-bodyLight">Total Users</p>
              <p className="text-figma-xl font-bold text-fw-heading tracking-[-0.03em] mt-1">
                {mockTenants.reduce((sum, t) => sum + t.userCount, 0)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-fw-purple" />
          </div>
        </div>

        <div className="bg-fw-base rounded-2xl border border-fw-secondary p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-figma-sm font-medium text-fw-bodyLight">Total Connections</p>
              <p className="text-figma-xl font-bold text-fw-heading tracking-[-0.03em] mt-1">
                {mockTenants.reduce((sum, t) => sum + t.connectionCount, 0)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-fw-warn" />
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-fw-base p-4 rounded-2xl border border-fw-secondary">
        <SearchFilterBar
          searchPlaceholder="Search tenants..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onFilter={toggle}
          activeFilterCount={activeCount}
          isFilterOpen={isOpen}
          onExport={handleExport}
          actions={
            <Button variant="primary" icon={Plus} onClick={handleCreateTenant}>
              Create Tenant
            </Button>
          }
          filterPanel={
            <TableFilterPanel
              groups={FILTER_GROUPS}
              activeFilters={filters}
              onFiltersChange={setFilters}
              isOpen={isOpen}
              onToggle={toggle}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          }
        />
      </div>

      {/* Tenants Table */}
      <div className="bg-fw-base rounded-2xl overflow-hidden">
        <BaseTable
          columns={columns}
          data={filteredTenants}
          keyField="id"
          tableId="tenants"
          showColumnManager={true}
          actions={(tenant) => (
            <OverflowMenu
              items={[
                {
                  id: 'view',
                  label: 'View Details',
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => handleViewDetails(tenant),
                },
                {
                  id: 'branding',
                  label: 'Edit Branding',
                  icon: <Edit2 className="h-4 w-4" />,
                  onClick: () => handleEditBranding(tenant),
                },
              ]}
            />
          )}
          emptyState={
            <div className="text-center py-12">
              <p className="text-fw-bodyLight">No tenants found</p>
            </div>
          }
        />
      </div>
    </div>
  );
}
