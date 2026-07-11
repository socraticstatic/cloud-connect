import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code, Database, Zap, ArrowRight, ArrowLeft, Check, Upload, Download,
  PlayCircle, AlertCircle, CheckCircle, XCircle, Copy, RefreshCw,
  Globe, Lock, Key, FileJson, Plug, Network, Sparkles, Link2
} from 'lucide-react';
import { Button } from '../common/Button';
import { PhaseIndicator } from '../wizard/PhaseIndicator';
import { APIExplorer } from './APIExplorer';
import { APIImportStep } from './steps/APIImportStep';
import { APIConfigureStep } from './steps/APIConfigureStep';
import { APIMappingStep } from './steps/APIMappingStep';
import { APITestStep } from './steps/APITestStep';
import { APIReviewStep } from './steps/APIReviewStep';

export interface APIConfig {
  name: string;
  description: string;
  baseUrl: string;
  authType: 'none' | 'apiKey' | 'bearer' | 'oauth2' | 'basic';
  authConfig?: {
    apiKey?: string;
    headerName?: string;
    token?: string;
    username?: string;
    password?: string;
  };
  endpoints: APIEndpoint[];
  headers?: Record<string, string>;
  timeout?: number;
  retryPolicy?: {
    enabled: boolean;
    maxRetries: number;
    backoffMultiplier: number;
  };
}

export interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description?: string;
  parameters?: APIParameter[];
  requestBody?: any;
  responseSchema?: any;
  mapping?: DataMapping;
}

export interface APIParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'body';
  type: string;
  required: boolean;
  description?: string;
  default?: any;
}

export interface DataMapping {
  source: string;
  target: string;
  transformation?: string;
  filter?: string;
}

export function APIToolbox() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'builder' | 'explorer'>('explorer');
  const [currentStep, setCurrentStep] = useState(1);
  const [apiConfig, setApiConfig] = useState<Partial<APIConfig>>({
    authType: 'none',
    timeout: 30000,
    retryPolicy: {
      enabled: true,
      maxRetries: 3,
      backoffMultiplier: 2
    }
  });

  const STEPS = [
    { title: 'Import API', description: 'Import OpenAPI/Swagger or JSON definition' },
    { title: 'Configure', description: 'Set authentication and connection details' },
    { title: 'Map Data', description: 'Map API data to network connections' },
    { title: 'Test', description: 'Test API connectivity and responses' },
    { title: 'Review', description: 'Review and deploy your API integration' }
  ];

  const stepComponents = [
    APIImportStep,
    APIConfigureStep,
    APIMappingStep,
    APITestStep,
    APIReviewStep
  ];

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    window.addToast?.({
      type: 'success',
      title: 'API Integration Created',
      message: `API "${apiConfig.name}" has been successfully configured`,
      duration: 3000
    });
    navigate('/manage');
  };

  const handleCancel = () => {
    navigate('/create');
  };

  const CurrentStepComponent = stepComponents[currentStep - 1];

  return (
    <div className="bg-fw-base rounded-2xl shadow-xl p-8">
      {/* Tab bar - rounded pill style */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`px-5 h-9 rounded-full text-figma-base font-medium transition-colors ${
            activeTab === 'explorer'
              ? 'bg-fw-primary text-white'
              : 'bg-fw-wash text-fw-body border border-fw-secondary hover:bg-fw-accent'
          }`}
        >
          API Explorer
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-5 h-9 rounded-full text-figma-base font-medium transition-colors ${
            activeTab === 'builder'
              ? 'bg-fw-primary text-white'
              : 'bg-fw-wash text-fw-body border border-fw-secondary hover:bg-fw-accent'
          }`}
        >
          API Builder
        </button>
      </div>

      {activeTab === 'explorer' ? (
        <APIExplorer />
      ) : (
      <>
      <div className="flex items-center justify-center space-x-4 mb-8">
        <button
          onClick={handleCancel}
          className="text-fw-link hover:text-fw-linkHover flex items-center"
        >
          Change Creation Mode
        </button>
      </div>

      <div className="max-w-4xl mx-auto mb-12">
        <PhaseIndicator
          phases={STEPS}
          currentPhase={currentStep - 1}
          className="w-full"
        />
      </div>

      <div className="max-w-3xl mx-auto">
        <CurrentStepComponent
          config={apiConfig}
          onChange={setApiConfig}
          onNext={handleNext}
        />

        <div className="mt-12 flex justify-between">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <div className="space-x-4">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
              >
                Back
              </Button>
            )}
            {currentStep < STEPS.length ? (
              <Button
                variant="primary"
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleComplete}
              >
                Complete Setup
              </Button>
            )}
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
