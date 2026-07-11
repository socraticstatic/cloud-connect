import { useState, useEffect } from 'react';
import { ChevronRight, Save, AlertCircle, GitBranch, HelpCircle, X, CheckCircle2 } from 'lucide-react';
import { SideDrawer } from '../../common/SideDrawer';
import { Button } from '../../common/Button';
import { SiteSelectionPanel } from './SiteSelectionPanel';
import { BandwidthAllocationPanel } from './BandwidthAllocationPanel';
import { TAOConfigurationPanel } from './TAOConfigurationPanel';
import { LMCCConfigSummary } from './LMCCConfigSummary';
import LMCCWorkflowVisualization from './LMCCWorkflowVisualization';
import { LMCCConfiguration, LMCCBandwidthAllocation, TAOConfiguration } from '../../../types/lmcc';
import { lmccService, mockLMCCSites } from '../../../data/lmccService';

interface LMCCConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: LMCCConfiguration) => void;
  vnfId: string;
  existingConfig?: LMCCConfiguration;
}

type Step = 1 | 2 | 3 | 'review';

export function LMCCConfigDrawer({
  isOpen,
  onClose,
  onSave,
  vnfId,
  existingConfig
}: LMCCConfigDrawerProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [showWorkflowHelp, setShowWorkflowHelp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Configuration state
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [bandwidthAllocations, setBandwidthAllocations] = useState<LMCCBandwidthAllocation[]>([]);
  const [taoConfig, setTaoConfig] = useState<TAOConfiguration>({
    terminationType: 'public',
    baseSubnet: '10.100.0.0/16',
    startingVlanId: 100,
    ipAllocations: [],
    routingPolicy: 'static'
  });

  // Load existing configuration
  useEffect(() => {
    if (existingConfig) {
      setSelectedSites(existingConfig.selectedSites);
      setBandwidthAllocations(existingConfig.bandwidthAllocations);
      setTaoConfig(existingConfig.taoConfig);
    }
  }, [existingConfig]);

  // Initialize bandwidth allocations when sites are selected
  useEffect(() => {
    // Add default bandwidth for newly selected sites
    const newAllocations = [...bandwidthAllocations];
    selectedSites.forEach(siteId => {
      if (!newAllocations.find(a => a.siteId === siteId)) {
        newAllocations.push({ siteId, bandwidth: 100 });
      }
    });

    // Remove allocations for deselected sites
    const filteredAllocations = newAllocations.filter(a => selectedSites.includes(a.siteId));
    setBandwidthAllocations(filteredAllocations);
  }, [selectedSites]);

  const canProceedFromStep1 = selectedSites.length > 0;
  const canProceedFromStep2 = bandwidthAllocations.length > 0 && bandwidthAllocations.every(a => a.bandwidth > 0);
  const canProceedFromStep3 = taoConfig.terminationType && taoConfig.baseSubnet && taoConfig.startingVlanId;

  const handleNext = () => {
    if (currentStep === 1 && canProceedFromStep1) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedFromStep2) {
      setCurrentStep(3);
    } else if (currentStep === 3 && canProceedFromStep3) {
      setCurrentStep('review');
    }
  };

  const handleBack = () => {
    if (currentStep === 'review') {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onClose();
    }
  };

  const handleEditStep = (step: 1 | 2 | 3) => {
    setCurrentStep(step);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const configuration: LMCCConfiguration = {
        vnfId,
        selectedSites,
        bandwidthAllocations,
        taoConfig,
        status: 'active',
        createdAt: existingConfig?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await lmccService.saveConfiguration(configuration);
      onSave(configuration);

      window.addToast({
        type: 'success',
        title: 'LMCC Configuration Saved',
        message: 'Your LMCC configuration has been saved successfully.',
        duration: 3000
      });

      onClose();
    } catch (error) {
      window.addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save LMCC configuration. Please try again.',
        duration: 5000
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return existingConfig ? 'Edit LMCC Configuration' : 'Configure LMCC';
      case 2: return existingConfig ? 'Edit LMCC Configuration' : 'Configure LMCC';
      case 3: return existingConfig ? 'Edit LMCC Configuration' : 'Configure LMCC';
      case 'review': return 'Review & Save Configuration';
      default: return 'LMCC Configuration';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return 'Select the NetBond sites where your LMCC connection will be established';
      case 2: return 'Configure bandwidth allocation across your selected sites';
      case 3: return 'Set up Termination, Access, and Orchestration (TAO) parameters';
      case 'review': return 'Review your configuration before saving';
      default: return '';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <SiteSelectionPanel
            sites={mockLMCCSites}
            selectedSites={selectedSites}
            onSitesChange={setSelectedSites}
          />
        );
      case 2:
        return (
          <BandwidthAllocationPanel
            sites={mockLMCCSites}
            selectedSites={selectedSites}
            bandwidthAllocations={bandwidthAllocations}
            onBandwidthChange={setBandwidthAllocations}
          />
        );
      case 3:
        return (
          <TAOConfigurationPanel
            sites={mockLMCCSites}
            selectedSites={selectedSites}
            taoConfig={taoConfig}
            onConfigChange={setTaoConfig}
          />
        );
      case 'review':
        return (
          <LMCCConfigSummary
            sites={mockLMCCSites}
            configuration={{
              vnfId,
              selectedSites,
              bandwidthAllocations,
              taoConfig,
              status: 'active'
            }}
            onEditStep={handleEditStep}
          />
        );
    }
  };

  const getNextButtonText = () => {
    if (currentStep === 3) return 'Review Configuration';
    return 'Continue';
  };

  const canProceed = () => {
    if (currentStep === 1) return canProceedFromStep1;
    if (currentStep === 2) return canProceedFromStep2;
    if (currentStep === 3) return canProceedFromStep3;
    return true;
  };

  const getValidationMessage = () => {
    if (currentStep === 1 && !canProceedFromStep1) {
      return 'Please select at least one site to continue';
    }
    if (currentStep === 2 && !canProceedFromStep2) {
      return 'Please configure bandwidth for all selected sites';
    }
    if (currentStep === 3 && !canProceedFromStep3) {
      return 'Please complete all required TAO configuration fields';
    }
    return null;
  };

  const footer = (
    <div className="space-y-3">
      {/* Validation Message */}
      {!canProceed() && getValidationMessage() && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">{getValidationMessage()}</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
        >
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </Button>

        {currentStep === 'review' ? (
          <Button
            variant="primary"
            onClick={handleSave}
            icon={Save}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleNext}
            icon={ChevronRight}
            disabled={!canProceed()}
          >
            {getNextButtonText()}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={getStepTitle()}
      size="xl"
      footer={footer}
    >
      {/* Step Description */}
      {currentStep !== 'review' && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">{getStepDescription()}</p>
        </div>
      )}

      {/* Configuration Header with Progress and Help */}
      <div className="mb-6 space-y-4">
        {/* Progress Indicator */}
        {currentStep !== 'review' && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Configuration Progress</h3>
              <button
                onClick={() => setShowWorkflowHelp(!showWorkflowHelp)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <HelpCircle className="w-4 h-4" />
                {showWorkflowHelp ? 'Hide' : 'View'} Workflow Guide
              </button>
            </div>
            <div className="flex items-center gap-2">
              {[
                { num: 1, label: 'Sites', complete: selectedSites.length > 0 },
                { num: 2, label: 'Bandwidth', complete: bandwidthAllocations.length > 0 && currentStep > 2 },
                { num: 3, label: 'TAO', complete: canProceedFromStep3 && currentStep > 3 }
              ].map((step, idx) => (
                <div key={step.num} className="flex items-center flex-1">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0
                        ${step.complete
                          ? 'bg-green-600 text-white'
                          : currentStep === step.num
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                        }
                      `}
                    >
                      {step.complete ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                    </div>
                    <div className="flex-1">
                      <div className={`text-xs font-medium ${
                        currentStep === step.num ? 'text-blue-700' : step.complete ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {step.label}
                      </div>
                      {currentStep === step.num && (
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div className="bg-blue-600 h-1 rounded-full transition-all" style={{ width: '60%' }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                  {idx < 2 && (
                    <div className={`w-8 h-0.5 mx-1 ${step.complete ? 'bg-green-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workflow Help Panel */}
        {showWorkflowHelp && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
            <div className="p-3 bg-blue-100 border-b border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-semibold text-blue-900">LMCC Integration Workflow</h3>
              </div>
              <button
                onClick={() => setShowWorkflowHelp(false)}
                className="text-blue-700 hover:text-blue-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <LMCCWorkflowVisualization />
            </div>
          </div>
        )}
      </div>

      {/* Step Content */}
      <div>
        {renderStepContent()}
      </div>
    </SideDrawer>
  );
}
