import { Globe, ArrowUpDown } from 'lucide-react';
import { LocationOption, BandwidthOption } from '../../../types/connection';
import { BillingPreview } from '../BillingPreview';

interface ConnectionConfigurationProps {
  selectedLocation: LocationOption | undefined;
  selectedBandwidth: BandwidthOption | undefined;
  provider?: string;
  type?: string;
  billingChoice: {
    planId: string;
    term: string;
    addons: string[];
  };
  onLocationSelect: (location: LocationOption) => void;
  onBandwidthSelect: (bandwidth: BandwidthOption) => void;
  onBillingChange: (updates: any) => void;
}

export function ConnectionConfiguration({
  selectedLocation,
  selectedBandwidth,
  provider,
  type,
  billingChoice,
  onLocationSelect,
  onBandwidthSelect,
  onBillingChange
}: ConnectionConfigurationProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-fw-heading text-center mb-8">Configure Your Connection</h3>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Configuration Options */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-6">
            {/* Region Selection */}
            <div>
              <h4 className="text-sm font-medium text-fw-body mb-3">Select Region</h4>
              <div className="grid grid-cols-2 gap-3">
                {['US East', 'US West', 'EU West', 'Asia Pacific'].map((location) => (
                  <button
                    key={location}
                    onClick={() => onLocationSelect(location as LocationOption)}
                    className={`
                      flex flex-col items-center justify-center h-24 p-3 border-2 rounded-xl 
                      transition-all duration-200 wizard-card
                      ${selectedLocation === location
                        ? 'border-fw-active bg-fw-blue-light shadow-lg transform scale-[1.02]'
                        : 'border-fw-secondary hover:border-fw-bodyLight hover:bg-fw-blue-light/50'
                      }
                    `}
                  >
                    <Globe className={`h-5 w-5 mb-2 ${selectedLocation === location ? 'text-fw-link' : 'text-fw-bodyLight'}`} />
                    <span className={`text-sm font-medium text-center ${selectedLocation === location ? 'text-fw-heading' : 'text-fw-body'}`}>
                      {location}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bandwidth Selection */}
            <div>
              <h4 className="text-sm font-medium text-fw-body mb-3">Select Bandwidth</h4>
              <div className="grid grid-cols-2 gap-3">
                {['100 Mbps', '500 Mbps', '1 Gbps', '10 Gbps'].map((bandwidth) => (
                  <button
                    key={bandwidth}
                    onClick={() => onBandwidthSelect(bandwidth as BandwidthOption)}
                    className={`
                      flex flex-col items-center justify-center h-24 p-3 border-2 rounded-xl
                      transition-all duration-200 wizard-card
                      ${selectedBandwidth === bandwidth
                        ? 'border-fw-active bg-fw-blue-light shadow-lg transform scale-[1.02]'
                        : 'border-fw-secondary hover:border-fw-bodyLight hover:bg-fw-blue-light/50'
                      }
                    `}
                  >
                    <ArrowUpDown className={`h-5 w-5 mb-2 ${selectedBandwidth === bandwidth ? 'text-fw-link' : 'text-fw-bodyLight'}`} />
                    <div className={`text-sm font-medium ${selectedBandwidth === bandwidth ? 'text-fw-heading' : 'text-fw-body'}`}>
                      {bandwidth}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Billing Preview */}
        <div className="lg:col-span-1">
          <BillingPreview 
            provider={provider as any} 
            type={type as any}
            bandwidth={selectedBandwidth}
            location={selectedLocation}
            selectedPlanId={billingChoice.planId}
            onPlanChange={(planId) => onBillingChange({ ...billingChoice, planId })}
          />
        </div>
      </div>
    </div>
  );
}