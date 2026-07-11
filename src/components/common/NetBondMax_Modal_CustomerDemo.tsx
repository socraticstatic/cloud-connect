import { useState, useEffect } from 'react';
import { X, ArrowRight, ChevronLeft, CheckCircle2, AlertCircle, Clipboard, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMetroById } from '../../data/lmccService';
import { useStore } from '../../store/useStore';

type Stage = 'choice' | 'paste' | 'confirm' | 'activating';
type ProvisionStatus = 'key-accepted' | 'negotiating' | 'bgp' | 'live';
type StageItemStatus = 'pending' | 'active' | 'done';

interface DecodedKey {
  sharedConnectionUuid?: string;
  connectionSizeMbps?: number;
  destinationAccountId?: string;
  destinationEnvironmentUri?: string;
  peerSubnet?: string;
  expiredAt?: string;
  version?: number;
}

type KeyErrorState = null | 'invalid' | 'expired';

function tryDecodeKey(key: string): DecodedKey | null {
  try {
    const parsed = JSON.parse(atob(key.trim()));
    if (typeof parsed === 'object' && parsed !== null) return parsed as DecodedKey;
    return null;
  } catch {
    return null;
  }
}

function isExpiredKey(decoded: DecodedKey): boolean {
  if (!decoded.expiredAt) return false;
  return new Date(decoded.expiredAt) < new Date();
}

// Valid key with subnet
const DEMO_KEY = 'eyJzaGFyZWRDb25uZWN0aW9uVXVpZCI6ImxlZ2FjeS1sb2NhbC10ZXN0LTAwMSIsImNvbm5lY3Rpb25TaXplTWJwcyI6MTAwMCwiZGVzdGluYXRpb25BY2NvdW50SWQiOiI5NDM3NjI4ODAzMTUiLCJkZXN0aW5hdGlvbkVudmlyb25tZW50VXJpIjoiYXR0L2Vudmlyb25tZW50cy9tZXRyby1zaiIsInBlZXJTdWJuZXQiOiIxNjkuMjU0LjEwMC4wLzMwIiwidmVyc2lvbiI6MX0=';
// Expired key for demo error state
const DEMO_EXPIRED_KEY = 'eyJzaGFyZWRDb25uZWN0aW9uVXVpZCI6ImxlZ2FjeS1sb2NhbC10ZXN0LTAwMSIsImNvbm5lY3Rpb25TaXplTWJwcyI6MTAwMCwiZGVzdGluYXRpb25BY2NvdW50SWQiOiI5NDM3NjI4ODAzMTUiLCJkZXN0aW5hdGlvbkVudmlyb25tZW50VXJpIjoiYXR0L2Vudmlyb25tZW50cy9tZXRyby1zaiIsInBlZXJTdWJuZXQiOiIxNjkuMjU0LjEwMC4wLzMwIiwidmVyc2lvbiI6MSwiZXhwaXJlZEF0IjoiMjAyNi0wNS0xNVQwMDowMDowMFoifQ==';

