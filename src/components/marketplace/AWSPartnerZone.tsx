import { useState } from 'react';
import { ArrowRight, CheckCircle2, Info, Shield, Server, Globe } from 'lucide-react';
import { Button } from '../common/Button';
import { AttIcon } from '../icons/AttIcon';
import { useNavigate } from 'react-router-dom';
import { LMCCStatusPanel } from '../connection/lmcc/LMCCStatusPanel';
import { MOCK_LMCC_CONNECTIONS, getAllMetrosForPhase, formatBandwidth, CURRENT_PHASE, LMCC_PHASES, getPhaseTag, PHASE_DATES, getMetrosGroupedByRegion, isValidAwsAccountId } from '../../data/lmccService';
import { LMCCConnection, LMCCMetro } from '../../types/lmcc';
import { SideDrawer } from '../common/SideDrawer';
import { LMCCRequirementsOnly } from '../connection/lmcc/LMCCRequirementsOnly';
import { LMCCOnboardingDrawer } from '../connection/lmcc/LMCCOnboardingDrawer';

export function AWSPartnerZone() {
  const navigate = useNavigate();
  const [lmccConnections] = useState<LMCCConnection[]>(MOCK_LMCC_CONNECTIONS);
  const [expandedLmcc, setExpandedLmcc] = useState<string | null>(null);
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [selectedMetro, setSelectedMetro] = useState<LMCCMetro | null>(null);
  const [awsAccountId, setAwsAccountId] = useState('');

  // Onboarding flow for AWS-initiated connections
  const [kickoffConnection, setKickoffConnection] = useState<LMCCConnection | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showManagementDrawer, setShowManagementDrawer] = useState(false);

  const handleStartSetup = (_key?: string) => {
    setShowOnboarding(true);
  };

  const handleActivate = () => {
    const metro = kickoffConnection?.metro.name;
    setShowOnboarding(false);
    setKickoffConnection(null);
    window.addToast?.({
      type: 'success',
      title: 'Cloud Connect Live',
      message: metro ? `Cloud Connect in ${metro} is live across 4 paths.` : 'Connection is now live.',
      duration: 5000,
    });
  };

  const activeConnections = lmccConnections.filter(c => c.status === 'live');
  const pendingConnections = lmccConnections.filter(c =>
    ['key-generated', 'key-accepted', 'negotiating', 'bgp-forming'].includes(c.status)
  );

  const handleViewWorkflow = () => {
    navigate('/aws-workflow');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-brand-blue flex items-center justify-center">
              <AttIcon name="cloud" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-figma-xl font-bold text-fw-heading tracking-[-0.03em]">AT&T NetBond<sup className="text-sm">®</sup> Advanced Max</h2>
              <p className="text-figma-base text-fw-bodyLight">4-path automated interconnect via AWS Interconnect – last mile</p>
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
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#00205B' }}>
        <div className="px-8 py-8 flex items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-white tracking-[-0.03em] mb-1">
              AT&T NetBond<sup className="text-sm">®</sup> Advanced Max
            </h3>
            <p className="text-figma-base mb-4" style={{ color: '#89A8D0' }}>
              Maximum Resiliency Â· AWS Interconnect – last mile Â· 4 Private Paths Â· Auto-negotiated L3
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {['4-Path Max Resiliency', 'Auto-negotiated L3', 'One Activation Key', 'GA: November 16, 2026'].map(chip => (
                <span key={chip} className="px-2.5 py-1 rounded-full text-figma-xs font-medium border" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.2)' }}>
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowManagementDrawer(true)}
            className="flex-shrink-0 px-5 h-9 rounded-full text-figma-sm font-medium transition-colors whitespace-nowrap"
            style={{ border: '1px solid rgba(255,255,255,0.4)', color: 'white' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            View Plans →
          </button>
        </div>
      </div>

      {/* Active AWS Max Connections */}
      {activeConnections.length > 0 && (
        <div>
          <h3 className="text-figma-lg font-semibold text-fw-heading tracking-[-0.03em] mb-4">
            Active Cloud Connect
            <span className="ml-2 px-2 py-1 bg-fw-cobalt-100 text-fw-link rounded-full text-figma-sm font-semibold">
              {activeConnections.length}
            </span>
          </h3>
          <div className="space-y-4">
            {activeConnections.map((conn) => (
              <div key={conn.id} className="border border-fw-secondary rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedLmcc(expandedLmcc === conn.id ? null : conn.id)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-fw-wash transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-blue flex items-center justify-center">
                      <AttIcon name="cloud" className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-figma-base font-semibold text-fw-heading">{conn.metro.name}</p>
                      <p className="text-figma-sm text-fw-bodyLight">{formatBandwidth(conn.bandwidth)} × 4 paths</p>
                      <p className="text-figma-xs text-fw-disabled">Account: {conn.awsAccountId}</p>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-fw-bodyLight transition-transform ${expandedLmcc === conn.id ? 'rotate-90' : ''}`} />
                </button>
                {expandedLmcc === conn.id && (
                  <div className="px-5 pb-5 border-t border-fw-secondary pt-4">
                    <LMCCStatusPanel connection={conn} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending AWS Max Connections */}
      {pendingConnections.length > 0 && (
        <div>
          <h3 className="text-figma-lg font-semibold text-fw-heading tracking-[-0.03em] mb-4">
            Pending Cloud Connect
            <span className="ml-2 px-2 py-1 bg-fw-accent text-fw-link rounded-full text-figma-sm font-semibold">
              {pendingConnections.length}
            </span>
          </h3>
          <div className="space-y-3">
            {pendingConnections.map((conn) => (
              <div
                key={conn.id}
                className="bg-fw-base border border-fw-secondary rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-blue flex items-center justify-center flex-shrink-0">
                      <AttIcon name="cloud" className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-fw-heading">{conn.metro.name}</p>
                      <p className="text-figma-sm text-fw-bodyLight">{formatBandwidth(conn.bandwidth)} × 4 paths</p>
                      <p className="text-figma-xs text-fw-disabled">Account: {conn.awsAccountId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-fw-accent border border-fw-active/20 rounded-md text-figma-sm font-semibold text-fw-link">
                      <div className="w-1.5 h-1.5 bg-fw-link rounded-full animate-pulse" />
                      {conn.status === 'key-generated' ? 'Key Generated — Awaiting AWS' :
                       conn.status === 'key-accepted' ? 'Key Accepted — Setting up your connection...' :
                       conn.status === 'negotiating' ? 'Negotiating Parameters' :
                       conn.status === 'bgp-forming' ? 'BGP Forming' : conn.status}
                    </div>
                    <p className="text-figma-xs text-fw-bodyLight mt-1">
                      AT&T and AWS are automatically configuring all 4 paths
                    </p>
                  </div>
                </div>
                {/* Amber action strip — only shown when user needs to act in AWS */}
                {conn.status === 'key-generated' && (
                  <div className="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-figma-xs font-semibold text-amber-800">Action needed in AWS Interconnect – last mile</p>
                      <p className="text-figma-xs text-amber-700">
                        Accept your connection to start provisioning.{' '}
                        <a
                          href="https://console.aws.amazon.com/directconnect/v2/home#/connections"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold underline underline-offset-2 hover:text-amber-900"
                        >
                          Open AWS Console →
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-3 mt-3">
                  {conn.paths.map((path, i) => (
                    <div key={path.id} className="p-2 rounded-lg bg-fw-wash border border-fw-secondary text-center">
                      <p className="text-figma-xs font-medium text-fw-heading">Site {i < 2 ? 'A' : 'B'} · Path {(i % 2) + 1}</p>
                      <p className="text-figma-xs text-fw-bodyLight">{path.awsConnectionId}</p>
                      <p className="text-figma-xs text-fw-bodyLight mt-0.5">Pending</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setKickoffConnection(conn);
                      if (conn.status !== 'key-generated') {
                        setShowOnboarding(true);
                      }
                    }}
                  >
                    {['key-accepted', 'negotiating', 'bgp-forming'].includes(conn.status) ? 'Track Status' : 'View Key'}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-fw-secondary bg-fw-base overflow-hidden">
          <div className="px-4 py-2.5 flex items-center gap-2 border-b border-fw-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-fw-link flex-shrink-0" />
            <span className="text-figma-xs font-medium text-fw-bodyLight uppercase tracking-wider">Current</span>
            <span className="text-figma-sm font-semibold text-fw-heading">· GA - {PHASE_DATES.ga}</span>
          </div>
          <div className="p-4 space-y-2 text-figma-xs text-fw-body">
            <div className="flex justify-between"><span className="text-fw-bodyLight">Metros</span><span className="font-medium">San Jose, CA · Ashburn, VA</span></div>
            <div className="flex justify-between"><span className="text-fw-bodyLight">Bandwidth</span><span className="font-medium">1 – 100 Gbps tiers</span></div>
            <div className="flex justify-between"><span className="text-fw-bodyLight">Contracts</span><span className="font-medium">Monthly · 12 / 24 / 36 mo</span></div>
            <div className="flex justify-between"><span className="text-fw-bodyLight">Transport</span><span className="font-medium">Internet, MPLS</span></div>
            <div className="flex justify-between"><span className="text-fw-bodyLight">Billing</span><span className="font-medium">Triggers at BGP Established</span></div>
            <div className="flex justify-between"><span className="text-fw-bodyLight">Operations</span><span className="font-medium">Full lifecycle (CRUD)</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-fw-secondary bg-fw-base overflow-hidden">
          <div className="px-4 py-2.5 flex items-center gap-2 border-b border-fw-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-fw-disabled flex-shrink-0" />
            <span className="text-figma-xs font-medium text-fw-bodyLight uppercase tracking-wider">Upcoming</span>
            <span className="text-figma-sm font-semibold text-fw-heading">· GA - {PHASE_DATES.ga}</span>
          </div>
          <div className="p-4 space-y-2 text-figma-xs text-fw-body">
            <div className="flex justify-between"><span className="text-fw-bodyLight">Metros</span><span className="font-medium">+ Ashburn, VA</span></div>
            <div className="flex justify-between"><span className="text-fw-bodyLight">Bandwidth</span><span className="font-medium">1 Gbps – 100 Gbps</span></div>
            <div className="flex justify-between"><span className="text-fw-bodyLight">Contracts</span><span className="font-medium">Digital self-service (Business Center)</span></div>
            <div className="flex justify-between"><span className="text-fw-bodyLight">Transport</span><span className="font-medium">Internet, MPLS, Ethernet</span></div>
            <div className="flex justify-between"><span className="text-fw-bodyLight">Billing</span><span className="font-medium">Automated — trigger: BGP Established</span></div>
            <div className="flex justify-between"><span className="text-fw-bodyLight">Operations</span><span className="font-medium">Full CRUD</span></div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-fw-wash border border-fw-secondary rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-figma-lg font-semibold text-fw-heading tracking-[-0.03em]">Getting Started — Flow 03 (AT&T-first)</h3>
          <p className="text-figma-xs text-fw-bodyLight mt-0.5">Start here in the AT&T NetBond portal, then take the ActivationKey to AWS.</p>
        </div>
        <ol className="space-y-3">
          {[
            { title: 'Three choices', desc: 'Select your metro, bandwidth, and enter your 12-digit AWS account ID. That\'s all the customer configures.' },
            { title: 'AT&T generates your ActivationKey', desc: 'AT&T creates a pending connection record and generates a base64-encoded ActivationKey, valid for 7 days.' },
            { title: 'Copy the key — take it to AWS', desc: 'Open AWS Interconnect Console. Paste the ActivationKey when prompted. AWS calls ConfirmActivationKey on AT&T to validate it.' },
            { title: 'AWS drives feature negotiation', desc: 'As the Active Provider, AWS calls CreateConnection → GenerateFeatureGuidance → CreateFeature x4. AT&T responds automatically.' },
            { title: 'All L3 parameters negotiated automatically', desc: 'BGP ASN, VLAN IDs, IP subnets, and MTU are agreed between AT&T and AWS — no manual BGP configuration by the customer.' },
            { title: 'BGP sessions form across all 4 paths', desc: 'Both providers provision hardware independently. BGP and BFD (3×100ms) sessions establish across all 4 diverse paths.' },
            { title: 'Connection live', desc: 'You receive an email and portal notification. Billing triggers when BGP reaches Established across all 4 paths.' },
          ].map((step, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-fw-primary text-white flex items-center justify-center text-figma-sm font-semibold">
                {idx + 1}
              </div>
              <div>
                <div className="font-medium text-fw-heading">{step.title}</div>
                <div className="text-figma-base text-fw-bodyLight">{step.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
      {/* Connection Management Drawer */}
      <SideDrawer
        isOpen={showManagementDrawer}
        onClose={() => setShowManagementDrawer(false)}
        title="AT&T Cloud Connect"
        size="md"
        footer={
          <button
            onClick={() => { setShowManagementDrawer(false); setShowInitiateModal(true); }}
            className="w-full flex items-center justify-center h-9 px-4 rounded-full text-figma-base font-medium bg-fw-primary text-white hover:bg-fw-ctaPrimaryHover transition-colors"
          >
            Add New Connection
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-figma-sm text-fw-bodyLight">AWS Interconnect – last mile Partner Network</p>
          {[...activeConnections, ...pendingConnections].length === 0 ? (
            <div className="text-center py-12">
              <p className="text-figma-base text-fw-bodyLight">No connections yet.</p>
              <p className="text-figma-sm text-fw-disabled mt-1">Add your first connection below.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...activeConnections, ...pendingConnections].map(conn => (
                <div key={conn.id} className="p-4 rounded-xl border border-fw-secondary bg-fw-base flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-brand-blue flex items-center justify-center flex-shrink-0">
                      <AttIcon name="cloud" className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-figma-sm font-semibold text-fw-heading">{conn.metro.name}</p>
                      <p className="text-figma-sm text-fw-bodyLight">{formatBandwidth(conn.bandwidth)} × 4 paths</p>
                      <p className="text-figma-xs text-fw-disabled">Account: {conn.awsAccountId}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {conn.status === 'live' ? (
                      <span className="px-2 py-1 rounded-md bg-fw-cobalt-100 text-fw-link text-figma-xs font-semibold">Active</span>
                    ) : (
                      <span className="px-2 py-1 rounded-md bg-fw-accent text-fw-link text-figma-xs font-semibold">
                        {conn.status === 'key-generated' ? 'Pending' :
                         conn.status === 'bgp-forming' ? 'BGP Forming' : 'Negotiating'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SideDrawer>

      {/* Initiate LMCC Modal */}
      <SideDrawer
        isOpen={showInitiateModal}
        onClose={() => { setShowInitiateModal(false); setSelectedMetro(null); setAwsAccountId(''); }}
        title="Initiate Cloud Connect"
        size="lg"
        footer={
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => { setShowInitiateModal(false); setSelectedMetro(null); setAwsAccountId(''); }}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!selectedMetro || !isValidAwsAccountId(awsAccountId)}
              onClick={() => {
                setShowInitiateModal(false);
                window.addToast?.({
                  type: 'success',
                  title: 'ActivationKey Generated',
                  message: `Your key for ${selectedMetro?.name} (account ${awsAccountId}) is ready. Copy it and paste it in AWS Interconnect Console within 7 days.`,
                  duration: 7000,
                });
                setSelectedMetro(null);
                setAwsAccountId('');
              }}
            >
              Generate ActivationKey
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Product header — matches Onboarding drawer style */}
          <div className="flex items-center gap-3 pb-3 border-b border-fw-secondary">
            <div className="w-10 h-7 rounded-lg bg-fw-base border border-fw-secondary flex items-center justify-center p-1">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
                alt="AWS"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-figma-base font-semibold text-fw-heading">AT&T NetBond<sup className="text-[10px]">®</sup> Advanced Max — Maximum Resiliency</p>
              <p className="text-figma-xs text-fw-bodyLight">AWS Interconnect – last mile Â· 4 paths Â· 2 diverse sites</p>
            </div>
          </div>

          {/* Step 1: Select Metro */}
          <div>
            <h4 className="text-figma-base font-semibold text-fw-heading mb-1">1. Select Your Metro</h4>
            <p className="text-figma-xs text-fw-bodyLight mb-3">
              Each metro has 2 diverse datacenter sites. AT&T provisions 4 connections (2 per site) automatically.
            </p>
            <div className="space-y-4">
              {getMetrosGroupedByRegion(getAllMetrosForPhase()).map(group => (
                <div key={group.regionId}>
                  {/* Region header */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <Globe className="h-3 w-3 text-fw-bodyLight" />
                    <span className="text-tag-xs font-medium text-fw-bodyLight uppercase tracking-wider">{group.regionId}</span>
                    <span className="text-figma-xs text-fw-bodyLight">· {group.regionLabel}</span>
                  </div>
                  <div className="space-y-2">
                    {group.metros.map(metro => {
                      const isDisabled = (metro.phase === 'ga' && CURRENT_PHASE === 'preview') || !metro.available;
                      const disabledReason = !metro.available ? metro.unavailableReason : `Available at GA (${PHASE_DATES.ga})`;
                      const phaseTag = getPhaseTag(metro.phase);
                      return (
                        <button
                          key={metro.id}
                          disabled={isDisabled}
                          onClick={() => !isDisabled && setSelectedMetro(metro)}
                          className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                            isDisabled
                              ? 'border-fw-secondary bg-fw-wash cursor-not-allowed opacity-60'
                              : selectedMetro?.id === metro.id
                                ? 'border-fw-active bg-fw-accent'
                                : 'border-fw-secondary bg-fw-base hover:border-fw-active/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Shield className={`h-4 w-4 ${isDisabled ? 'text-fw-disabled' : selectedMetro?.id === metro.id ? 'text-fw-link' : 'text-fw-bodyLight'}`} />
                              <span className={`text-figma-sm font-semibold ${isDisabled ? 'text-fw-disabled' : 'text-fw-heading'}`}>{metro.name}</span>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium ${phaseTag.className}`}>{phaseTag.label}</span>
                            </div>
                            {selectedMetro?.id === metro.id && !isDisabled && <CheckCircle2 className="h-4 w-4 text-fw-link" />}
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            {isDisabled && disabledReason ? (
                              <span className="text-figma-xs text-fw-disabled">{disabledReason}</span>
                            ) : (
                              <>
                                <div className="flex items-center gap-1.5 text-figma-xs text-fw-bodyLight">
                                  <Server className="h-3 w-3" />
                                  <span>2 diverse sites</span>
                                </div>
                                <span className="text-fw-disabled">·</span>
                                <span className="text-figma-xs text-fw-bodyLight">4 paths provisioned automatically</span>
                              </>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Bandwidth */}
          <div>
            <h4 className="text-figma-base font-semibold text-fw-heading mb-1">2. Bandwidth</h4>
            <p className="text-figma-xs text-fw-bodyLight mb-3">
              Tiers from the AT&T API: 1, 2, 5, 10, 25, 50, or 100 Gbps — the same rate on all 4 paths.
            </p>
            <div className="p-3 rounded-xl border-2 border-fw-active bg-fw-accent flex items-center justify-between">
              <span className="text-figma-sm font-semibold text-fw-heading">1 – 100 Gbps × 4 paths</span>
              <span className="text-figma-xs text-fw-bodyLight px-2 py-0.5 rounded bg-fw-cobalt-100 text-fw-link font-medium">Tiered · GA</span>
            </div>
          </div>

          {/* Step 3: AWS Account ID */}
          <div>
            <h4 className="text-figma-base font-semibold text-fw-heading mb-1">3. Enter Your AWS Account ID</h4>
            <p className="text-figma-xs text-fw-bodyLight mb-3">
              Your 12-digit AWS account ID — embedded in the ActivationKey AT&T generates for you.
            </p>
            <input
              type="text"
              value={awsAccountId}
              onChange={(e) => setAwsAccountId(e.target.value.replace(/\D/g, '').slice(0, 12))}
              placeholder="123456789012"
              maxLength={12}
              className={`w-full px-3 py-2.5 rounded-lg border text-figma-sm font-mono focus:outline-none ${
                awsAccountId && !isValidAwsAccountId(awsAccountId)
                  ? 'border-fw-error bg-fw-errorLight focus:border-fw-error'
                  : awsAccountId && isValidAwsAccountId(awsAccountId)
                    ? 'border-fw-active focus:border-fw-active'
                    : 'border-fw-secondary focus:border-fw-active'
              }`}
            />
            {awsAccountId && !isValidAwsAccountId(awsAccountId) && (
              <p className="text-figma-xs text-fw-error mt-1">AWS Account IDs are exactly 12 digits.</p>
            )}
          </div>

          {/* Step 4: What Happens Next */}
          <div>
            <h4 className="text-figma-base font-semibold text-fw-heading mb-3">4. What Happens Next</h4>
            <div className="space-y-2">
              {[
                { step: '1', text: 'AT&T creates a pending connection record and generates your ActivationKey (base64, valid 7 days)' },
                { step: '2', text: 'Copy the key — navigate to AWS Interconnect Console and paste it when prompted' },
                { step: '3', text: 'AWS validates the key via ConfirmActivationKey — one-time use, cannot be reused' },
                { step: '4', text: 'AWS drives feature negotiation as Active Provider: CreateConnection → GenerateFeatureGuidance → CreateFeature x4' },
                { step: '5', text: 'BGP ASN, VLAN IDs, IP subnets, and MTU are negotiated automatically — no manual BGP config needed' },
                { step: '6', text: 'BGP sessions form across all 4 paths — both providers provision hardware independently' },
                { step: '7', text: 'Email + portal notification when live. Billing triggers when BGP reaches Established across all 4 paths.' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-fw-primary text-white flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <p className="text-figma-xs text-fw-body">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </SideDrawer>

      {/* LMCC Kickoff Modal - appears when Configure is clicked on a pending connection (Flow 04: AWS-first) */}
      {kickoffConnection && !showOnboarding && (
        <LMCCRequirementsOnly
          isOpen={true}
          onClose={() => setKickoffConnection(null)}
          onStartSetup={(key) => handleStartSetup(key)}
          onBuildForMe={() => setKickoffConnection(null)}
        />
      )}

      {/* LMCC Onboarding Drawer - status tracker after key upload */}
      {kickoffConnection && showOnboarding && (
        <LMCCOnboardingDrawer
          connection={kickoffConnection}
          isOpen={true}
          onClose={() => { setShowOnboarding(false); setKickoffConnection(null); }}
          onActivate={handleActivate}
        />
      )}
    </div>
  );
}
