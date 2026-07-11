import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle, Clock, DollarSign, Shield, Zap, TrendingUp, Star } from 'lucide-react';
import { applicationSolutions, solutionCategories, getPopularSolutions, getSolutionsByCategory, ApplicationSolution } from '../../data/applicationSolutions';

export function ApplicationSolutionZone() {
  const navigate = useNavigate();
  const [selectedSolution, setSelectedSolution] = useState<ApplicationSolution | null>(null);

  const displaySolutions = applicationSolutions;

  const handleBuildNetwork = (solution: ApplicationSolution) => {
    setSelectedSolution(solution);
  };

  const handleStartSetup = () => {
    if (selectedSolution) {
      navigate('/create', {
        state: {
          template: {
            name: `${selectedSolution.name} Network`,
            connectionType: selectedSolution.recommendedSetup.connectionType,
            bandwidth: selectedSolution.recommendedSetup.bandwidth,
            provider: selectedSolution.providers[0],
            purpose: selectedSolution.name,
            useCases: selectedSolution.useCases
          }
        }
      });
    }
  };

  const colorClasses: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      gradient: 'from-green-500 to-green-600'
    },
    cyan: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      border: 'border-cyan-200',
      gradient: 'from-cyan-500 to-cyan-600'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      gradient: 'from-purple-500 to-purple-600'
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      gradient: 'from-orange-500 to-orange-600'
    },
    pink: {
      bg: 'bg-pink-50',
      text: 'text-pink-700',
      border: 'border-pink-200',
      gradient: 'from-pink-500 to-pink-600'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      gradient: 'from-red-500 to-red-600'
    }
  };

  return (
    <div className="space-y-8" style={{ isolation: 'auto' }}>
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">Solution Builder</h2>
            <p className="text-blue-100 text-lg mb-4">
              Build optimized network connections for your business applications
            </p>
            <p className="text-white text-opacity-90 leading-relaxed">
              Select the application you want to connect, and we'll configure the ideal network infrastructure with the right bandwidth, security, and redundancy for your specific use case.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Available Solutions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ isolation: 'auto' }}>
          {displaySolutions.map((solution) => {
            const colors = colorClasses[solution.color];

            return (
              <div
                key={solution.id}
                className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-lg transition-all duration-200 overflow-visible group flex flex-col relative"
              >
                {solution.popular && (
                  <div className="absolute -top-3 -right-3 z-50">
                    <div className="px-3 py-1.5 bg-[#003184] rounded-full shadow-md">
                      <Star className="h-4 w-4 text-white" fill="currentColor" />
                    </div>
                  </div>
                )}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {solution.logo && (
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200">
                          <img src={solution.logo} alt={`${solution.name} logo`} className="h-8 w-8 object-contain" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{solution.name}</h4>
                        <p className="text-sm text-gray-600">{solution.category}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{solution.description}</p>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col">
                  <div>
                    <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Common Use Cases</h5>
                    <ul className="space-y-1.5">
                      {solution.useCases.slice(0, 3).map((useCase, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-[#003184] flex-shrink-0 mt-0.5" />
                          <span>{useCase}</span>
                        </li>
                      ))}
                      {solution.useCases.length > 3 && (
                        <li className="text-xs text-gray-500 ml-6">
                          +{solution.useCases.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
                    <h5 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Recommended Setup
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className={`h-4 w-4 ${colors.text}`} />
                        <span className="text-gray-700">{solution.recommendedSetup.connectionType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`h-4 w-4 ${colors.text}`} />
                        <span className="text-gray-700">{solution.recommendedSetup.bandwidth}</span>
                      </div>
                      {solution.recommendedSetup.redundancy && (
                        <div className="flex items-center gap-2">
                          <Shield className={`h-4 w-4 ${colors.text}`} />
                          <span className="text-gray-700">Redundancy Enabled</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1"></div>

                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-baseline gap-0.5">
                        <DollarSign className="h-4 w-4 text-gray-700" />
                        <span className="text-lg font-bold text-gray-900">{solution.monthlyStartingPrice}</span>
                        <span className="text-xs text-gray-600">/month</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuildNetwork(solution)}
                      className="w-full inline-flex items-center justify-center px-6 py-3.5 font-semibold transition-all duration-200 text-sm bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--button-primary-focus-ring)] focus:ring-offset-2 rounded-lg shadow-sm hover:shadow-md active:shadow-sm group/btn"
                    >
                      <span>Select Plan</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedSolution && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-70 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-b from-gray-50 to-white p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {selectedSolution.logo && (
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
                      <img src={selectedSolution.logo} alt={`${selectedSolution.name} logo`} className="h-10 w-10 object-contain" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedSolution.name} Network</h3>
                    <p className="text-gray-600">Pre-configured network solution</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSolution(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowRight className="h-5 w-5 rotate-90 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">What You'll Get</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedSolution.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <CheckCircle className="h-5 w-5 text-[#003184] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Security Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedSolution.recommendedSetup.security.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Shield className="h-4 w-4 text-[#003184]" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Setup Summary</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Connection Type</div>
                    <div className="text-sm font-semibold text-gray-900">{selectedSolution.recommendedSetup.connectionType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Bandwidth</div>
                    <div className="text-sm font-semibold text-gray-900">{selectedSolution.recommendedSetup.bandwidth}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Cloud Provider</div>
                    <div className="text-sm font-semibold text-gray-900">{selectedSolution.providers.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Setup Time</div>
                    <div className="text-sm font-semibold text-gray-900">{selectedSolution.estimatedSetupTime}</div>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-sm text-gray-600">Starting at</span>
                  <span className="text-3xl font-bold text-gray-900">${selectedSolution.monthlyStartingPrice}</span>
                  <span className="text-sm text-gray-600">/month</span>
                </div>
                <button
                  onClick={handleStartSetup}
                  className="w-full inline-flex items-center justify-center px-6 py-3.5 font-semibold transition-all duration-200 text-sm bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--button-primary-focus-ring)] focus:ring-offset-2 rounded-lg shadow-sm hover:shadow-md active:shadow-sm group/btn"
                >
                  <span>Select Plan</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
