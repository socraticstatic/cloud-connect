import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Users, Network, TrendingUp, Eye, Plus, Building2, ChevronRight } from 'lucide-react';
import { mockResellers, Reseller, ResellerCustomer } from '../../data/mockResellers';
import { useStore } from '../../store/useStore';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-fw-base rounded-2xl border border-fw-secondary p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className="text-figma-sm font-medium text-fw-bodyLight">{label}</span>
      </div>
      <p className="text-figma-2xl font-bold text-fw-heading tracking-tight">{value}</p>
      {sub && <p className="text-figma-sm text-fw-bodyLight mt-1">{sub}</p>}
    </div>
  );
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-fw-successLight text-fw-success' },
  trial: { label: 'Trial', color: 'bg-fw-warn/10 text-fw-warn' },
  suspended: { label: 'Suspended', color: 'bg-fw-errorLight text-fw-error' },
};

function CustomerRow({ customer, onViewAs }: { customer: ResellerCustomer; onViewAs: () => void }) {
  const badge = STATUS_BADGE[customer.status];
  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-fw-wash transition-colors border-b border-fw-secondary last:border-b-0">
      <div className="w-9 h-9 rounded-full bg-fw-link/10 flex items-center justify-center shrink-0">
        <Building2 className="h-4 w-4 text-fw-link" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-figma-base font-medium text-fw-heading truncate">{customer.name}</p>
        <p className="text-figma-sm text-fw-bodyLight">Since {new Date(customer.since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-figma-sm font-medium text-fw-heading">{customer.connectionCount} connections</p>
        <p className="text-figma-xs text-fw-bodyLight">{customer.userCount} users</p>
      </div>
      <div className="text-right hidden md:block min-w-[100px]">
        <p className="text-figma-sm font-bold text-fw-heading">{formatCurrency(customer.monthlySpend)}</p>
        <p className="text-figma-xs text-fw-bodyLight">/month</p>
      </div>
      <span className={`px-2.5 py-1 rounded-full text-figma-xs font-medium ${badge.color}`}>{badge.label}</span>
      <button
        onClick={onViewAs}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-figma-sm font-medium text-fw-link hover:bg-fw-accent transition-colors"
      >
        <Eye className="h-3.5 w-3.5" />
        View
      </button>
    </div>
  );
}

export function ResellerDashboard() {
  const navigate = useNavigate();
  const setActiveTenant = useStore(state => state.setActiveTenant);
  const tenantBranding = useStore(state => state.tenantBranding);

  // Use first reseller for demo
  const reseller = mockResellers[0];
  if (!reseller) return null;

  const activeCustomers = reseller.customers.filter(c => c.status === 'active').length;
  const commissionAmount = reseller.mrr * (reseller.commission / 100);

  const handleViewAsCustomer = (customer: ResellerCustomer) => {
    // For demo, switch to a matching tenant if available
    // In production this would load the customer's tenant context
    window.addToast?.({
      type: 'info',
      title: 'Viewing as Customer',
      message: `Now viewing ${customer.name}'s portal`,
      duration: 3000,
    });
    navigate('/manage');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-figma-2xl font-bold text-fw-heading tracking-tight">Reseller Dashboard</h1>
          <p className="text-figma-base text-fw-bodyLight mt-1">
            {reseller.name}
            <span className="ml-2 px-2 py-0.5 rounded-full text-figma-xs font-bold uppercase bg-fw-purple text-white">
              {reseller.tier}
            </span>
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-5 h-10 rounded-full bg-fw-primary text-white text-figma-base font-medium hover:bg-fw-primaryHover transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DollarSign} label="Monthly Revenue" value={formatCurrency(reseller.mrr)} sub={`${reseller.commission}% commission = ${formatCurrency(commissionAmount)}`} color="bg-fw-success" />
        <StatCard icon={Building2} label="Customers" value={`${reseller.customers.length}`} sub={`${activeCustomers} active`} color="bg-fw-link" />
        <StatCard icon={Network} label="Total Connections" value={`${reseller.totalConnections}`} sub="Across all customers" color="bg-fw-purple" />
        <StatCard icon={TrendingUp} label="Avg. per Customer" value={formatCurrency(Math.round(reseller.mrr / reseller.customers.length))} sub="Monthly spend" color="bg-complementary-amber" />
      </div>

      {/* Customer List */}
      <div className="bg-fw-base rounded-2xl border border-fw-secondary overflow-hidden">
        <div className="px-6 py-4 border-b border-fw-secondary flex items-center justify-between">
          <h2 className="text-figma-lg font-bold text-fw-heading">Customers</h2>
          <span className="text-figma-sm text-fw-bodyLight">{reseller.customers.length} total</span>
        </div>
        <div>
          {reseller.customers.map(customer => (
            <CustomerRow
              key={customer.id}
              customer={customer}
              onViewAs={() => handleViewAsCustomer(customer)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
