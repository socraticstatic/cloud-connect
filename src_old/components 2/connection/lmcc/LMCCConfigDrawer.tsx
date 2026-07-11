import { useState, useEffect } from 'react';
import { ChevronRight, Save, AlertCircle, GitBranch } from 'lucide-react';
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

type Step = 'workflow' | 1 | 2 | 3 | 'review';

export function LMCCConfigDrawer({
  isOpen,
  onClose,
  onSave,
  vnfId,
  existingConfig
}: LMCCConfigDrawerProps) {
  const [currentStep, setCurrentStep] = useState<Step>('workflow');
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
    if (currentStep === 'workflow') {
      setCurrentStep(1);
    } else if (currentStep === 1 && canProceedFromStep1) {
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
    } else if (currentStep === 1) {
      setCurrentStep('workflow');
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
      case 'workflow': return 'LMCC Integration Workflow';
      case 1: return 'Step 1 of 3: Select Sites';
      case 2: return 'Step 2 of 3: Allocate Bandwidth';
      case 3: return 'Step 3 of 3: Configure TAO';
      case 'review': return 'Review Configuration';
      default: return 'LMCC Configuration';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'workflow':
        return <LMCCWorkflowVisualization />;
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
    if (currentStep === 'workflow') return 'Start Configuration';
    if (currentStep === 3) return 'Review Configuration';
    return 'Next';
  };

  const canProceed = () => {
    if (currentStep === 'workflow') return true;
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
      {/* Step Indicator */}
      {currentStep !== 'workflow' && currentStep !== 'review' && (
        <div className="mb-6 flex items-center justify-center">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`
                      w-12 h-0.5 mx-1
                      ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Navigation */}
      {currentStep === 'workflow' && (
        <div className="mb-6 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <GitBranch className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Understanding LMCC Integration</h3>
              <p className="text-sm text-gray-600">Review the complete workflow before configuring your connection</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStep(1)}
          >
            Skip to Configuration
          </Button>
        </div>
      )}

      {/* Step Content */}
      <div>
        {renderStepContent()}
      </div>
    </SideDrawer>
  );
}