// ── Timeline stage item ────────────────────────────────────────────────────────
function StageItem({
  status,
  title,
  desc,
  isLast,
  isGreen = false,
}: {
  status: StageItemStatus;
  title: string;
  desc: string;
  isLast: boolean;
  isGreen?: boolean;
}) {
  const activeColor = isGreen ? 'bg-green-500' : 'bg-fw-primary';
  const lineColor   = isGreen ? 'bg-green-400' : 'bg-fw-primary';

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-700 ${
            status === 'done' || status === 'active' ? activeColor : 'bg-fw-secondary'
          }`}
        >
          {status === 'done' ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : status === 'active' ? (
            <span className="w-2.5 h-2.5 bg-white rounded-full stage-pulse" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-fw-body/25" />
          )}
        </div>
        {!isLast && (
          <div
            className={`w-px flex-1 min-h-[28px] mt-1 transition-all duration-700 ${
              status === 'done' ? lineColor : 'bg-fw-secondary'
            }`}
          />
        )}
      </div>
      <div className={isLast ? 'pb-0' : 'pb-7'}>
        <p
          className={`text-figma-sm font-semibold leading-snug transition-colors duration-500 ${
            status === 'pending' ? 'text-fw-body/50' : 'text-fw-heading'
          }`}
        >
          {title}
        </p>
        <p
          className={`text-figma-xs mt-0.5 leading-relaxed transition-colors duration-500 ${
            status === 'pending' ? 'text-fw-disabled' : 'text-fw-body'
          }`}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function NetBondMax_Modal_CustomerDemo() {
  const navigate = useNavigate();
  const addConnection = useStore(state => state.addConnection);
  // Demo Business Center Account ID
  const DEMO_BC_ACCOUNT_ID = 'BC-200145782';

  const e2eSkip = typeof window !== 'undefined' && localStorage.getItem('e2e-skip-demo-modal') === 'true';
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<'preview' | 'ga'>('preview');
  const [pillsDismissed, setPillsDismissed] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [stage, setStage] = useState<Stage>('choice');
  const [activationKey, setActivationKey] = useState('');
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [justValidated, setJustValidated] = useState(false);
  const [provisionStatus, setProvisionStatus] = useState<ProvisionStatus>('key-accepted');
  const [provisionComplete, setProvisionComplete] = useState(false);
  const [newConnectionId, setNewConnectionId] = useState<string | null>(null);
  const [connectionName, setConnectionName] = useState('Production AWS – San Jose');
  const [keyErrorState, setKeyErrorState] = useState<KeyErrorState>(null);

  useEffect(() => {
    setMounted(true);
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setPillsVisible(true), 420);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const dismiss = () => {
    // Block dismiss while provisioning is in flight
    if (stage === 'activating' && !provisionComplete) return;
    setVisible(false);
    setTimeout(() => setMounted(false), 280);
  };

  // ── AT&T-first flow ──────────────────────────────────────────────────────────
  const handleBuild = () => {
    if (phase === 'ga') {
      navigate('/create', {
        state: {
          initialStep: 6,
          selectedProviders: ['AWS'],
          resiliencyLevel: 'maximum',
          selectedConnectionType: 'Internet to Cloud',
          selectedLocations: { AWS: ['metro-ashburn'] },
          bandwidthSettings: { 'AWS-lmcc': 1000 },
          mode: 'step-by-step',
          isGa: true,
        },
      });
    } else {
      navigate('/create', {
        state: {
          initialStep: 6,
          selectedProviders: ['AWS'],
          resiliencyLevel: 'maximum',
          selectedConnectionType: 'Internet to Cloud',
          selectedLocations: { AWS: ['metro-sj'] },
          bandwidthSettings: { 'AWS-lmcc': 1000 },
          mode: 'step-by-step',
        },
      });
    }
    dismiss();
  };

  // ── Key validation ───────────────────────────────────────────────────────────
  const trimmed = activationKey.trim();
  const hasInput = trimmed.length > 0;
  const looksLikeKey = trimmed.startsWith('ey') && trimmed.length > 20;
  const decoded = looksLikeKey ? tryDecodeKey(trimmed) : null;
  const isFullyValid = looksLikeKey && !!decoded?.sharedConnectionUuid && !isExpiredKey(decoded ?? {});
  const hasDecodeError = looksLikeKey && !decoded?.sharedConnectionUuid;

  // ── Decoded key details for confirm + activating panels ──────────────────────
  const metroId = decoded?.destinationEnvironmentUri?.split('/').pop() || '';
  const metro = metroId ? getMetroById(metroId) : null;
  const metroName = metro?.name || 'San Jose, CA';
  const bwMbps = decoded?.connectionSizeMbps || 1000;
  const bwLabel = bwMbps >= 1000 ? `${bwMbps / 1000} Gbps` : `${bwMbps} Mbps`;
  const peerSubnet = decoded?.peerSubnet || '169.254.100.0/30';
  const maskedAccount = decoded?.destinationAccountId
    ? `••••${decoded.destinationAccountId.slice(-4)}`
    : '••••';

  // ── Input handlers ───────────────────────────────────────────────────────────
  const handleKeyChange = (val: string) => {
    setActivationKey(val.replace(/\s+/g, ''));
    setInlineError(null);
    setKeyErrorState(null);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleKeyChange(text);
    } catch {
      // clipboard access denied — no-op
    }
  };

  // Validation glow — fires once when key first becomes fully valid
  useEffect(() => {
    if (isFullyValid) {
      setJustValidated(true);
      const t = setTimeout(() => setJustValidated(false), 650);
      return () => clearTimeout(t);
    }
  }, [isFullyValid]);

  const handleActivate = () => {
    if (looksLikeKey && decoded && isExpiredKey(decoded)) {
      setKeyErrorState('expired');
      return;
    }
    if (!isFullyValid) {
      if (hasInput) {
        setKeyErrorState('invalid');
      } else {
        setInlineError("Check that you copied the complete key. Keys begin with 'ey'.");
      }
      return;
    }
    setStage('confirm');
  };

  // ── AWS-first confirm → immediate Provisioning ──────────────────────────────
  const handleConfirmActivate = async () => {
    const newId = `conn-${Date.now()}`;
    const finalName =
      connectionName.trim().length > 0
        ? connectionName.trim()
        : `NetBond Max — ${metroName.split(',')[0]} · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    try {
      await addConnection({
        id: newId,
        name: finalName,
        type: 'Internet to Cloud',
        status: 'Provisioning',
        bandwidth: `${bwLabel} × 4 paths`,
        location: metroName,
        provider: 'AWS',
        configuration: {
          awsAccountId: decoded?.destinationAccountId,
          lmccMetro: metroId,
          isLmcc: true,
          awsFirst: true,
        },
        billing: {
          baseFee: 999.99,
          usage: 0,
          total: 999.99,
          currency: 'USD',
        },
      } as any);
    } catch {
      // Store error — still navigate
    }

    // No toast on Max creation — the pulsing highlighted row is the cue
    dismiss();
    navigate('/manage', { state: { highlightedConnectionId: newId, activeTab: 'connections', viewMode: 'list' } });
  };

  const handleViewConnection = () => {
    navigate('/manage', { state: { highlightedConnectionId: newConnectionId, activeTab: 'connections', viewMode: 'list' } });
    dismiss();
  };

  // ── Slider transform — 3 panels (choice / paste / confirm) ──────────────────
  // Width: 300%, each panel 1/3. Activating leaves slider at confirm position
  // then collapses it via maxHeight.
  const sliderTransform =
    stage === 'choice'
      ? 'translateX(0)'
      : stage === 'paste'
      ? 'translateX(-33.333%)'
      : 'translateX(-66.667%)';

  // ── Provisioning status derivation — 4 stages per Bible ────────────────────
  const keyAcceptedStatus: StageItemStatus =
    provisionStatus === 'key-accepted' ? 'active' : 'done';

  const negotiatingStatus: StageItemStatus =
    provisionStatus === 'key-accepted'
      ? 'pending'
      : provisionStatus === 'negotiating'
      ? 'active'
      : 'done';

  const bgpStatus: StageItemStatus =
    provisionStatus === 'bgp'
      ? 'active'
      : provisionStatus === 'live'
      ? 'done'
      : 'pending';

  const liveStatus: StageItemStatus =
    provisionComplete ? 'done' : provisionStatus === 'live' ? 'active' : 'pending';

  if (!mounted || e2eSkip) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AT&T NetBond Advanced Max"
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 p-4 transition-opacity duration-280 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={provisionComplete ? dismiss : stage === 'activating' ? undefined : dismiss}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]" />

      {/* Phase switcher — floats above modal, fades in after modal settles */}
      {!pillsDismissed && (
        <div
          className={`relative flex items-center gap-2 transition-opacity duration-300 ${pillsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-0.5 bg-fw-primary rounded-full p-1">
            <button
              onClick={() => setPhase('preview')}
              className={`px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all duration-200 ${
                phase === 'preview'
                  ? 'bg-white text-fw-heading shadow-sm'
                  : 'text-white/65 hover:text-white/90'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setPhase('ga')}
              className={`px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all duration-200 ${
                phase === 'ga'
                  ? 'bg-white text-fw-heading shadow-sm'
                  : 'text-white/65 hover:text-white/90'
              }`}
            >
              GA (General Availability)
            </button>
          </div>
          <button
            onClick={() => setPillsDismissed(true)}
            aria-label="Dismiss phase selector"
            className="text-white/40 hover:text-white/70 transition-colors p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div
        className={`relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl bg-fw-base transition-[transform,opacity] duration-280 ${
          visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-[3px] bg-fw-primary" />

        {/* ── 3-panel slider — collapses when activating ── */}
        <div
          style={{
            overflow: 'hidden',
            maxHeight: stage === 'activating' ? '0' : '800px',
            transition: 'max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div
            className="flex transition-transform duration-500"
            style={{
              transform: sliderTransform,
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              width: '300%',
            }}
          >

            {/* ── Panel 1: Choice ── */}
            <div className="w-1/3 bg-fw-base">

              {/* Header */}
              <div className="px-6 pt-5 pb-4 sm:px-8 sm:pt-6 sm:pb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[22px] sm:text-[26px] font-bold text-fw-heading tracking-[-0.03em] leading-[1.1]">
                    AWS Interconnect – last mile
                  </h2>
                  <p className="text-figma-sm text-fw-body mt-2 leading-relaxed max-w-xl">
                    Four independent private connections from AT&T to AWS in one metro.
                  </p>
                </div>
                <button
                  onClick={dismiss}
                  aria-label="Dismiss"
                  className="shrink-0 p-2 rounded-full text-fw-body hover:text-fw-heading hover:bg-fw-neutral transition-colors -mt-1 -mr-2 ml-4"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Two-column choice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-fw-secondary border-t border-fw-secondary">

                {/* AWS path */}
                <div
                  className="p-5 sm:p-6 flex flex-col transition-all duration-300 hover:brightness-[0.96]"
                  style={{ background: 'rgba(35,47,62,0.04)' }}
                >
                  <div className="mb-4">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
                      alt="AWS"
                      className="h-7 w-auto"
                    />
                  </div>
                  <p className="text-figma-base font-bold text-fw-heading leading-snug mb-2 tracking-[-0.02em]">
                    Finish setup
                  </p>
                  <p className="text-figma-sm text-fw-body leading-relaxed flex-1">
                    Complete a connection you started in the AWS Direct Connect console.
                  </p>
                  <button
                    onClick={() => setStage('paste')}
                    className="group mt-5 flex items-center justify-center gap-2.5 w-full py-2.5 rounded-full text-white text-figma-sm font-semibold transition-all duration-300 hover:shadow-[0_4px_20px_rgba(35,47,62,0.45)] hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: '#232F3E' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1a2433')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#232F3E')}
                  >
                    Paste a key
                  </button>
                </div>

                {/* AT&T path */}
                <div className="p-5 sm:p-6 flex flex-col bg-fw-wash transition-all duration-300 hover:brightness-[0.96]">
                  <div className="mb-4">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/31/AT%26T_logo_2016.svg"
                      alt="AT&T"
                      className="h-9 w-auto"
                    />
                  </div>
                  <p className="text-figma-base font-bold text-fw-heading leading-snug mb-2 tracking-[-0.02em]">
                    Start setup
                  </p>
                  <p className="text-figma-sm text-fw-body leading-relaxed flex-1">
                    Start here, then finish setup in the AWS Direct Connect console.
                  </p>
                  <button
                    onClick={handleBuild}
                    className="group mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-fw-primary text-white text-figma-sm font-semibold transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,87,184,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Get a key
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

              {/* Not now */}
              <div className="py-3 border-t border-fw-secondary bg-fw-wash text-center">
                <button
                  onClick={dismiss}
                  className="text-figma-xs font-medium text-fw-body hover:text-fw-heading transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>

            {/* ── Panel 2: Paste key ── */}
            <div className="w-1/3 bg-fw-base flex flex-col" style={{ minHeight: '100%' }}>

              {/* Header */}
              <div className="px-8 pt-5 pb-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
                      alt="AWS"
                      className="h-6 w-auto"
                    />
                    <h2 className="text-[22px] font-bold text-fw-heading tracking-[-0.03em] leading-[1.1]">
                      Paste your Activation Key
                    </h2>
                  </div>
                  <p className="text-figma-sm text-fw-body mt-1 leading-relaxed">
                    Paste the Activation Key from the AWS Direct Connect console. Keys expire after 7 days.
                  </p>
                </div>
                <button
                  onClick={dismiss}
                  aria-label="Dismiss"
                  className="shrink-0 p-2 rounded-full text-fw-body hover:text-fw-heading hover:bg-fw-neutral transition-colors -mt-1 -mr-2 ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Input + actions */}
              <div className="px-8 pb-5 flex flex-col gap-3 border-t border-fw-secondary pt-4 flex-1">

                {/* Error panel — invalid or expired key */}
                {keyErrorState && (
                  <div className={`rounded-xl border-2 p-4 ${
                    keyErrorState === 'expired' ? 'border-amber-300 bg-amber-50' : 'border-fw-error/40 bg-fw-errorLight/30'
                  }`}>
                    <div className="flex items-start gap-3">
                      {keyErrorState === 'expired'
                        ? <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        : <XCircle className="h-5 w-5 text-fw-error shrink-0 mt-0.5" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className={`text-figma-sm font-bold mb-0.5 ${keyErrorState === 'expired' ? 'text-amber-800' : 'text-fw-error'}`}>
                          {keyErrorState === 'expired' ? 'Activation Key Expired' : 'Invalid Activation Key'}
                        </p>
                        <p className="text-figma-xs text-fw-body leading-relaxed">
                          {keyErrorState === 'expired'
                            ? 'This key expired on May 15, 2026. Keys are valid for 7 days. Generate a new key in the AWS Direct Connect console.'
                            : "This key could not be decoded. Make sure you copied the complete key — it begins with \"ey\" and is several hundred characters long."
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setKeyErrorState(null); setActivationKey(''); }}
                      className="mt-3 text-figma-xs font-semibold text-fw-link hover:text-fw-linkHover transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!keyErrorState && (<>
                <div className="relative flex-1 flex flex-col">
                  <textarea
                    value={activationKey}
                    onChange={e => handleKeyChange(e.target.value)}
                    placeholder="eyJzaGFyZWRDb25uZWN0aW9u..."
                    rows={2}
                    spellCheck={false}
                    className={`flex-1 w-full rounded-2xl border-2 font-mono text-figma-xs px-4 py-3 resize-none focus:outline-none transition-all duration-300 leading-relaxed ${
                      isFullyValid
                        ? 'border-fw-active bg-fw-cobalt-100/20 text-fw-heading'
                        : hasInput
                        ? 'border-fw-error bg-red-50 text-fw-heading'
                        : 'border-fw-secondary bg-fw-wash text-fw-heading focus:border-fw-active'
                    } ${justValidated ? 'valid-glow' : ''}`}
                  />
                  {!hasInput && (
                    <button
                      onClick={handlePasteFromClipboard}
                      className="absolute top-3 right-4 flex items-center gap-1.5 text-[11px] font-semibold text-fw-body hover:text-fw-link transition-colors"
                    >
                      <Clipboard className="w-3.5 h-3.5" /> Paste
                    </button>
                  )}
                  {isFullyValid && (
                    <div className="absolute bottom-3 right-4 flex items-center gap-1.5 text-[11px] font-semibold text-fw-link badge-pop">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                    </div>
                  )}
                </div>

                <div className="min-h-[16px]">
                  {inlineError || hasDecodeError ? (
                    <p className="flex items-center gap-1.5 text-figma-xs text-fw-error">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {inlineError || 'Key decoded but looks incomplete — try copying again.'}
                    </p>
                  ) : (
                    <p className="text-figma-xs text-fw-body">
                      AWS Console → Interconnect – last mile → Connections → select → copy key{'  '}
                      <button
                        onClick={() => handleKeyChange(DEMO_KEY)}
                        className="text-fw-link hover:text-fw-linkHover font-semibold transition-colors"
                      >
                        Use demo key →
                      </button>
                      {'  '}
                      <button
                        onClick={() => handleKeyChange(DEMO_EXPIRED_KEY)}
                        className="text-fw-bodyLight hover:text-fw-body transition-colors"
                      >
                        Demo: expired key
                      </button>
                    </p>
                  )}
                </div>
                </>)}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setStage('choice'); setActivationKey(''); setInlineError(null); }}
                    className="group flex items-center justify-center gap-1.5 py-2.5 rounded-full border-2 border-fw-active text-fw-link text-figma-sm font-semibold transition-all duration-300 hover:bg-fw-cobalt-100/40 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ChevronLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" /> Back
                  </button>
                  <button
                    onClick={handleActivate}
                    disabled={!isFullyValid}
                    className={`group flex items-center justify-center gap-2 py-2.5 rounded-full bg-fw-primary text-white text-figma-sm font-semibold transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,87,184,0.4)] hover:scale-[1.02] active:scale-[0.98] ${
                      !isFullyValid ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Panel 3: Confirm ── */}
            <div className="w-1/3 bg-fw-base flex flex-col">

              {/* Header */}
              <div className="px-8 pt-5 pb-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-[22px] font-bold text-fw-heading tracking-[-0.03em] leading-[1.1]">
                    Confirm your connection
                  </h2>
                  <p className="text-figma-sm text-fw-body mt-1 leading-relaxed">
                    Name your connection and review the details. We'll start setup as soon as you confirm.
                  </p>
                </div>
                <button
                  onClick={dismiss}
                  aria-label="Dismiss"
                  className="shrink-0 p-2 rounded-full text-fw-body hover:text-fw-heading hover:bg-fw-neutral transition-colors -mt-1 -mr-2 ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Connection name */}
              <div className="mx-8 mb-3">
                <label className="block text-figma-xs font-semibold text-fw-bodyLight uppercase tracking-[0.08em] mb-1">
                  Connection name
                </label>
                <input
                  type="text"
                  value={connectionName}
                  onChange={e => setConnectionName(e.target.value)}
                  placeholder="Production AWS – San Jose"
                  className="w-full h-9 px-3.5 rounded-xl border border-fw-secondary bg-fw-base text-figma-sm font-medium text-fw-heading placeholder:text-fw-disabled focus:border-fw-active focus:ring-2 focus:ring-fw-active focus:outline-none transition-all"
                />
              </div>

              {/* Summary card */}
              <div className="mx-8 rounded-xl border border-fw-secondary bg-fw-wash overflow-hidden">
                {[
                  { label: 'Location', value: metroName },
                  { label: 'Bandwidth', value: `${bwLabel} × 4 paths` },
                  { label: 'Subnet', value: peerSubnet },
                  { label: 'Business Center Account ID', value: DEMO_BC_ACCOUNT_ID },
                ].map(({ label, value }, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-4 py-2.5 ${
                      i > 0 ? 'border-t border-fw-secondary' : ''
                    }`}
                  >
                    <span className="text-figma-xs font-medium text-fw-body">{label}</span>
                    <span className="text-figma-sm font-semibold text-fw-heading">{value}</span>
                  </div>
                ))}
              </div>

              {/* Buttons — pinned to bottom of panel */}
              <div className="mt-auto px-8 pt-4 pb-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStage('paste')}
                  className="group flex items-center justify-center gap-1.5 py-2.5 rounded-full border-2 border-fw-active text-fw-link text-figma-sm font-semibold transition-all duration-300 hover:bg-fw-cobalt-100/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ChevronLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" /> Back
                </button>
                <button
                  onClick={handleConfirmActivate}
                  className="group flex items-center justify-center gap-2 py-2.5 rounded-full bg-fw-primary text-white text-figma-sm font-semibold transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,87,184,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  Confirm
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ── Activating panel — expands when stage === 'activating' ── */}
        <div
          className="bg-fw-base"
          style={{
            maxHeight: stage === 'activating' ? '680px' : '0',
            overflow: 'hidden',
            opacity: stage === 'activating' ? 1 : 0,
            transition:
              'max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease 0.15s',
          }}
        >
          {/* ── Provisioning timeline — fades out when complete ── */}
          <div
            style={{
              overflow: 'hidden',
              opacity: provisionComplete ? 0 : 1,
              maxHeight: provisionComplete ? '0' : '620px',
              transition: 'opacity 0.3s ease, max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: provisionComplete ? 'none' : 'auto',
            }}
          >
            {/* Provisioning header */}
            <div className="px-8 pt-7 pb-5">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/31/AT%26T_logo_2016.svg"
                  alt="AT&T"
                  className="h-10 w-auto"
                />
                <div className="w-px h-6 bg-fw-secondary" />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
                  alt="AWS"
                  className="h-7 w-auto"
                />
              </div>
              <h2 className="text-figma-2xl font-bold text-fw-heading tracking-[-0.04em] leading-tight">
                Activating your connection
              </h2>
              <p className="text-figma-sm text-fw-body mt-1.5 leading-relaxed">
                Four diverse paths are being configured automatically.
              </p>
            </div>

            <div className="border-t border-fw-secondary" />

            {/* Timeline — 4 stages per LMCC Bible */}
            <div className="px-8 py-7">
              <StageItem
                status={keyAcceptedStatus}
                title="Key Accepted"
                desc="AWS has received and validated the key. Negotiation is starting."
                isLast={false}
                isGreen={provisionComplete}
              />
              <StageItem
                status={negotiatingStatus}
                title="Negotiating Parameters"
                desc="AT&T and AWS are automatically agreeing the L3 configuration for all 4 channels. No action needed."
                isLast={false}
                isGreen={provisionComplete}
              />
              <StageItem
                status={bgpStatus}
                title="BGP Forming"
                desc="Technical parameters agreed. BGP sessions coming up on AT&T hardware."
                isLast={false}
                isGreen={provisionComplete}
              />
              <StageItem
                status={liveStatus}
                title="Live"
                desc="Both AT&T and AWS have confirmed. Traffic can flow."
                isLast={true}
                isGreen={provisionStatus === 'live' || provisionComplete}
              />
            </div>
          </div>

          {/* ── Success state — fades in after provisioning exits ── */}
          <div
            style={{
              overflow: 'hidden',
              opacity: provisionComplete ? 1 : 0,
              maxHeight: provisionComplete ? '560px' : '0',
              transition: `opacity 0.4s ease ${provisionComplete ? '0.22s' : '0s'}, max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${provisionComplete ? '0.1s' : '0s'}`,
              pointerEvents: provisionComplete ? 'auto' : 'none',
            }}
          >
            <div className="flex flex-col items-center text-center px-10 py-12">

              {/* Logos — equal-height hubs for optical balance */}
              <div className="flex items-center justify-center gap-7 mb-8">
                <div className="h-12 flex items-center">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/31/AT%26T_logo_2016.svg"
                    alt="AT&T"
                    className="h-full w-auto"
                  />
                </div>
                <div className="w-px h-10 bg-fw-secondary" />
                <div className="h-12 flex items-center">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
                    alt="AWS"
                    className="h-8 w-auto"
                  />
                </div>
              </div>

              {/* Live pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-50 border border-green-200 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-green-700">Connection Live</span>
              </div>

              {/* Headline */}
              <h3 className="text-[1.85rem] font-bold text-fw-heading tracking-[-0.04em] leading-tight mb-4">
                Your connection is live
              </h3>

              {/* Details chip row */}
              <div className="flex items-center justify-center gap-2.5 mb-3">
                <span className="text-figma-sm text-fw-body">{metroName}</span>
                <span className="text-fw-disabled">·</span>
                <span className="text-figma-sm font-semibold text-fw-heading">{bwLabel} × 4 paths</span>
              </div>

              <p className="text-figma-sm text-fw-body mb-9 max-w-[300px] leading-relaxed">
                Traffic can now flow between your network and AWS. AT&T will send a confirmation email shortly.
              </p>

              <button
                onClick={handleViewConnection}
                className="group flex items-center justify-center gap-2 px-10 py-3 rounded-full bg-fw-primary text-white text-figma-base font-semibold transition-all duration-300 hover:shadow-[0_4px_24px_rgba(0,87,184,0.45)] hover:scale-[1.02] active:scale-[0.98]"
              >
                View connection
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
