import { useState } from 'react';
import { Download, CreditCard, Receipt, Clock, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '../../common/Button';

export function InvoiceHistory() {
  const [invoices] = useState([
    {
      id: 'INV-2024-001',
      billingPeriodStart: '2024-02-01',
      billingPeriodEnd: '2024-02-29',
      invoiceDate: '2024-03-01',
      dueDate: '2024-03-15',
      customerAccountId: 'CUST-12345',
      subscriptionId: 'SUB-67890',
      serviceRegion: 'US East',
      connectionId: 'CONN-001',
      bandwidthTier: '10 Gbps',
      serviceType: 'Dedicated',
      provisionedHours: 672,
      dataTransferred: 1250,
      monthlyConnectionFee: 999.99,
      usageCharges: 250.00,
      setupFees: 0,
      discounts: -100.00,
      taxAndRegulatory: 114.99,
      totalAmount: 1264.98,
      paymentStatus: 'Paid',
      paymentDate: '2024-03-10',
      previousPayment: 1199.99,
      creditAdjustments: -50.00
    },
    {
      id: 'INV-2024-002',
      billingPeriodStart: '2024-02-01',
      billingPeriodEnd: '2024-02-29',
      invoiceDate: '2024-03-01',
      dueDate: '2024-03-15',
      customerAccountId: 'CUST-12345',
      subscriptionId: 'SUB-67891',
      serviceRegion: 'US West',
      connectionId: 'CONN-002',
      bandwidthTier: '1 Gbps',
      serviceType: 'Hosted',
      provisionedHours: 672,
      dataTransferred: 850,
      monthlyConnectionFee: 499.99,
      usageCharges: 150.00,
      setupFees: 0,
      discounts: -50.00,
      taxAndRegulatory: 60.00,
      totalAmount: 659.99,
      paymentStatus: 'Due',
      previousPayment: 599.99,
      creditAdjustments: 0
    },
    {
      id: 'INV-2024-003',
      billingPeriodStart: '2024-02-01',
      billingPeriodEnd: '2024-02-29',
      invoiceDate: '2024-03-01',
      dueDate: '2024-03-15',
      customerAccountId: 'CUST-12345',
      subscriptionId: 'SUB-67892',
      serviceRegion: 'EU West',
      connectionId: 'CONN-003',
      bandwidthTier: '5 Gbps',
      serviceType: 'Partner',
      provisionedHours: 672,
      dataTransferred: 2100,
      monthlyConnectionFee: 749.99,
      usageCharges: 300.00,
      setupFees: 0,
      discounts: -75.00,
      taxAndRegulatory: 97.50,
      totalAmount: 1072.49,
      paymentStatus: 'Overdue',
      previousPayment: 999.99,
      creditAdjustments: -25.00
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Invoice History</h3>
        <div className="flex items-center space-x-4">
          <select
            className="form-control"
            defaultValue="all"
          >
            <option value="all">All Time</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <Button
            variant="outline"
            icon={Download}
          >
            Export All
          </Button>
        </div>
      </div>

      <div className="card">
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
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Receipt className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(invoice.billingPeriodStart).toLocaleDateString()} - 
                      {new Date(invoice.billingPeriodEnd).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${invoice.totalAmount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      invoice.paymentStatus === 'Paid' 
                        ? 'bg-green-100 text-green-800'
                        : invoice.paymentStatus === 'Due'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {invoice.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button className="text-gray-400 hover:text-gray-500 rounded-full p-1">
                        <Download className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-500 rounded-full p-1">
                        <Receipt className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}