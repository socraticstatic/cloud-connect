import { useState } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import { Button } from '../../common/Button';

interface PricingPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
}

interface PricingTier {
  name: string;
  price: number;
  description: string;
  features: string[];
  highlight?: boolean;
  cta: string;
  color: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function PricingPlanModal({ isOpen, onClose, currentPlan = 'Pay as you go' }: PricingPlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans: PricingTier[] = [
    {
      name: 'Trial',
      price: 0,
      description: '30-day trial period',
      features: [
        'Up to 5 concurrent connections',
        'Basic monitoring and alerts',
        'Standard support (business hours)',
        'Core security features',
        'Basic reporting',
        'Direct Connect options',
        'Basic VPN support',
        'Standard encryption',
        'Email alerts',
        '99.9% uptime SLA'
      ],
      cta: 'Start Free Trial',
      color: {
        primary: 'bg-green-500',
        secondary: 'bg-green-50',
        accent: 'text-green-600'
      }
    },
    {
      name: 'Pay as you go',
      price: 499,
      description: 'Monthly billing with no commitment',
      features: [
        'Up to 5 concurrent connections',
        'Basic monitoring and alerts',
        'Standard support (business hours)',
        'Core security features',
        'Basic reporting',
        'Direct Connect options',
        'Basic VPN support',
        'Standard encryption',
        'Email alerts',
        '99.9% uptime SLA'
      ],
      cta: 'Upgrade to Pay as you go',
      color: {
        primary: 'bg-blue-500',
        secondary: 'bg-blue-50',
        accent: 'text-blue-600'
      }
    },
    {
      name: '12 Months',
      price: 424,
      description: 'Save 15% with annual billing',
      features: [
        'Up to 10 concurrent connections',
        'Advanced monitoring',
        'Priority support (12/7)',
        'Enhanced security features',
        'Custom reporting',
        'SD-WAN support',
        'Load balancing',
        'Custom alerts',
        'API access',
        '99.95% uptime SLA'
      ],
      cta: 'Upgrade to 12 Months',
      color: {
        primary: 'bg-blue-500',
        secondary: 'bg-blue-50',
        accent: 'text-blue-600'
      }
    },
    {
      name: '24 Months',
      price: 399,
      description: 'Save 20% with 2-year plan',
      features: [
        'Up to 15 concurrent connections',
        'Advanced monitoring',
        'Priority support (24/7)',
        'Enhanced security features',
        'Custom reporting',
        'SD-WAN support',
        'Load balancing',
        'Custom alerts',
        'API access',
        '99.95% uptime SLA'
      ],
      highlight: true,
      cta: 'Upgrade to 24 Months',
      color: {
        primary: 'bg-blue-500',
        secondary: 'bg-blue-50',
        accent: 'text-blue-600'
      }
    },
    {
      name: '36 Months',
      price: 374,
      description: 'Save 25% with 3-year plan',
      features: [
        'Unlimited connections',
        'Real-time monitoring',
        'Premium support (24/7)',
        'Advanced security suite',
        'Advanced analytics',
        'Multi-region support',
        'Auto-scaling',
        'Custom integrations',
        'Advanced threat protection',
        '99.99% uptime SLA'
      ],
      cta: 'Upgrade to 36 Months',
      color: {
        primary: 'bg-purple-500',
        secondary: 'bg-purple-50',
        accent: 'text-purple-600'
      }
    }
  ];

  if (!isOpen) return null;

  const handleUpgrade = (plan: string) => {
    if (plan === currentPlan) return;
    
    setSelectedPlan(plan);
    window.addToast({
      type: 'info',
      title: 'Contact Sales',
      message: `Please contact our sales team to upgrade to the ${plan} plan.`,
      duration: 5000
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-6xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none rounded-full p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Choose Your Plan</h3>
            <p className="mt-2 text-gray-500">Select the plan that best fits your needs</p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col p-6 bg-white rounded-lg transform transition-all duration-200 hover:scale-[1.02] ${
                  plan.highlight
                    ? `ring-2 ${plan.color.accent.replace('text-', 'ring-')} shadow-lg`
                    : 'border border-gray-200'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className={`inline-flex px-4 py-1 text-sm font-semibold text-white rounded-full ${plan.color.primary}`}>
                      Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className={`text-lg font-semibold ${plan.color.accent}`}>{plan.name}</h3>
                  <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>

                <ul className="flex-grow mb-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className={`w-5 h-5 ${plan.color.accent} shrink-0`} />
                      <span className="ml-3 text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlight ? "primary" : "outline"}
                  className={`w-full ${plan.name === currentPlan ? 'opacity-50 cursor-not-allowed' : ''} ${
                    plan.highlight ? plan.color.primary : ''
                  }`}
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={plan.name === currentPlan}
                >
                  <span className="flex items-center justify-center">
                    {plan.name === currentPlan ? 'Current Plan' : plan.cta}
                    {plan.name !== currentPlan && <ArrowRight className="w-4 h-4 ml-2" />}
                  </span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}