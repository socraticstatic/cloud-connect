import { useState } from 'react';
import { Cloud, ArrowRight, CheckCircle2, ExternalLink, Info, Sparkles, Network, Building2 } from 'lucide-react';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

interface AWSConnection {
  id: string;
  requestId: string;
  connectionName: string;
  region: string;
  bandwidth: string;
  status: 'pending-config' | 'in-progress' | 'completed';
  customerEmail: string;
  timestamp: string;
}

export function AWSPartnerZone() {
  const navigate = useNavigate();

  const [pendingConnections] = useState<AWSConnection[]>([
    {
      id: 'aws-001',
      requestId: 'AWS-REQ-789012',
      connectionName: 'att-lmcc-prod-001',
      region: 'us-east-1',
      bandwidth: '10 Gbps',
      status: 'pending-config',
      customerEmail: 'user@company.com',
      timestamp: new Date().toISOString()
    }
  ]);

  const handleConfigureConnection = (connection: AWSConnection) => {
    window.addToast?.({
      type: 'info',
      title: 'AWS Connection Configuration',
      message: `Opening LMCC configuration wizard for ${connection.connectionName}`,
      duration: 3000
    });
  };

  const handleViewWorkflow = () => {
    navigate('/aws-workflow');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AWS Partner Integration</h2>
              <p className="text-sm text-gray-600">Direct Connect via AWS Marketplace</p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<Info className="h-4 w-4" />}
          onClick={handleViewWorkflow}
        >
          View Workflow
        </Button>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-orange-50 to-blue-50 border border-orange-200 rounded-xl p-6">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-orange-300 mb-3">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-semibold text-orange-900">AWS Direct Connect Partner</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Seamless Connection from AWS Console
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Initiate your AT&T NetBond connection directly from the AWS Direct Connect console.
              We'll guide you through LMCC site selection, bandwidth allocation, and TAO configuration.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://console.aws.amazon.com/directconnect"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
              >
                Open AWS Console
                <ExternalLink className="w-4 h-4" />
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewWorkflow}
              >
                Learn How It Works
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Integration Flow</div>
            <div className="space-y-3">
              {[
                { icon: Cloud, label: 'AWS Console', desc: 'Select AT&T as partner' },
                { icon: ArrowRight, label: 'API Handoff', desc: 'AWS sends details to AT&T' },
                { icon: Network, label: 'NetBond Config', desc: 'Configure LMCC sites & TAO' },
                { icon: Building2, label: 'Business Center', desc: 'Billing & provisioning' },
                { icon: CheckCircle2, label: 'Complete', desc: 'Connection activated' }
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900">{step.label}</div>
                      <div className="text-xs text-gray-600">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Connections */}
      {pendingConnections.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Pending AWS Connections
              <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                {pendingConnections.length}
              </span>
            </h3>
          </div>
          <div className="space-y-3">
            {pendingConnections.map((connection) => (
              <div
                key={connection.id}
                className="bg-white border border-amber-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                        <Cloud className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{connection.connectionName}</h4>
                        <p className="text-xs text-gray-600">Request ID: {connection.requestId}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      <div>
                        <div className="text-xs text-gray-500">AWS Region</div>
                        <div className="text-sm font-medium text-gray-900">{connection.region}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Bandwidth</div>
                        <div className="text-sm font-medium text-gray-900">{connection.bandwidth}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Customer Email</div>
                        <div className="text-sm font-medium text-gray-900">{connection.customerEmail}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Status</div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-semibold">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                          Awaiting Configuration
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleConfigureConnection(connection)}
                  >
                    Configure Now
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benefits Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Connect via AWS?</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Streamlined Onboarding</h4>
            <p className="text-sm text-gray-600">
              Start from AWS Console, complete configuration in NetBond portal. No duplicate data entry required.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Unified Billing</h4>
            <p className="text-sm text-gray-600">
              Transparent pricing displayed in AWS Console before approval. All costs clearly outlined upfront.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center mb-3">
              <Network className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Multi-Site LMCC</h4>
            <p className="text-sm text-gray-600">
              Configure connections across multiple AT&T NetBond locations with flexible bandwidth allocation.
            </p>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div>
              <div className="font-medium text-gray-900">Navigate to AWS Direct Connect</div>
              <div className="text-sm text-gray-600">
                In AWS Console: Networking & Content Delivery → Direct Connect → Create Connection
              </div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div>
              <div className="font-medium text-gray-900">Select AT&T as Partner</div>
              <div className="text-sm text-gray-600">
                Choose AT&T NetBond from the partner list and submit your connection request
              </div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div>
              <div className="font-medium text-gray-900">Configure in NetBond Portal</div>
              <div className="text-sm text-gray-600">
                You'll receive an email to complete LMCC configuration. Your connection will appear above.
              </div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              4
            </div>
            <div>
              <div className="font-medium text-gray-900">Review & Approve</div>
              <div className="text-sm text-gray-600">
                Review pricing in AWS Console and approve to begin provisioning
              </div>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
