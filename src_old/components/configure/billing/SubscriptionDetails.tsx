import { useState } from 'react';
import { Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { PricingPlanModal } from './PricingPlanModal';
import { Button } from '../../common/Button';

export function SubscriptionDetails() {
  const [subscription] = useState({
    plan: 'Pay as you go',
    status: 'Active',
    billingCycle: 'Monthly',
    nextBilling: '2024-04-01',
    features: [
      'Up to 5 concurrent connections',
      'Basic monitoring and alerts',
      'Standard support (business hours)',
      'Core security features',
      'Basic reporting'
    ],
    usage: {
      connections: { used: 3, limit: 5 },
      bandwidth: { used: 8.5, limit: 10 },
      storage: { used: 750, limit: 1000 }
    }
  });

  const [showPricingModal, setShowPricingModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="card">
        <div className="card-header bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-2xl font-bold text-gray-900">{subscription.plan}</h4>
              <p className="text-sm text-gray-500">Billed {subscription.billingCycle.toLowerCase()}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              subscription.status === 'Active'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {subscription.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {Object.entries(subscription.usage).map(([resource, { used, limit }]) => {
              const percentage = (used / limit) * 100;
              const isWarning = percentage > 80;

              return (
                <div key={resource} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 capitalize">{resource}</span>
                    <span className="text-gray-500">
                      {used} / {limit} {resource === 'bandwidth' ? 'Gbps' : resource === 'storage' ? 'GB' : ''}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWarning ? 'bg-yellow-500' : 'bg-brand-blue'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {isWarning && (
                    <p className="flex items-center text-xs text-yellow-600">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Approaching limit
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <h5 className="text-sm font-medium text-gray-700">Plan Features</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subscription.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <Package className="h-4 w-4 text-brand-blue mr-2" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Actions */}
      <div className="flex space-x-4">
        <Button
          variant="primary"
          onClick={() => setShowPricingModal(true)}
          className="flex-1"
        >
          Upgrade Plan
        </Button>
        <Button
          variant="outline"
          onClick={() => {}}
          className="flex-1"
        >
          Cancel Subscription
        </Button>
      </div>

      {/* Pricing Plan Modal */}
      <PricingPlanModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        currentPlan={subscription.plan}
      />
    </div>
  );
}