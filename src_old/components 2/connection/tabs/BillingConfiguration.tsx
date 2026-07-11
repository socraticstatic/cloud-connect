import { useState } from 'react';
import { 
  DollarSign, CreditCard, Receipt, Clock, TrendingUp, 
  Download, FileText, AlertTriangle, Percent, ArrowUpDown,
  Calendar, RefreshCw
} from 'lucide-react';

interface BillingConfigurationProps {
  isEditing?: boolean;
}

export function BillingConfiguration({ isEditing }: BillingConfigurationProps) {
  const [config] = useState({
    // Base Plan Configuration
    plan: {
      name: 'Enterprise',
      basePrice: 999.99,
      billingCycle: 'monthly',
      autoRenew: true,
      startDate: '2024-01-01',
      nextBillingDate: '2024-04-01',
      status: 'active'
    },

    // Usage-based Pricing
    usage: {
      bandwidth: {
        included: '10TB',
        overage: '$0.08/GB',
        current: '8.5TB',
        forecast: '9.2TB'
      },
      ports: {
        included: 4,
        overage: '$99/port',
        current: 3
      }
    },

    // Add-ons and Features
    addons: [
      {
        name: 'DDoS Protection',
        price: 299.99,
        status: 'active',
        details: 'Advanced DDoS mitigation up to 10Tbps'
      },
      {
        name: 'Redundant Path',
        price: 199.99,
        status: 'active',
        details: 'Automatic failover with secondary connection'
      }
    ],

    // Billing History
    history: [
      {
        id: 'INV-2024-003',
        date: '2024-03-01',
        amount: 1499.97,
        status: 'paid',
        items: [
          { description: 'Base Plan', amount: 999.99 },
          { description: 'DDoS Protection', amount: 299.99 },
          { description: 'Redundant Path', amount: 199.99 }
        ]
      },
      {
        id: 'INV-2024-002',
        date: '2024-02-01',
        amount: 1499.97,
        status: 'paid',
        items: [
          { description: 'Base Plan', amount: 999.99 },
          { description: 'DDoS Protection', amount: 299.99 },
          { description: 'Redundant Path', amount: 199.99 }
        ]
      }
    ],

    // Payment Configuration
    payment: {
      method: 'credit_card',
      card: {
        brand: 'visa',
        last4: '4242',
        expiry: '12/25'
      },
      autopay: true,
      billingEmail: 'billing@example.com'
    },

    // Cost Allocation
    costAllocation: {
      department: 'IT Infrastructure',
      costCenter: 'CC-123456',
      projectCode: 'PROJ-789',
      tags: {
        environment: 'production',
        business_unit: 'cloud_services'
      }
    },

    // Alerts and Notifications
    alerts: {
      usageThreshold: 80,
      budgetThreshold: 90,
      recipients: ['admin@example.com', 'finance@example.com'],
      channels: ['email', 'slack']
    }
  });

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
          <span className={`px-2 py-1 text-sm rounded-full ${
            config.plan.status === 'active' 
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {config.plan.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <span className="text-sm text-gray-500">Base Plan</span>
            <div className="mt-1">
              <span className="text-2xl font-bold text-gray-900">${config.plan.basePrice}</span>
              <span className="text-gray-500">/{config.plan.billingCycle}</span>
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Billing Cycle</span>
            <div className="mt-1 flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-900">Monthly</span>
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Next Billing Date</span>
            <div className="mt-1 flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-900">{new Date(config.plan.nextBillingDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Auto-Renew</span>
            <div className="mt-1 flex items-center">
              <RefreshCw className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-900">{config.plan.autoRenew ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage & Metering */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Usage & Metering</h3>
        
        {/* Bandwidth Usage */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Bandwidth Usage</span>
            <span className="text-sm text-gray-500">
              {config.usage.bandwidth.current} of {config.usage.bandwidth.included} included
            </span>
          </div>
          <div className="relative">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-500 rounded-full"
                style={{ width: `${(parseFloat(config.usage.bandwidth.current) / parseFloat(config.usage.bandwidth.included.replace('TB', ''))) * 100}%` }}
              />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Forecast: {config.usage.bandwidth.forecast}</span>
            <span>Overage Rate: {config.usage.bandwidth.overage}</span>
          </div>
        </div>

        {/* Port Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Port Usage</span>
            <span className="text-sm text-gray-500">
              {config.usage.ports.current} of {config.usage.ports.included} included
            </span>
          </div>
          <div className="relative">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-500 rounded-full"
                style={{ width: `${(config.usage.ports.current / config.usage.ports.included) * 100}%` }}
              />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Additional Ports: {config.usage.ports.overage}</span>
          </div>
        </div>
      </div>

      {/* Add-ons */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Add-ons & Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.addons.map((addon) => (
            <div key={addon.name} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{addon.name}</span>
                <span className="text-blue-600">${addon.price}/mo</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{addon.details}</p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  addon.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {addon.status.toUpperCase()}
                </span>
                <button className="text-sm text-red-600 hover:text-red-700">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700">
            Update Payment Method
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {config.payment.card.brand.toUpperCase()} ending in {config.payment.card.last4}
                </div>
                <div className="text-sm text-gray-500">
                  Expires {config.payment.card.expiry}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Auto-Pay</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                config.payment.autopay
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {config.payment.autopay ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Billing Email: {config.payment.billingEmail}
            </div>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Billing History</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
            <Download className="h-4 w-4 mr-1" />
            Export All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {config.history.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(invoice.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${invoice.amount.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Allocation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Cost Allocation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  value={config.costAllocation.department}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cost Center</label>
                <input
                  type="text"
                  value={config.costAllocation.costCenter}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="space-y-2">
              {Object.entries(config.costAllocation.tags).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{key}:</span>
                  <span className="text-sm text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Billing Alerts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Billing Alerts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Usage Threshold</label>
              <div className="mt-1 flex items-center">
                <input
                  type="number"
                  value={config.alerts.usageThreshold}
                  disabled={!isEditing}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
                <span className="ml-2">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget Threshold</label>
              <div className="mt-1 flex items-center">
                <input
                  type="number"
                  value={config.alerts.budgetThreshold}
                  disabled={!isEditing}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
                <span className="ml-2">%</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alert Recipients</label>
            <div className="space-y-2">
              {config.alerts.recipients.map((recipient) => (
                <div key={recipient} className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">{recipient}</span>
                  {isEditing && (
                    <button className="text-sm text-red-600 hover:text-red-700">
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}