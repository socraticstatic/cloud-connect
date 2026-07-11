import React, { useState } from 'react';
import { Cloud, Building2, CheckCircle, AlertCircle, ArrowRight, Users, Lock, CreditCard, Settings, FileText, Zap, MousePointer, Code, Database, Network } from 'lucide-react';
import { Button } from '../../common/Button';
import { SiteSelectionPanel } from './SiteSelectionPanel';
import { BandwidthAllocationPanel } from './BandwidthAllocationPanel';
import { TAOConfigurationPanel } from './TAOConfigurationPanel';
import { mockLMCCSites } from '../../../data/lmccService';
import { LMCCBandwidthAllocation, TAOConfiguration } from '../../../types/lmcc';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  type: 'customer' | 'aws' | 'netbond' | 'business-center' | 'decision';
  icon: React.ComponentType<{ className?: string }>;
  awsConsoleCallout?: string;
  technicalDetails?: string[];
  criticalNote?: string;
}

export default function LMCCWorkflowVisualization() {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [activeStep, setActiveStep] = useState<string>('customer-start');
  const [showAWSConsole, setShowAWSConsole] = useState(false);
  const [showBusinessCenter, setShowBusinessCenter] = useState(false);
  const [showNetBondPortal, setShowNetBondPortal] = useState(false);
  const [showSiteSelection, setShowSiteSelection] = useState(false);
  const [showBandwidthAllocation, setShowBandwidthAllocation] = useState(false);
  const [showTAOConfig, setShowTAOConfig] = useState(false);

  // Demo configuration state
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [bandwidthAllocations, setBandwidthAllocations] = useState<LMCCBandwidthAllocation[]>([]);
  const [taoConfig, setTaoConfig] = useState<TAOConfiguration>({
    terminationType: 'public',
    baseSubnet: '10.100.0.0/16',
    startingVlanId: 100,
    ipAllocations: [],
    routingPolicy: 'static'
  });

  // Initialize bandwidth allocations when sites are selected
  React.useEffect(() => {
    const newAllocations = [...bandwidthAllocations];
    selectedSites.forEach(siteId => {
      if (!newAllocations.find(a => a.siteId === siteId)) {
        newAllocations.push({ siteId, bandwidth: 100 });
      }
    });
    const filteredAllocations = newAllocations.filter(a => selectedSites.includes(a.siteId));
    if (filteredAllocations.length !== bandwidthAllocations.length) {
      setBandwidthAllocations(filteredAllocations);
    }
  }, [selectedSites]);

  // Define workflow step order
  const stepOrder = [
    'customer-start',
    'aws-console-navigation',
    'aws-console-partner-select',
    'aws-api-call',
    'netbond-portal',
    'business-center',
    'customer-sign-email',
    'lmcc-config-sites',
    'lmcc-config-tao',
    'connection-type-decision',
    'redundancy-decision',
    'billing-surprise',
    'aws-billing-display',
    'aws-approval',
    'api-return-aws',
    'provisioning',
    'soc-update',
    'complete'
  ];

  // Helper to determine if a step is accessible
  const isStepAccessible = (stepId: string): boolean => {
    const stepIndex = stepOrder.indexOf(stepId);
    if (stepIndex === 0) return true;
    const previousStepId = stepOrder[stepIndex - 1];
    return completedSteps.has(previousStepId);
  };

  // Helper to determine step status
  const getStepStatus = (stepId: string): WorkflowStep['status'] => {
    if (completedSteps.has(stepId)) return 'completed';
    if (activeStep === stepId) return 'active';
    return 'pending';
  };

  const workflowSteps: WorkflowStep[] = [
    {
      id: 'customer-start',
      title: 'Customer Initiates',
      description: 'Existing AT&T customer logs into AWS Console to begin connection setup',
      status: getStepStatus('customer-start'),
      type: 'customer',
      icon: Users
    },
    {
      id: 'aws-console-navigation',
      title: 'AWS Console - Navigate to Direct Connect',
      description: 'Navigate to Networking & Content Delivery section in AWS Console',
      status: getStepStatus('aws-console-navigation'),
      type: 'aws',
      icon: MousePointer,
      awsConsoleCallout: 'Navigate to: AWS Console > Networking & Content Delivery > Direct Connect'
    },
    {
      id: 'aws-console-partner-select',
      title: 'AWS Console - Select AT&T Partner',
      description: 'Select AT&T as your connection partner from the available options',
      status: getStepStatus('aws-console-partner-select'),
      type: 'aws',
      icon: Cloud,
      awsConsoleCallout: 'Create Connection > Select Partner: AT&T'
    },
    {
      id: 'aws-api-call',
      title: 'AWS API Integration',
      description: 'AWS securely transmits customer details and connection parameters to AT&T',
      status: getStepStatus('aws-api-call'),
      type: 'aws',
      icon: Code,
      technicalDetails: [
        'Parameters include:',
        '- Customer Name',
        '- Customer Email',
        '- Connection Name',
        '- Bandwidth Requirements',
        '- ASN/CIDR Configuration',
        '- AWS Region'
      ]
    },
    {
      id: 'netbond-portal',
      title: 'NetBond Advanced Portal',
      description: 'Customer receives email notification to complete connection setup in NetBond portal',
      status: getStepStatus('netbond-portal'),
      type: 'netbond',
      icon: Network
    },
    {
      id: 'business-center',
      title: 'Business Center Registration',
      description: 'Verify or complete Business Center registration if not already registered',
      status: getStepStatus('business-center'),
      type: 'decision',
      icon: AlertCircle,
      criticalNote: 'First-time users will be prompted to complete Business Center registration'
    },
    {
      id: 'customer-sign-email',
      title: 'Customer Authentication',
      description: 'Sign in to NetBond Advanced portal using your email address',
      status: getStepStatus('customer-sign-email'),
      type: 'netbond',
      icon: Lock
    },
    {
      id: 'lmcc-config-sites',
      title: 'LMCC Site Selection',
      description: 'Select the geographic sites where your LMCC connection will be established',
      status: getStepStatus('lmcc-config-sites'),
      type: 'netbond',
      icon: Settings
    },
    {
      id: 'lmcc-config-tao',
      title: 'TAO Configuration',
      description: 'Configure Transport Access Options including IP addressing and routing preferences',
      status: getStepStatus('lmcc-config-tao'),
      type: 'netbond',
      icon: Settings
    },
    {
      id: 'connection-type-decision',
      title: 'Connection Type Selection',
      description: 'Select connection type: IP to Cloud or Internet to Cloud',
      status: getStepStatus('connection-type-decision'),
      type: 'decision',
      icon: AlertCircle
    },
    {
      id: 'redundancy-decision',
      title: 'Redundancy Configuration',
      description: 'Choose redundancy options for high availability and failover protection',
      status: getStepStatus('redundancy-decision'),
      type: 'decision',
      icon: Network
    },
    {
      id: 'billing-surprise',
      title: 'Billing Preview',
      description: 'Review complete billing breakdown and pricing for your LMCC connection',
      status: getStepStatus('billing-surprise'),
      type: 'netbond',
      icon: CreditCard,
      criticalNote: 'Transparent pricing with no surprises - review all charges before proceeding'
    },
    {
      id: 'aws-billing-display',
      title: 'AWS Console - Pricing Confirmation',
      description: 'AWS Console displays final pricing and billing details',
      status: getStepStatus('aws-billing-display'),
      type: 'aws',
      icon: CreditCard,
      criticalNote: 'Confirm pricing matches your expectations'
    },
    {
      id: 'aws-approval',
      title: 'AWS Console - Final Approval',
      description: 'Review complete connection configuration and approve to begin provisioning',
      status: getStepStatus('aws-approval'),
      type: 'aws',
      icon: FileText,
      awsConsoleCallout: 'Review and approve configuration to start provisioning'
    },
    {
      id: 'api-return-aws',
      title: 'API Response to AWS',
      description: 'AT&T confirms connection acceptance and returns provisioning details to AWS',
      status: getStepStatus('api-return-aws'),
      type: 'aws',
      icon: Code
    },
    {
      id: 'provisioning',
      title: 'Connection Provisioning',
      description: 'NetBond Advanced provisions your LMCC connection across all selected sites',
      status: getStepStatus('provisioning'),
      type: 'netbond',
      icon: Zap
    },
    {
      id: 'soc-update',
      title: 'Service Operations Notification',
      description: 'Service operations team is notified to coordinate final provisioning steps',
      status: getStepStatus('soc-update'),
      type: 'business-center',
      icon: Building2
    },
    {
      id: 'complete',
      title: 'Connection Active',
      description: 'Your LMCC connection is now live and ready for use',
      status: getStepStatus('complete'),
      type: 'netbond',
      icon: CheckCircle
    }
  ];

  const getStepBorderColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return 'border-gray-300';
      case 'active': return 'border-blue-500';
      case 'error': return 'border-red-400';
      default: return 'border-gray-200';
    }
  };

  const getTypeLabel = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'aws': return 'AWS Console';
      case 'netbond': return 'NetBond Advanced';
      case 'business-center': return 'Business Center';
      case 'decision': return 'Decision Point';
      default: return 'Customer Action';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">LMCC Integration Workflow</h2>
        <p className="text-sm text-gray-600 mt-1">
          Complete end-to-end flow from AWS Console to NetBond Advanced provisioning
        </p>
      </div>

      {/* Workflow Steps */}
      <div className="relative">
        <div className="space-y-3">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            const isAccessible = isStepAccessible(step.id);
            const isDisabled = !isAccessible && step.status === 'pending';

            return (
              <div key={step.id} className="relative">
                {/* Connector Line */}
                {index < workflowSteps.length - 1 && (
                  <div className="absolute left-10 top-16 w-0.5 h-8 bg-gray-200"></div>
                )}

                {/* Step Card */}
                <div
                  className={`bg-white flex items-start gap-4 p-4 rounded-lg border transition-all ${
                    isDisabled
                      ? 'opacity-40 cursor-not-allowed'
                      : 'cursor-pointer hover:shadow-sm'
                  } ${getStepBorderColor(step.status)}`}
                  onClick={() => isAccessible && setActiveStep(step.id)}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center border ${
                    step.status === 'completed' ? 'bg-gray-50 border-gray-300' :
                    step.status === 'active' ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      step.status === 'completed' ? 'text-gray-600' :
                      step.status === 'active' ? 'text-blue-600' :
                      'text-gray-400'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{step.title}</h3>
                          {step.status === 'completed' && (
                            <CheckCircle className="w-4 h-4 text-gray-500" />
                          )}
                          {step.status === 'active' && (
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{getTypeLabel(step.type)}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{step.description}</p>

                    {/* AWS Console Callout */}
                    {step.awsConsoleCallout && (
                      <div className="mt-3 p-3 bg-gray-50 border-l-2 border-gray-300 rounded">
                        <div className="flex items-start gap-2">
                          <MousePointer className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-700">{step.awsConsoleCallout}</span>
                        </div>
                      </div>
                    )}

                    {/* Technical Details */}
                    {step.technicalDetails && step.technicalDetails.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded text-xs">
                        <div className="flex items-start gap-2 mb-2">
                          <Code className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="font-medium text-gray-700">Technical Details</span>
                        </div>
                        <ul className="ml-5 space-y-1 text-gray-600 list-disc">
                          {step.technicalDetails.map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Critical Note */}
                    {step.criticalNote && (
                      <div className="mt-3 p-3 bg-amber-50 border-l-2 border-amber-500 rounded">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs font-medium text-amber-900">{step.criticalNote}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {step.status === 'active' && (
                      <div className="mt-3 flex gap-2">
                        {(step.id === 'aws-console-navigation' || step.id === 'aws-console-partner-select') && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAWSConsole(true);
                            }}
                          >
                            View AWS Console
                          </Button>
                        )}
                        {step.id === 'business-center' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowBusinessCenter(true);
                            }}
                          >
                            Open Business Center
                          </Button>
                        )}
                        {step.id === 'netbond-portal' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowNetBondPortal(true);
                            }}
                          >
                            Open NetBond Portal
                          </Button>
                        )}
                        {step.id === 'lmcc-config-sites' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowSiteSelection(true);
                            }}
                          >
                            Configure LMCC Sites
                          </Button>
                        )}
                        {step.id === 'lmcc-config-tao' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowTAOConfig(true);
                            }}
                          >
                            Configure TAO Parameters
                          </Button>
                        )}
                        {step.id === 'billing-surprise' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowBandwidthAllocation(true);
                            }}
                          >
                            View Billing & Bandwidth
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Mark current step as completed
                            setCompletedSteps(prev => new Set(prev).add(step.id));

                            // Move to next step
                            const currentIndex = stepOrder.indexOf(step.id);
                            if (currentIndex < stepOrder.length - 1) {
                              setActiveStep(stepOrder[currentIndex + 1]);
                            }
                          }}
                        >
                          Complete Step <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Key Integration Points */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Key Integration Points</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <MousePointer className="w-4 h-4 mt-0.5 text-orange-600 flex-shrink-0" />
            <span><strong>AWS Console Navigation:</strong> Customer navigates AWS Console → Networking & Content Delivery → Direct Connect → Select AT&T Partner</span>
          </li>
          <li className="flex items-start gap-2">
            <Code className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
            <span><strong>AWS API Integration:</strong> AT&T receives connection request with parameters (Customer Name, Email, Bandwidth, ASN/CIDR, Region) via REST API</span>
          </li>
          <li className="flex items-start gap-2">
            <Network className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
            <span><strong>NetBond Advanced Portal:</strong> Customer redirected to portal to configure LMCC sites, bandwidth allocation, and TAO parameters</span>
          </li>
          <li className="flex items-start gap-2">
            <Building2 className="w-4 h-4 mt-0.5 text-purple-600 flex-shrink-0" />
            <span><strong>Business Center Registration:</strong> White-labeled BC-3Wreqs integration for multi-tenant billing and account management</span>
          </li>
          <li className="flex items-start gap-2">
            <CreditCard className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
            <span><strong>Surprise-Free Billing:</strong> All connection costs displayed in AWS Console before final approval - billing parameters passed back to console</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" />
            <span><strong>Connection Type:</strong> IP to Cloud connectivity (not Internet to Cloud) with optional metro redundancy</span>
          </li>
          <li className="flex items-start gap-2">
            <Database className="w-4 h-4 mt-0.5 text-gray-600 flex-shrink-0" />
            <span><strong>API Response:</strong> JSON payload returned to AWS with connection details, signature, and environment configuration</span>
          </li>
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
            <span><strong>Provisioning & SOC:</strong> NetBond Advanced provisions connection across sites, alerts BC billing team and SOC</span>
          </li>
        </ul>
      </div>

      {/* AWS Console Mockup Modal */}
      {showAWSConsole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAWSConsole(false)}>
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">AWS Direct Connect Console - Partner Integration</h2>
                <button onClick={() => setShowAWSConsole(false)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Console Navigation Path */}
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MousePointer className="w-4 h-4 text-gray-500" />
                    Console Navigation Path
                  </div>
                  <div className="text-sm text-gray-600 font-mono">
                    AWS Console → Networking & Content Delivery → Direct Connect → Create Connection
                  </div>
                </div>

                {/* AWS Console Interface Mockup */}
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  {/* AWS Header */}
                  <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between">
                    <div className="font-semibold">AWS Direct Connect</div>
                    <div className="text-xs text-gray-400">us-east-1</div>
                  </div>

                  {/* Console Content */}
                  <div className="bg-white p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Connection</h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Connection Name</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            placeholder="my-att-connection"
                            value="att-lmcc-prod-001"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Port Speed</label>
                          <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                            <option>10 Gbps</option>
                            <option>100 Gbps</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location / Partner</label>
                        <div className="border border-blue-400 bg-blue-50 rounded px-3 py-2">
                          <div className="font-medium text-blue-900">AT&T NetBond</div>
                          <div className="text-xs text-blue-700 mt-1">Direct Connect Partner - Requires configuration in AT&T portal</div>
                        </div>
                      </div>

                      {/* Parameters Section */}
                      <div className="bg-gray-50 border border-gray-200 rounded p-4">
                        <div className="text-sm font-medium text-gray-700 mb-3">Connection Parameters (Sent to AT&T)</div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div><span className="text-gray-500">Customer Email:</span> <span className="font-mono">user@company.com</span></div>
                          <div><span className="text-gray-500">Bandwidth:</span> <span className="font-mono">10 Gbps</span></div>
                          <div><span className="text-gray-500">ASN:</span> <span className="font-mono">65000</span></div>
                          <div><span className="text-gray-500">Region:</span> <span className="font-mono">us-east-1</span></div>
                          <div><span className="text-gray-500">CIDR:</span> <span className="font-mono">10.0.0.0/16</span></div>
                          <div><span className="text-gray-500">Connection Name:</span> <span className="font-mono">att-lmcc-prod-001</span></div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t">
                        <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 font-medium text-sm">
                          Create Connection with AT&T
                        </button>
                        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Steps Callout */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-blue-900 mb-1">What Happens Next?</div>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>AWS sends connection request to AT&T API with all parameters</li>
                        <li>You'll receive notification to complete setup in NetBond Advanced portal</li>
                        <li>Configure LMCC sites, bandwidth allocation, and TAO settings</li>
                        <li>Review billing - costs will be displayed back in this AWS console</li>
                        <li>Approve and provision connection</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setShowAWSConsole(false)}>
                    Close
                  </Button>
                  <Button onClick={() => { setShowAWSConsole(false); setActiveStep('aws-api-call'); }}>
                    Simulate: Send to AT&T <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Center Mockup Modal */}
      {showBusinessCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowBusinessCenter(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">AT&T Business Center Registration</h2>
                <button onClick={() => setShowBusinessCenter(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="border border-gray-300 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input type="text" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Enter company name" />
                </div>
                <div className="border border-gray-300 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Email</label>
                  <input type="email" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="email@company.com" />
                </div>
                <div className="border border-gray-300 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
                  <textarea className="w-full border border-gray-300 rounded px-3 py-2" rows={3} placeholder="Enter billing address"></textarea>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-4 rounded">
                  <p className="text-sm text-gray-700">
                    <strong>3Wreqs Integration:</strong> This registration will link your account to Business Center
                    for billing and account management purposes.
                  </p>
                </div>
                <Button onClick={() => { setShowBusinessCenter(false); setActiveStep('customer-sign-email'); }}>
                  Complete Registration
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NetBond Portal Overview Modal */}
      {showNetBondPortal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowNetBondPortal(false)}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">NetBond Advanced Portal</h2>
                <button onClick={() => setShowNetBondPortal(false)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Network className="h-5 w-5 text-gray-600" />
                    Connection Request from AWS
                  </h3>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between"><span className="text-gray-600">Request ID:</span> <span className="font-mono text-gray-900">AWS-REQ-789012</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Connection Type:</span> <span className="font-semibold text-gray-900">LMCC</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">AWS Region:</span> <span className="font-mono text-gray-900">us-east-1</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Requested Bandwidth:</span> <span className="font-semibold text-gray-900">10 Gbps</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Status:</span> <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-semibold">Pending Configuration</span></div>
                  </div>
                </div>
                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Configuration Steps Required</h4>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">1</div>
                      <div>
                        <div className="font-medium text-gray-900">Select LMCC Sites</div>
                        <div className="text-sm text-gray-600">Choose NetBond locations for multi-point connectivity</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">2</div>
                      <div>
                        <div className="font-medium text-gray-900">Allocate Bandwidth</div>
                        <div className="text-sm text-gray-600">Configure bandwidth distribution across selected sites</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">3</div>
                      <div>
                        <div className="font-medium text-gray-900">Configure TAO Parameters</div>
                        <div className="text-sm text-gray-600">Set up Termination, Orchestration, IP addressing, and routing</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">4</div>
                      <div>
                        <div className="font-medium text-gray-900">Review & Approve Billing</div>
                        <div className="text-sm text-gray-600">Confirm costs before provisioning (passed back to AWS)</div>
                      </div>
                    </li>
                  </ol>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setShowNetBondPortal(false)}>
                    Close
                  </Button>
                  <Button onClick={() => { setShowNetBondPortal(false); setActiveStep('lmcc-config-sites'); }}>
                    Start Configuration <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Site Selection Configuration Modal */}
      {showSiteSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowSiteSelection(false)}>
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">NetBond Advanced Portal - Site Selection</h2>
                  <p className="text-sm text-gray-600 mt-1">Step 1 of 3: Configure LMCC Sites</p>
                </div>
                <button onClick={() => setShowSiteSelection(false)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <SiteSelectionPanel
                sites={mockLMCCSites}
                selectedSites={selectedSites}
                onSitesChange={setSelectedSites}
              />
              <div className="mt-6 flex justify-between pt-4 border-t border-gray-200">
                <Button variant="secondary" onClick={() => setShowSiteSelection(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowSiteSelection(false);
                    setActiveStep('lmcc-config-tao');
                    // Simulate moving to next step
                    setTimeout(() => setShowBandwidthAllocation(true), 300);
                  }}
                  disabled={selectedSites.length === 0}
                >
                  Next: Configure Bandwidth <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bandwidth Allocation Configuration Modal */}
      {showBandwidthAllocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowBandwidthAllocation(false)}>
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">NetBond Advanced Portal - Bandwidth Allocation</h2>
                  <p className="text-sm text-gray-600 mt-1">Step 2 of 3: Configure Bandwidth & View Billing</p>
                </div>
                <button onClick={() => setShowBandwidthAllocation(false)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <BandwidthAllocationPanel
                sites={mockLMCCSites}
                selectedSites={selectedSites}
                bandwidthAllocations={bandwidthAllocations}
                onBandwidthChange={setBandwidthAllocations}
              />
              <div className="mt-6 flex justify-between pt-4 border-t border-gray-200">
                <Button variant="secondary" onClick={() => setShowBandwidthAllocation(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowBandwidthAllocation(false);
                    setActiveStep('billing-surprise');
                    // Simulate moving to next step
                    setTimeout(() => setShowTAOConfig(true), 300);
                  }}
                  disabled={bandwidthAllocations.length === 0}
                >
                  Next: Configure TAO <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAO Configuration Modal */}
      {showTAOConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowTAOConfig(false)}>
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">NetBond Advanced Portal - TAO Configuration</h2>
                  <p className="text-sm text-gray-600 mt-1">Step 3 of 3: Configure Termination & Orchestration</p>
                </div>
                <button onClick={() => setShowTAOConfig(false)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <TAOConfigurationPanel
                sites={mockLMCCSites}
                selectedSites={selectedSites}
                taoConfig={taoConfig}
                onConfigChange={setTaoConfig}
              />
              <div className="mt-6 flex justify-between pt-4 border-t border-gray-200">
                <Button variant="secondary" onClick={() => setShowTAOConfig(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowTAOConfig(false);
                    setActiveStep('aws-billing-display');
                    window.addToast?.({
                      type: 'success',
                      title: 'Configuration Complete',
                      message: 'LMCC configuration saved. Billing details will be sent to AWS Console for approval.',
                      duration: 5000
                    });
                  }}
                >
                  Complete Configuration <CheckCircle className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
