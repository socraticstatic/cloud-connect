import { useState, useEffect, useRef } from 'react';
import { CloudProvider, ConnectionType, BandwidthOption } from '../../types/connection';
import { DollarSign, CreditCard, Receipt, Clock, ChevronDown } from 'lucide-react';

interface BillingPreviewProps {
  provider?: CloudProvider;
  type?: ConnectionType;
  bandwidth?: BandwidthOption;
  redundancy?: boolean;
  configuration?: {
    bfdEnabled?: boolean;
    ddosProtection?: boolean;
    advancedMonitoring?: boolean;
  };
  location?: string;
  selectedPlanId?: string;
  onPlanChange?: (planId: string) => void;
}

export function BillingPreview({
  provider,
  type,
  bandwidth,
  redundancy,
  configuration,
  location,
  selectedPlanId = 'pay-as-you-go',
  onPlanChange
}: BillingPreviewProps) {
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Payment plans
  const paymentPlans = [
    {
      id: 'trial',
      name: 'Trial',
      description: '30-day trial period',
      discount: 1.0,
      badge: '30 Days Free',
      color: 'green'
    },
    {
      id: 'pay-as-you-go',
      name: 'Pay as you go',
      description: 'Monthly billing',
      discount: 1.0,
      badge: 'Monthly',
      color: 'blue'
    },
    {
      id: '12-months',
      name: '12 Months',
      description: 'Save 15% with yearly billing',
      discount: 0.85,
      badge: 'Save 15%',
      color: 'blue'
    },
    {
      id: '24-months',
      name: '24 Months',
      description: 'Save 20% with 2-year plan',
      discount: 0.80,
      badge: 'Save 20%',
      color: 'blue'
    },
    {
      id: '36-months',
      name: '36 Months',
      description: 'Save 25% with 3-year plan',
      discount: 0.75,
      badge: 'Save 25%',
      color: 'purple'
    }
  ];

  const selectedPlan = paymentPlans.find(plan => plan.id === selectedPlanId) || paymentPlans[1];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPlanSelector(false);
      }
    };

    if (showPlanSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPlanSelector]);

  // Position dropdown
  useEffect(() => {
    if (showPlanSelector && dropdownRef.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = dropdownRef.current.offsetHeight;
      
      // Check if dropdown would go below viewport
      if (containerRect.bottom + dropdownHeight > viewportHeight) {
        dropdownRef.current.style.bottom = '100%';
        dropdownRef.current.style.top = 'auto';
      } else {
        dropdownRef.current.style.top = '100%';
        dropdownRef.current.style.bottom = 'auto';
      }
    }
  }, [showPlanSelector]);

  // Base pricing tiers
  const basePricing = {
    '100 Mbps': 199,
    '500 Mbps': 499,
    '1 Gbps': 999,
    '10 Gbps': 2499,
    '100 Gbps': 9999
  };

  // Provider multipliers
  const providerMultiplier = {
    'AWS': 1.0,
    'Azure': 1.1,
    'Google': 1.2,
    'Oracle': 1.15,
    'Equinix': 1.05
  };

  // Calculate line items
  const lineItems: Array<{ description: string; amount: number }> = [];

  // Connection type line item
  if (type) {
    lineItems.push({
      description: `${type} Connection`,
      amount: 0
    });
  }

  // Region line item
  if (location) {
    lineItems.push({
      description: `${location} Region`,
      amount: 0
    });
  }

  // Base connection cost
  if (bandwidth) {
    const baseAmount = basePricing[bandwidth];
    lineItems.push({
      description: `${bandwidth} Base Connection`,
      amount: baseAmount
    });

    // Provider adjustment
    if (provider) {
      const multiplier = providerMultiplier[provider];
      const adjustment = baseAmount * (multiplier - 1);
      if (adjustment !== 0) {
        lineItems.push({
          description: `Platform Fee`,
          amount: adjustment
        });
      }
    }
  } else {
    lineItems.push({
      description: 'Base Connection',
      amount: 999
    });
  }

  // Redundancy cost
  if (redundancy) {
    lineItems.push({
      description: 'Redundant Path',
      amount: bandwidth ? basePricing[bandwidth] * 0.5 : 499
    });
  }

  // Additional features
  if (configuration?.bfdEnabled) {
    lineItems.push({
      description: 'BFD Monitoring',
      amount: 99
    });
  }

  if (configuration?.ddosProtection) {
    lineItems.push({
      description: 'DDoS Protection',
      amount: 299
    });
  }

  if (configuration?.advancedMonitoring) {
    lineItems.push({
      description: 'Advanced Monitoring',
      amount: 199
    });
  }

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const planDiscount = subtotal * (1 - selectedPlan.discount);
  const estimatedTax = (subtotal - planDiscount) * 0.1; // 10% tax after discount
  const total = subtotal - planDiscount + estimatedTax;

  // Get color classes based on plan
  const getPlanColorClasses = (plan: typeof selectedPlan) => {
    if (plan.id === 'trial') {
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        badgeBg: 'bg-green-100',
        badgeText: 'text-green-800'
      };
    } else if (plan.id === '36-months') {
      return {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-800',
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-800'
      };
    } else {
      return {
        bg: 'bg-brand-lightBlue',
        border: 'border-brand-blue/20',
        text: 'text-brand-blue',
        badgeBg: 'bg-brand-blue/10',
        badgeText: 'text-brand-blue'
      };
    }
  };

  const selectedPlanColors = getPlanColorClasses(selectedPlan);

  return (
    <div ref={containerRef} className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <Receipt className="h-5 w-5 text-brand-blue mr-2" />
          <h3 className="text-base font-medium text-gray-900">Cost Summary</h3>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4 relative">
          <button
            onClick={() => setShowPlanSelector(!showPlanSelector)}
            className={`
              relative w-full inline-flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg
              transition-colors duration-200 border
              ${selectedPlanColors.bg} ${selectedPlanColors.border} ${selectedPlanColors.text}
            `}
          >
            {selectedPlan.name}
            <ChevronDown className={`h-4 w-4 ml-1.5 transition-transform duration-200 ${showPlanSelector ? 'rotate-180' : ''}`} />
          </button>

          {showPlanSelector && (
            <div 
              ref={dropdownRef}
              className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
            >
              {paymentPlans.map(plan => {
                const planColors = getPlanColorClasses(plan);
                return (
                  <button
                    key={plan.id}
                    onClick={() => {
                      onPlanChange?.(plan.id);
                      setShowPlanSelector(false);
                    }}
                    className={`
                      w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg
                      ${selectedPlanId === plan.id ? 'bg-gray-50' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-900">{plan.name}</span>
                      <span className={`
                        px-2 py-0.5 text-xs rounded-full
                        ${planColors.badgeBg} ${planColors.badgeText}
                      `}>
                        {plan.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="space-y-2 mb-4">
          {lineItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{item.description}</span>
              <span className="font-medium text-gray-900">
                {item.amount === 0 ? 'Included' : `$${item.amount.toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 pt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          {planDiscount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-complementary-green">Plan Discount</span>
              <span className="font-medium text-complementary-green">-${planDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Est. Tax (10%)</span>
            <span className="font-medium text-gray-900">${estimatedTax.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-base font-medium pt-2 border-t border-gray-200">
            <span className="text-gray-900">Total</span>
            <span className="text-brand-blue">${total.toFixed(2)}</span>
          </div>
        </div>

        {selectedPlan.id === 'trial' && (
          <div className="mt-3 flex items-center justify-between text-sm text-complementary-green pt-2 border-t border-gray-200">
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Trial Period
            </span>
            <span className="font-medium">30 days</span>
          </div>
        )}
      </div>
    </div>
  );
}