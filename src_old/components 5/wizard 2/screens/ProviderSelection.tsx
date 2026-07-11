import { CloudProvider } from '../../../types/connection';
import { BillingPreview } from '../BillingPreview';

interface ProviderSelectionProps {
  selectedProvider: CloudProvider | undefined;
  onSelect: (provider: CloudProvider) => void;
  billingChoice: {
    planId: string;
    term: string;
    addons: string[];
  };
  onBillingChange: (updates: any) => void;
}

const CLOUD_PROVIDERS = [
  {
    id: 'AWS',
    name: 'AWS',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    color: 'blue',
    disabled: false,
  },
  {
    id: 'Azure',
    name: 'Microsoft Azure',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg',
    color: 'blue',
    disabled: false,
  },
  {
    id: 'Google',
    name: 'Google Cloud',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg',
    color: 'blue',
    disabled: false,
  },
  {
    id: 'Oracle',
    name: 'Oracle Cloud',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
    color: 'red',
    disabled: true,
  },
  {
    id: 'IBM',
    name: 'IBM Cloud',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
    color: 'blue',
    disabled: true,
  },
  {
    id: 'Equinix',
    name: 'Equinix',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Equinix_logo.svg',
    color: 'orange',
    disabled: true,
  },
  {
    id: 'Digital Realty',
    name: 'Digital Realty',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Digital_Realty_TM_Brandmark_RGB_Black.svg',
    color: 'blue',
    disabled: true,
  },
  {
    id: 'Centersquare',
    name: 'Centersquare',
    logo: 'https://centersquaredc.com/hs-fs/hubfs/Center-Square-Primary-Wordmark-Black-RGB.png?width=2338&height=2339&name=Center-Square-Primary-Wordmark-Black-RGB.png',
    color: 'blue',
    disabled: true,
  },
  {
    id: 'CoreSite',
    name: 'CoreSite',
    logo: 'https://www.coresite.com/hubfs/CoreSite-AMT-Logo-1.svg',
    color: 'blue',
    disabled: true,
  },
  {
    id: 'DataBank',
    name: 'DataBank',
    logo: 'https://www.databank.com/wp-content/themes/databank/assets/images/content/DB-logo-dark.svg',
    color: 'blue',
    disabled: true,
  },
];

