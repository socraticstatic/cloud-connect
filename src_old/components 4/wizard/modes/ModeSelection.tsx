import { Code, Layers, ListChecks, Brain } from 'lucide-react';

interface ModeSelectionProps {
  onModeSelect: (mode: 'step-by-step' | 'visual' | 'api') => void;
  onCancel: () => void;
}

export function ModeSelection({ onModeSelect, onCancel }: ModeSelectionProps) {
  const modes = [
    {
      id: 'step-by-step',
      name: 'Step-by-Step Wizard',
      description: 'Guided connection setup with AI-powered assistance',
      icon: ListChecks,
      color: 'blue',
      badge: 'AI-Powered',
      disabled: false
    },
    {
      id: 'visual',
      name: 'Visual Designer',
      description: 'Design your network topology using an interactive canvas',
      icon: Layers,
      color: 'purple',
      badge: 'AI-Powered',
      disabled: false
    },
    {
      id: 'api',
      name: 'API Toolbox',
      description: 'Connect external APIs and enhance your network with dynamic data',
      icon: Code,
      color: 'green',
      badge: 'New',
      disabled: false
    }
  ];

  return (
    <div className="min-h-[600px] flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Create New Connection</h1>
          <p className="mt-3 text-lg text-gray-500">
            Choose your preferred method to create and tailor your network connection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => !mode.disabled && onModeSelect(mode.id as 'step-by-step' | 'visual' | 'api')}
                disabled={mode.disabled}
                className={`
                  relative group bg-white p-8 mode-selection-card shadow-sm border-2 
                  ${mode.disabled ? 'border-gray-100 opacity-60 cursor-not-allowed' : 'border-gray-100 hover:shadow-xl'}
                  transition-all duration-300 ease-in-out rounded-xl
                `}
              >
                {/* Gradient Overlay */}
                <div className={`
                  absolute inset-0 rounded-xl opacity-0 
                  ${!mode.disabled && `group-hover:opacity-100 bg-gradient-to-br from-${mode.color}-500/5 to-${mode.color}-500/10`}
                  transition-opacity duration-300
                `} />

                {/* AI Badge */}
                {mode.badge && (
                  <div className="absolute -top-4 -right-4">
                    <div className="flex items-center space-x-1 bg-[#003184] text-white text-xs px-2 py-1 rounded-full shadow-md">
                      <Brain className="h-3 w-3 mr-0.5" />
                      <span>AI-Powered</span>
                    </div>
                  </div>
                )}

                {/* Coming Soon Badge for Disabled Mode */}
                {mode.disabled && (
                  <div className="absolute -top-4 -right-4">
                    <div className="flex items-center space-x-1 bg-gray-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                      <span>Coming Soon</span>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <div className={`
                    inline-flex items-center justify-center w-12 h-12 rounded-lg
                    ${mode.disabled ? 'bg-gray-100 text-gray-400' : `bg-${mode.color}-100 text-${mode.color}-600`}
                    mb-4 ${!mode.disabled && 'group-hover:scale-110 transition-transform duration-300'}
                  `}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className={`
                    text-xl font-semibold mb-2
                    ${mode.disabled ? 'text-gray-400' : `text-gray-900 group-hover:text-${mode.color}-700 transition-colors duration-300`}
                  `}>
                    {mode.name}
                  </h3>

                  <p className={`text-${mode.disabled ? 'gray-300' : 'gray-500'} text-sm leading-relaxed`}>
                    {mode.description}
                  </p>

                  {!mode.disabled && (
                    <div className={`
                      mt-6 inline-flex items-center text-sm font-medium
                      text-${mode.color}-600 group-hover:text-${mode.color}-700
                    `}>
                      Get Started
                      <svg
                        className={`ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-12 flex justify-between items-center">
          <button
            onClick={onCancel}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
          >
            Cancel
          </button>
          <p className="text-sm text-gray-500">
            Need help choosing? Check out our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              connection creation guide
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}