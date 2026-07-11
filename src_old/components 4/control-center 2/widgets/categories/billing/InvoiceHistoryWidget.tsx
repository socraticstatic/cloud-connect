import { Receipt, Download, ExternalLink, Clock } from 'lucide-react';
import { Connection } from '../../../../../types';
import { formatCurrency } from '../../../../../utils/connections';

interface InvoiceHistoryWidgetProps {
  connections: Connection[];
}

export function InvoiceHistoryWidget({ connections }: InvoiceHistoryWidgetProps) {
  const invoices = [
    {
      id: 'INV-2024-001',
      date: '2024-03-01',
      amount: 1299.99,
      status: 'paid',
      items: [
        { description: 'Enterprise Plan', amount: 999.99 },
        { description: 'Additional Bandwidth', amount: 300 }
      ]
    },
    {
      id: 'INV-2024-002',
      date: '2024-02-01',
      amount: 999.99,
      status: 'paid',
      items: [
        { description: 'Enterprise Plan', amount: 999.99 }
      ]
    },
    {
      id: 'INV-2024-003',
      date: '2024-01-01',
      amount: 1149.99,
      status: 'paid',
      items: [
        { description: 'Enterprise Plan', amount: 999.99 },
        { description: 'Additional Storage', amount: 150 }
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Receipt className="h-5 w-5 text-blue-500 mr-2" />
          <span className="text-sm font-medium text-gray-900">Recent Invoices</span>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          View All
        </button>
      </div>

      <div className="space-y-2">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(invoice.date).toLocaleDateString()}
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(invoice.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                invoice.status === 'paid'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {invoice.status.toUpperCase()}
              </span>
              <div className="flex space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200">
                  <Download className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-700">Next invoice due</div>
        <div className="text-sm font-medium text-blue-700">Apr 1, 2024</div>
      </div>
    </div>
  );
}