export function ProviderSelection({
  selectedProvider,
  onSelect,
  billingChoice,
  onBillingChange,
}: ProviderSelectionProps) {
  // Reorganize providers into rows of 3
  const firstRow = CLOUD_PROVIDERS.slice(0, 3);
  const secondRow = CLOUD_PROVIDERS.slice(3, 6);
  const thirdRow = CLOUD_PROVIDERS.slice(6, 9);
  const lastProvider = CLOUD_PROVIDERS[9]; // DataBank

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-8">
        Select Your Cloud Provider
      </h3>

      <div className="space-y-8">
        {/* First Row - 3 providers */}
        <div className="grid grid-cols-3 gap-6">
          {firstRow.map((provider) => (
            <div key={provider.id} className="relative flex">
              <button
                onClick={() =>
                  !provider.disabled && onSelect(provider.id as CloudProvider)
                }
                disabled={provider.disabled}
                className={`
                  w-full py-12 px-8 border-2 rounded-xl wizard-card network-option transition-all duration-200
                  ${
                    provider.disabled
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : selectedProvider === provider.id
                      ? 'border-brand-blue bg-brand-lightBlue shadow-lg transform scale-[1.02]'
                      : 'border-gray-200 hover:border-brand-blue/30 hover:bg-brand-lightBlue/30'
                  }
                `}
              >
                <div className="flex flex-col items-center">
                  <img
                    src={provider.logo}
                    alt={provider.name}
                    className={`
                      h-12 object-contain transition-all duration-300
                      ${
                        provider.disabled
                          ? 'filter grayscale opacity-50'
                          : selectedProvider === provider.id
                          ? '' // Full color when selected
                          : 'filter grayscale hover:filter-none' // B&W by default, color on hover
                      }
                    `}
                  />
                </div>
              </button>

              {/* Coming Soon Overlay */}
              {provider.disabled && (
                <div className="absolute inset-0 flex flex-col justify-end items-center p-4 bg-white/10 backdrop-blur-[0.5px] rounded-xl">
                  <span className="px-3 py-1 bg-gray-900/50 text-white text-sm font-medium rounded-full whitespace-nowrap">
                    Coming Soon
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Second Row - 3 providers */}
        <div className="grid grid-cols-3 gap-6">
          {secondRow.map((provider) => (
            <div key={provider.id} className="relative flex">
              <button
                onClick={() =>
                  !provider.disabled && onSelect(provider.id as CloudProvider)
                }
                disabled={provider.disabled}
                className={`
                  w-full py-12 px-8 border-2 rounded-xl wizard-card network-option transition-all duration-200
                  ${
                    provider.disabled
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : selectedProvider === provider.id
                      ? 'border-brand-blue bg-brand-lightBlue shadow-lg transform scale-[1.02]'
                      : 'border-gray-200 hover:border-brand-blue/30 hover:bg-brand-lightBlue/30'
                  }
                `}
              >
                <div className="flex flex-col items-center">
                  <img
                    src={provider.logo}
                    alt={provider.name}
                    className={`
                      h-12 object-contain transition-all duration-300
                      ${
                        provider.disabled
                          ? 'filter grayscale opacity-50'
                          : selectedProvider === provider.id
                          ? '' // Full color when selected
                          : 'filter grayscale hover:filter-none' // B&W by default, color on hover
                      }
                    `}
                  />
                </div>
              </button>

              {/* Coming Soon Overlay */}
              {provider.disabled && (
                <div className="absolute inset-0 flex flex-col justify-end items-center p-4 bg-white/10 backdrop-blur-[0.5px] rounded-xl">
                  <span className="px-3 py-1 bg-gray-900/50 text-white text-sm font-medium rounded-full whitespace-nowrap">
                    Coming Soon
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Third Row - 3 providers */}
        <div className="grid grid-cols-3 gap-6">
          {thirdRow.map((provider) => (
            <div key={provider.id} className="relative flex">
              <button
                onClick={() =>
                  !provider.disabled && onSelect(provider.id as CloudProvider)
                }
                disabled={provider.disabled}
                className={`
                  w-full py-12 px-8 border-2 rounded-xl wizard-card network-option transition-all duration-200
                  ${
                    provider.disabled
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : selectedProvider === provider.id
                      ? 'border-brand-blue bg-brand-lightBlue shadow-lg transform scale-[1.02]'
                      : 'border-gray-200 hover:border-brand-blue/30 hover:bg-brand-lightBlue/30'
                  }
                `}
              >
                <div className="flex flex-col items-center">
                  <img
                    src={provider.logo}
                    alt={provider.name}
                    className={`
                      h-12 object-contain transition-all duration-300
                      ${
                        provider.disabled
                          ? 'filter grayscale opacity-50'
                          : selectedProvider === provider.id
                          ? '' // Full color when selected
                          : 'filter grayscale hover:filter-none' // B&W by default, color on hover
                      }
                    `}
                  />
                </div>
              </button>

              {/* Coming Soon Overlay */}
              {provider.disabled && (
                <div className="absolute inset-0 flex flex-col justify-end items-center p-4 bg-white/10 backdrop-blur-[0.5px] rounded-xl">
                  <span className="px-3 py-1 bg-gray-900/50 text-white text-sm font-medium rounded-full whitespace-nowrap">
                    Coming Soon
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Last Row - 1 provider centered */}
        <div className="flex justify-center">
          <div className="w-1/3 relative flex">
            <button
              onClick={() =>
                !lastProvider.disabled && onSelect(lastProvider.id as CloudProvider)
              }
              disabled={lastProvider.disabled}
              className={`
                w-full py-12 px-8 border-2 rounded-xl wizard-card network-option transition-all duration-200
                ${
                  lastProvider.disabled
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : selectedProvider === lastProvider.id
                    ? 'border-brand-blue bg-brand-lightBlue shadow-lg transform scale-[1.02]'
                    : 'border-gray-200 hover:border-brand-blue/30 hover:bg-brand-lightBlue/30'
                }
              `}
            >
              <div className="flex flex-col items-center">
                <img
                  src={lastProvider.logo}
                  alt={lastProvider.name}
                  className={`
                    h-12 object-contain transition-all duration-300
                    ${
                      lastProvider.disabled
                        ? 'filter grayscale opacity-50'
                        : selectedProvider === lastProvider.id
                        ? '' // Full color when selected
                        : 'filter grayscale hover:filter-none' // B&W by default, color on hover
                    }
                  `}
                />
              </div>
            </button>

            {/* Coming Soon Overlay */}
            {lastProvider.disabled && (
              <div className="absolute inset-0 flex flex-col justify-end items-center p-4 bg-white/10 backdrop-blur-[0.5px] rounded-xl">
                <span className="px-3 py-1 bg-gray-900/50 text-white text-sm font-medium rounded-full whitespace-nowrap">
                  Coming Soon
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}