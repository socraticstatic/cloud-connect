import { CreditCard, Download, DollarSign, Calendar, Receipt, Clock, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Group } from '../../../../types/group';
import { Connection } from '../../../../types';
import { Button } from '../../../common/Button';
import { LineChart } from '../../../monitoring/charts/LineChart';

interface GroupBillingProps {
  group: Group;
  connections: Connection[];
}

export function GroupBilling({ group, connections }: GroupBillingProps) {
  if (!group.billing) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Billing Information</h3>
          <p className="text-gray-500">This group doesn't have any billing information yet.</p>
        </div>
      </div>
    );
  }

  // Sample billing trend data
  const billingTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Billing',
      data: [2700, 2850, 2750, 2900, 3100, 2950],
      borderColor: '#10b981',
      fill: false
    }]
  };

  return (
    <div className="p-6 space-y-6">
      {/* Billing Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Monthly Cost</h4>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">${group.billing.monthlyRate.toFixed(2)}</p>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+5.2%</span>
                <span className="text-gray-500 ml-1">vs. last month</span>
              </div>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Annual Discount</h4>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">{group.billing.annualDiscount || 0}%</p>
                <p className="ml-2 text-sm text-gray-500">per year</p>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Save ${((group.billing.monthlyRate * 12) * (group.billing.annualDiscount || 0) / 100).toFixed(2)} annually
              </div>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Next Invoice</h4>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">
                  {group.billing.nextInvoiceDate 
                    ? new Date(group.billing.nextInvoiceDate).toLocaleDateString() 
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {group.billing.billingCycle.charAt(0).toUpperCase() + group.billing.billingCycle.slice(1)} billing cycle
              </div>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Receipt className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {group.billing.paymentMethod.replace('_', ' ')}
                </p>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {group.billing.paymentMethod === 'credit_card' ? 'Card ending in •••• 4242' : 'Net 30 terms'}
              </div>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <CreditCard className="h-5 w-5 text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Billing Trend Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 text-brand-blue mr-2" />
            Billing Trends
          </h3>
          <select
            className="form-control"
            defaultValue="6m"
          >
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="12m">Last 12 months</option>
          </select>
        </div>
        <div className="h-64">
          <LineChart data={billingTrendData} />
        </div>
      </div>
      
      {/* Invoice History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Receipt className="h-5 w-5 text-brand-blue mr-2" />
            Invoice History
          </h3>
          <Button
            variant="outline"
            icon={Download}
          >
            Export All
          </Button>
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
              {group.billing.invoiceHistory ? (
                group.billing.invoiceHistory.map((invoice) => (
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
                          : invoice.status === 'unpaid'
                            ? 'bg-yellow-100 text-yellow-800'
                            : invoice.status === 'overdue'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button className="text-brand-blue hover:text-brand-darkBlue">
                          View
                        </button>
                        <button className="text-gray-400 hover:text-gray-500">
                          <FileText className="h-5 w-5" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-500">
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No invoices available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Cost Allocation */}
      {group.billing.costAllocation && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <DollarSign className="h-5 w-5 text-brand-blue mr-2" />
              Cost Allocation
            </h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(group.billing.costAllocation).map(([category, amount]) => (
              <div key={category}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">{category}</span>
                  <span className="text-sm font-medium text-gray-900">${amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-brand-blue h-2 rounded-full"
                    style={{ width: `${(amount / group.billing.monthlyRate) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Billing Breakdown</h4>
              {connections.map(conn => (
                <div key={conn.id} className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{conn.name}</span>
                  <span className="font-medium text-gray-900">
                    ${conn.billing?.total.toFixed(2) || '0.00'}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-200 mt-2">
                <span>Total</span>
                <span>${group.billing.monthlyRate.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Schedule</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Billing Cycle:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {group.billing.billingCycle}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {group.billing.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
                
                {group.billing.nextInvoiceDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Next Invoice:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(group.billing.nextInvoiceDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {group.billing.lastInvoiceDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Invoice:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(group.billing.lastInvoiceDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}