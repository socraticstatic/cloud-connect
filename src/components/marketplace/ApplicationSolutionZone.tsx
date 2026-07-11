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
      bg: 'bg-fw-wash',
      text: 'text-fw-body',
      border: 'border-fw-secondary',
      gradient: 'from-fw-secondary to-fw-secondary'
    },
    indigo: {
      bg: 'bg-fw-wash',
      text: 'text-fw-body',
      border: 'border-fw-secondary',
      gradient: 'from-fw-secondary to-fw-secondary'
    },
    green: {
      bg: 'bg-fw-successLight',
      text: 'text-fw-success',
      border: 'border-fw-success',
      gradient: 'from-fw-success to-fw-success'
    },
    cyan: {
      bg: 'bg-fw-wash',
      text: 'text-fw-body',
      border: 'border-fw-secondary',
      gradient: 'from-fw-secondary to-fw-secondary'
    },
    purple: {
      bg: 'bg-fw-wash',
      text: 'text-fw-body',
      border: 'border-fw-secondary',
      gradient: 'from-fw-secondary to-fw-secondary'
    },
    orange: {
      bg: 'bg-[#fff7ed]',
      text: 'text-fw-warn',
      border: 'border-fw-warn/30',
      gradient: 'from-[#f59e0b] to-[#d97706]'
    },
    pink: {
      bg: 'bg-fw-wash',
      text: 'text-fw-body',
      border: 'border-fw-secondary',
      gradient: 'from-fw-secondary to-fw-secondary'
    },
    red: {
      bg: 'bg-fw-errorLight',
      text: 'text-fw-error',
      border: 'border-fw-error',
      gradient: 'from-[#ef4444] to-[#dc2626]'
    }
  };

  return (
    <div className="space-y-8" style={{ isolation: 'auto' }}>
      <div className="bg-fw-primary rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">Solution Builder</h2>
            <p className="text-white/80 text-lg mb-4">
              Build optimized network connections for your business applications
            </p>
            <p className="text-white/70 leading-relaxed">
              Select the application you want to connect, and we'll configure the ideal network infrastructure with the right bandwidth, security, and redundancy for your specific use case.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-fw-heading tracking-[-0.03em] mb-4">
          Available Solutions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ isolation: 'auto' }}>
          {displaySolutions.map((solution) => {
            const colors = colorClasses[solution.color];

            return (
              <div
                key={solution.id}
                className="bg-fw-base rounded-2xl border border-fw-secondary hover:border-fw-link hover:shadow-lg transition-all duration-200 overflow-visible group flex flex-col relative"
              >
                {solution.popular && (
                  <div className="absolute -top-3 -right-3 z-50">
                    <div className="px-3 py-1.5 bg-fw-active rounded-full shadow-md">
                      <Star className="h-4 w-4 text-white" fill="currentColor" />
                    </div>
                  </div>
                )}
                <div className="p-6 border-b border-fw-secondary bg-gradient-to-b from-fw-wash to-fw-base">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-fw-base rounded-lg shadow-sm border border-fw-secondary">
                        {solution.logo ? (
                          <img src={solution.logo} alt={`${solution.name} logo`} className="h-8 w-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }} />
                        ) : null}
                        <Sparkles className={`h-8 w-8 text-fw-link ${solution.logo ? 'hidden' : ''}`} />
                      </div>
                      <div>
                        <h4 className="text-figma-base font-medium text-fw-heading">{solution.name}</h4>
                        <p className="text-figma-sm text-fw-bodyLight">{solution.category}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-figma-base text-fw-bodyLight line-clamp-3">{solution.description}</p>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col">
                  <div>
                    <h5 className="text-figma-sm font-semibold text-fw-body mb-2 uppercase tracking-wide">Common Use Cases</h5>
                    <ul className="space-y-1.5">
                      {solution.useCases.slice(0, 3).map((useCase, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-figma-base text-fw-body">
                          <CheckCircle className="h-4 w-4 text-fw-link flex-shrink-0 mt-0.5" />
                          <span>{useCase}</span>
                        </li>
                      ))}
                      {solution.useCases.length > 3 && (
                        <li className="text-figma-sm text-fw-bodyLight ml-6">
                          +{solution.useCases.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
                    <h5 className="text-figma-sm font-semibold text-fw-body mb-3 uppercase tracking-wide">
                      Recommended Setup
                    </h5>
                    <div className="space-y-2 text-figma-base">
                      <div className="flex items-center gap-2">
                        <Zap className={`h-4 w-4 ${colors.text}`} />
                        <span className="text-fw-body">{solution.recommendedSetup.connectionType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`h-4 w-4 ${colors.text}`} />
                        <span className="text-fw-body">{solution.recommendedSetup.bandwidth}</span>
                      </div>
                      {solution.recommendedSetup.redundancy && (
                        <div className="flex items-center gap-2">
                          <Shield className={`h-4 w-4 ${colors.text}`} />
                          <span className="text-fw-body">Redundancy Enabled</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1"></div>

                  <div className="pt-4 border-t border-fw-secondary space-y-3">
                    <div className="flex items-center justify-between text-figma-base">
                      <div className="flex items-baseline gap-0.5">
                        <DollarSign className="h-4 w-4 text-fw-body" />
                        <span className="text-figma-xl font-bold text-fw-heading">{solution.monthlyStartingPrice}</span>
                        <span className="text-figma-sm text-fw-bodyLight">/month</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuildNetwork(solution)}
                      className="w-full inline-flex items-center justify-center px-6 py-3.5 font-semibold transition-all duration-200 text-figma-base bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--button-primary-focus-ring)] focus:ring-offset-2 rounded-lg shadow-sm hover:shadow-md active:shadow-sm group/btn"
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
          <div className="bg-fw-base rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-b from-fw-wash to-fw-base p-6 border-b border-fw-secondary">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-fw-base rounded-xl shadow-sm border border-fw-secondary">
                    {selectedSolution.logo ? (
                      <img src={selectedSolution.logo} alt={`${selectedSolution.name} logo`} className="h-10 w-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }} />
                    ) : null}
                    <Sparkles className={`h-10 w-10 text-fw-link ${selectedSolution.logo ? 'hidden' : ''}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-fw-heading tracking-[-0.03em]">{selectedSolution.name} Network</h3>
                    <p className="text-fw-bodyLight">Pre-configured network solution</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSolution(null)}
                  className="p-2 hover:bg-fw-neutral rounded-lg transition-colors"
                >
                  <ArrowRight className="h-5 w-5 rotate-90 text-fw-bodyLight" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-figma-base font-semibold text-fw-heading mb-3 uppercase tracking-wide">What You'll Get</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedSolution.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-fw-wash rounded-lg border border-fw-secondary">
                      <CheckCircle className="h-5 w-5 text-fw-link flex-shrink-0 mt-0.5" />
                      <span className="text-figma-base text-fw-body">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-figma-base font-semibold text-fw-heading mb-3 uppercase tracking-wide">Security Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedSolution.recommendedSetup.security.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-fw-wash rounded-lg">
                      <Shield className="h-4 w-4 text-fw-link" />
                      <span className="text-figma-base text-fw-body">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-fw-wash rounded-xl p-6 border border-fw-secondary">
                <h4 className="text-figma-base font-semibold text-fw-heading mb-4 uppercase tracking-wide">Setup Summary</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-figma-sm text-fw-bodyLight mb-1">Connection Type</div>
                    <div className="text-figma-base font-semibold text-fw-heading">{selectedSolution.recommendedSetup.connectionType}</div>
                  </div>
                  <div>
                    <div className="text-figma-sm text-fw-bodyLight mb-1">Bandwidth</div>
                    <div className="text-figma-base font-semibold text-fw-heading">{selectedSolution.recommendedSetup.bandwidth}</div>
                  </div>
                  <div>
                    <div className="text-figma-sm text-fw-bodyLight mb-1">Cloud Provider</div>
                    <div className="text-figma-base font-semibold text-fw-heading">{selectedSolution.providers.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-figma-sm text-fw-bodyLight mb-1">Setup Time</div>
                    <div className="text-figma-base font-semibold text-fw-heading">{selectedSolution.estimatedSetupTime}</div>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-figma-base text-fw-bodyLight">Starting at</span>
                  <span className="text-figma-xl font-bold text-fw-heading">${selectedSolution.monthlyStartingPrice}</span>
                  <span className="text-figma-base text-fw-bodyLight">/month</span>
                </div>
                <button
                  onClick={handleStartSetup}
                  className="w-full inline-flex items-center justify-center px-6 py-3.5 font-semibold transition-all duration-200 text-figma-base bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--button-primary-focus-ring)] focus:ring-offset-2 rounded-lg shadow-sm hover:shadow-md active:shadow-sm group/btn"
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
