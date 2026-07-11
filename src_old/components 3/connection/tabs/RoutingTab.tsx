import { Router, ArrowRight, Network, Lock, Globe } from 'lucide-react';

export function RoutingTab() {
  const sections = [
    {
      title: 'Restricted VPN - ATMCSPU - IPV4 Configuration',
      subsections: [
        {
          title: 'On Premise to Partner',
          icon: Network,
          status: 'Coming Soon'
        },
        {
          title: 'Partner to On Premise',
          icon: Network,
          status: 'Coming Soon'
        }
      ]
    },
    {
      title: 'Unrestricted - Layer 3 VPN - IPV4 Configuration',
      subsections: [
        {
          title: 'Partner to On Premise',
          icon: Lock,
          status: 'Coming Soon'
        },
        {
          title: 'On Premise to Partner',
          icon: Lock,
          status: 'Coming Soon'
        }
      ]
    },
    {
      title: 'Unrestricted - Layer 3 VPN - IPV6 Configuration',
      subsections: [
        {
          title: 'On Premise to Partner',
          icon: Globe,
          status: 'Coming Soon'
        },
        {
          title: 'Partner to On Premise',
          icon: Globe,
          status: 'Coming Soon'
        }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Router className="h-5 w-5 text-blue-500 mr-2" />
              {section.title}
            </h3>
          </div>

          <div className="p-6 space-y-4">
            {section.subsections.map((subsection, subIndex) => {
              const Icon = subsection.icon;
              return (
                <div
                  key={subIndex}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg">
                        <Icon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{subsection.title}</h4>
                      </div>
                    </div>
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                      onClick={() => {
                        window.addToast({
                          type: 'info',
                          title: 'Coming Soon',
                          message: 'This feature will be available soon',
                          duration: 3000
                        });
                      }}
                    >
                      Configure
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}