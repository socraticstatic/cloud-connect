import { DollarSign, TrendingUp, CreditCard, Calendar } from 'lucide-react';
import { Connection } from '../../../../../types';
import { formatCurrency } from '../../../../../utils/connections';

interface BillingOverviewWidgetProps {
  connections: Connection[];
}

export function BillingOverviewWidget({ connections }: BillingOverviewWidgetProps) {
  const totalBilling = connections.reduce((sum, conn) => 
    sum + (conn.billing?.total || 0), 0
  );

  const monthlyTrend = 8.5;
  const nextBillingDate = new Date();
  nextBillingDate.setDate(1);
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  return (
    <div className="space-y-4">
      {/* Total Cost */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalBilling)}
          </div>
          <div className="flex items-center mt-1">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+{monthlyTrend}%</span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
        <DollarSign className="h-8 w-8 text-green-500" />
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Base Services</span>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(totalBilling * 0.7)}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Add-ons</span>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(totalBilling * 0.3)}
          </div>
        </div>
      </div>

      {/* Next Billing */}
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-blue-500 mr-2" />
          <span className="text-sm text-blue-700">Next Billing Date</span>
        </div>
        <span className="text-sm font-medium text-blue-700">
          {nextBillingDate.toLocaleDateString()}
        </span>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <button className="flex-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          View Details
        </button>
        <button className="flex-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          Download Invoice
        </button>
      </div>
    </div>
  );
}