import { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { Connection } from '../../types';
import { Card } from '../common/Card';
import { LineChart } from '../charts/LazyCharts';
import { formatCurrency } from '../../utils/connections';
import { Button } from '../common/Button';

interface BillingMetricsProps {
  connections: Connection[];
}

export function BillingMetrics({ connections }: BillingMetricsProps) {
  const [timeRange, setTimeRange] = useState('30d');

  // Calculate billing metrics
  const totalBilling = connections.reduce((sum, conn) => 
    sum + (conn.billing?.total || 0), 0
  );

  const billingByProvider = connections.reduce((acc, conn) => {
    if (conn.provider && conn.billing) {
      acc[conn.provider] = (acc[conn.provider] || 0) + conn.billing.total;
    }
    return acc;
  }, {} as Record<string, number>);

  const billingByLocation = connections.reduce((acc, conn) => {
    if (conn.billing) {
      acc[conn.location] = (acc[conn.location] || 0) + conn.billing.total;
    }
    return acc;
  }, {} as Record<string, number>);

  // Sample data for billing trends
  const billingTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Billing',
      data: [12500, 13200, 14100, 13800, 14500, 15200],
      borderColor: '#10b981',
      fill: false
    }]
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Monthly Cost</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatCurrency(totalBilling)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="h-6 w-6 text-complementary-green" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-complementary-green mr-1" />
              <span className="text-complementary-green">+8.2%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Per Connection</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatCurrency(totalBilling / connections.length)}
                </p>
              </div>
              <div className="p-3 bg-brand-lightBlue rounded-full">
                <CreditCard className="h-6 w-6 text-brand-blue" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-brand-blue mr-1" />
              <span className="text-brand-blue">+3.5%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Projected Next Month</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatCurrency(totalBilling * 1.082)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <TrendingUp className="h-6 w-6 text-complementary-purple" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Calendar className="h-4 w-4 text-complementary-purple mr-1" />
              <span className="text-gray-500">Based on current usage</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Additional Services</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatCurrency(2499.99)}
                </p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-full">
                <CreditCard className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">DDoS Protection, Monitoring</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Billing Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cost by Provider</h3>
            <div className="space-y-4">
              {Object.entries(billingByProvider).map(([provider, amount]) => (
                <div key={provider}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{provider}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-blue rounded-full"
                      style={{ width: `${(amount / totalBilling) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cost by Location</h3>
            <div className="space-y-4">
              {Object.entries(billingByLocation).map(([location, amount]) => (
                <div key={location}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{location}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-complementary-green rounded-full"
                      style={{ width: `${(amount / totalBilling) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Billing Trends */}
      <Card>
        <div className="card-body">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Billing Trends</h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="form-control text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="180d">Last 180 days</option>
            </select>
          </div>
          <div className="h-80">
            <LineChart data={billingTrendData} />
          </div>
        </div>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <div className="card-body">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Connection
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Fee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Additional Services
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {connections.map((connection) => (
                  <tr key={connection.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{connection.name}</div>
                      <div className="text-sm text-gray-500">{connection.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(connection.billing?.baseFee || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(connection.billing?.usage || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(
                        (connection.billing?.additionalServices || [])
                          .reduce((sum, service) => sum + service.cost, 0)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(connection.billing?.total || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}