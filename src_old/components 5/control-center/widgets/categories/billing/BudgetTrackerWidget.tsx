import { CreditCard, AlertTriangle } from 'lucide-react';
import { Connection } from '../../../../../types';
import { formatCurrency } from '../../../../../utils/connections';

interface BudgetTrackerWidgetProps {
  connections: Connection[];
}

export function BudgetTrackerWidget({ connections }: BudgetTrackerWidgetProps) {
  const totalBilling = connections.reduce((sum, conn) => 
    sum + (conn.billing?.total || 0), 0
  );

  const budget = 20000; // Example budget
  const usagePercentage = (totalBilling / budget) * 100;
  const isOverBudget = usagePercentage > 100;
  const isNearBudget = usagePercentage > 80;

  return (
    <div className="space-y-4">
      {/* Budget Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Monthly Budget</span>
          <span className="text-sm font-medium text-gray-900">{formatCurrency(budget)}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverBudget ? 'bg-red-500' :
              isNearBudget ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-500">Used</span>
          <span className={`text-sm font-medium ${
            isOverBudget ? 'text-red-600' :
            isNearBudget ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {formatCurrency(totalBilling)} ({usagePercentage.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Budget Status */}
      {(isOverBudget || isNearBudget) && (
        <div className={`p-3 rounded-lg ${
          isOverBudget ? 'bg-red-50' : 'bg-yellow-50'
        }`}>
          <div className="flex items-center">
            <AlertTriangle className={`h-4 w-4 mr-2 ${
              isOverBudget ? 'text-red-500' : 'text-yellow-500'
            }`} />
            <span className={`text-sm ${
              isOverBudget ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {isOverBudget
                ? 'Budget exceeded! Take action now.'
                : 'Approaching budget limit'
              }
            </span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          Adjust Budget
        </button>
        <button className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          Cost Alerts
        </button>
      </div>
    </div>
  );
}