import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  X,
  AlertTriangle,
  Download,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  Cloud,
  Network,
  FileDown,
  FileText,
  Database,
  Star,
} from 'lucide-react';
import { Button } from '../common/Button';

type Step = 'intro' | 'connections' | 'export' | 'feedback' | 'thankyou';

const STEPS: Step[] = ['intro', 'connections', 'export', 'feedback', 'thankyou'];

const STEP_LABELS: Record<Step, string> = {
  intro: 'Introduction',
  connections: 'Active Connections',
  export: 'Data Export',
  feedback: 'Feedback',
  thankyou: 'Confirmation',
};

interface MockConnection {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
  bandwidth: string;
  location: string;
}

const MOCK_CONNECTIONS: MockConnection[] = [
  { id: '1', name: 'AWS Connectivity Environment', type: 'Internet to Cloud', status: 'active', bandwidth: '1 Gbps', location: 'US West' },
  { id: '2', name: 'AT&T Lab Cloud Testing', type: 'Internet to Cloud', status: 'active', bandwidth: '1 Gbps', location: 'US East' },
  { id: '3', name: 'Azure Production Link', type: 'MPLS to Cloud', status: 'inactive', bandwidth: '500 Mbps', location: 'EU West' },
];

const FEEDBACK_REASONS = [
  'Too expensive',
  'No longer need cloud connectivity',
  'Switching to another provider',
  'Missing features',
  'Performance issues',
  'Other',
];

export function OffboardingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [acknowledgedConnections, setAcknowledgedConnections] = useState(false);
  const [selectedExports, setSelectedExports] = useState<string[]>([]);
  const [feedbackReason, setFeedbackReason] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [rating, setRating] = useState(0);
  const [showReactivation, setShowReactivation] = useState(false);

  const currentIndex = STEPS.indexOf(currentStep);
  const progress = ((currentIndex) / (STEPS.length - 1)) * 100;

  const referenceNumber = 'OFF-2024-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  const goNext = () => {
    const next = STEPS[currentIndex + 1];
    if (next) setCurrentStep(next);
  };

  const goBack = () => {
    const prev = STEPS[currentIndex - 1];
    if (prev) setCurrentStep(prev);
  };

  const toggleExport = (id: string) => {
    setSelectedExports(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const activeConnections = MOCK_CONNECTIONS.filter(c => c.status === 'active');

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'connections': return acknowledgedConnections;
      case 'intro': return true;
      case 'export': return true;
      case 'feedback': return true;
      default: return false;
    }
  };

  if (showReactivation) {
    return (
      <div className="min-h-screen bg-fw-wash flex items-center justify-center p-4">
        <div className="bg-fw-base rounded-3xl border border-fw-secondary max-w-[612px] w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-fw-successLight flex items-center justify-center mx-auto mb-6">
            <RefreshCw className="w-8 h-8 text-fw-success" />
          </div>
          <h2 className="text-figma-xl font-bold text-fw-heading tracking-[-0.04em] mb-3">
            Welcome Back!
          </h2>
          <p className="text-figma-base text-fw-body tracking-[-0.03em] mb-8">
            Your account has been reactivated. All your connections and settings have been restored.
          </p>
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/manage')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fw-wash flex flex-col">
      {/* Header */}
      <div className="bg-fw-base border-b border-fw-secondary px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="text-base font-bold text-brand-accent tracking-[-0.03em]">AT&T</span>
            <span className="ml-2 text-base font-bold text-black tracking-[-0.03em]">
              NetBond<sup className="text-[10px]">&reg;</sup> Advanced
            </span>
          </div>
          <span className="text-fw-bodyLight text-figma-sm">/</span>
          <span className="text-figma-base font-medium text-fw-body tracking-[-0.03em]">Account Closure</span>
        </div>
        <button
          onClick={() => navigate('/manage')}
          className="p-2 rounded-full text-fw-bodyLight hover:text-fw-body hover:bg-fw-wash transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      {currentStep !== 'thankyou' && (
        <div className="bg-fw-base border-b border-fw-secondary px-6 py-4">
          <div className="max-w-[612px] mx-auto">
            <div className="flex items-center justify-between mb-2">
              {STEPS.filter(s => s !== 'thankyou').map((step, i) => (
                <span
                  key={step}
                  className={`text-figma-sm font-medium tracking-[-0.03em] ${
                    i <= currentIndex ? 'text-fw-link' : 'text-fw-bodyLight'
                  }`}
                >
                  {STEP_LABELS[step]}
                </span>
              ))}
            </div>
            <div className="h-2 bg-fw-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-fw-link rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="max-w-[612px] w-full">

          {/* INTRO */}
          {currentStep === 'intro' && (
            <div className="bg-fw-base rounded-3xl border border-fw-secondary overflow-hidden">
              <div className="bg-fw-wash h-64 flex items-center justify-center">
                <div className="text-center">
                  <AlertTriangle className="w-16 h-16 text-fw-bodyLight mx-auto mb-4" />
                  <p className="text-figma-sm text-fw-bodyLight tracking-[-0.03em]">Account Closure Process</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="h-2 bg-fw-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-fw-error rounded-full" style={{ width: '2%' }} />
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-fw-bodyLight">0 days remaining</span>
                </div>
                <h2 className="text-figma-xl font-bold text-fw-heading tracking-[-0.04em]">
                  Thank you for signing up
                </h2>
                <p className="text-figma-base text-fw-body tracking-[-0.03em] leading-relaxed">
                  for our complimentary 1 Gbps cloud connectivity trial to Azure, Google Cloud, or AWS.
                  Your feedback is highly valuable and will help us enhance the experience for you and other
                  customers. By providing your feedback, you will have the opportunity to extend your access
                  to the trial.
                </p>
                <p className="text-figma-base font-medium text-fw-heading tracking-[-0.03em]">
                  Would you please take a minute to answer three quick questions?
                </p>
                <Button variant="primary" fullWidth onClick={goNext}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 1: CONNECTIONS */}
          {currentStep === 'connections' && (
            <div className="bg-fw-base rounded-3xl border border-fw-secondary p-6 space-y-6">
              <div>
                <h2 className="text-figma-xl font-bold text-fw-heading tracking-[-0.04em] mb-2">
                  Active Connections
                </h2>
                <p className="text-figma-base text-fw-body tracking-[-0.03em]">
                  The following connections will be terminated when your account is closed.
                  Please review them carefully.
                </p>
              </div>

              <div className="space-y-3">
                {activeConnections.map(conn => (
                  <div key={conn.id} className="rounded-2xl border border-fw-secondary p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-fw-wash flex items-center justify-center">
                          <Cloud className="w-5 h-5 text-fw-bodyLight" />
                        </div>
                        <div>
                          <p className="text-figma-lg font-medium text-fw-heading tracking-[-0.03em]">
                            {conn.name}
                          </p>
                          <p className="text-figma-sm text-fw-bodyLight tracking-[-0.03em]">
                            {conn.type}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-figma-base font-medium text-fw-success">
                        <span className="w-2 h-2 rounded-full bg-fw-success" />
                        Active
                      </span>
                    </div>
                    <div className="flex gap-6">
                      <div className="bg-fw-wash rounded-lg px-3 py-2">
                        <p className="text-figma-sm text-fw-bodyLight tracking-[-0.03em]">Bandwidth</p>
                        <p className="text-figma-base font-medium text-fw-heading tracking-[-0.03em]">{conn.bandwidth}</p>
                      </div>
                      <div className="bg-fw-wash rounded-lg px-3 py-2">
                        <p className="text-figma-sm text-fw-bodyLight tracking-[-0.03em]">Location</p>
                        <p className="text-figma-base font-medium text-fw-heading tracking-[-0.03em]">{conn.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {MOCK_CONNECTIONS.filter(c => c.status === 'inactive').length > 0 && (
                <div className="rounded-2xl border border-fw-secondary p-4 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-fw-wash flex items-center justify-center">
                      <Network className="w-5 h-5 text-fw-bodyLight" />
                    </div>
                    <div>
                      <p className="text-figma-lg font-medium text-fw-heading tracking-[-0.03em]">
                        {MOCK_CONNECTIONS.filter(c => c.status === 'inactive')[0].name}
                      </p>
                      <span className="inline-flex items-center gap-1 text-figma-sm text-fw-bodyLight">
                        <span className="px-2 py-0.5 bg-fw-secondary rounded text-figma-sm">inactive</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <label className="flex items-start gap-3 p-4 rounded-2xl border border-fw-secondary bg-fw-wash cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgedConnections}
                  onChange={e => setAcknowledgedConnections(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-fw-secondary text-fw-link focus:ring-fw-link"
                />
                <div>
                  <p className="text-figma-base font-medium text-fw-heading tracking-[-0.03em]">
                    I understand that {activeConnections.length} active connection{activeConnections.length !== 1 ? 's' : ''} will be terminated
                  </p>
                  <p className="text-figma-sm text-fw-bodyLight tracking-[-0.03em] mt-1">
                    This action cannot be undone. All data associated with these connections will be permanently removed after 30 days.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* STEP 2: DATA EXPORT */}
          {currentStep === 'export' && (
            <div className="bg-fw-base rounded-3xl border border-fw-secondary p-6 space-y-6">
              <div>
                <h2 className="text-figma-xl font-bold text-fw-heading tracking-[-0.04em] mb-2">
                  Export Your Data
                </h2>
                <p className="text-figma-base text-fw-body tracking-[-0.03em]">
                  Download your data before your account is closed. Select the data you would like to export.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'config', icon: FileText, label: 'Connection Configurations', desc: 'All connection settings, routing rules, and policies', size: '~2.4 MB' },
                  { id: 'metrics', icon: Database, label: 'Performance Metrics', desc: 'Historical bandwidth, latency, and uptime data', size: '~18.7 MB' },
                  { id: 'logs', icon: FileDown, label: 'Audit Logs', desc: 'Account activity and change history', size: '~5.1 MB' },
                  { id: 'billing', icon: Download, label: 'Billing History', desc: 'Invoices, payment records, and usage reports', size: '~1.2 MB' },
                ].map(item => {
                  const Icon = item.icon;
                  const selected = selectedExports.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleExport(item.id)}
                      className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                        selected
                          ? 'border-fw-link bg-fw-active/5'
                          : 'border-fw-secondary hover:border-fw-bodyLight'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selected ? 'bg-fw-link/10' : 'bg-fw-wash'
                          }`}>
                            <Icon className={`w-5 h-5 ${selected ? 'text-fw-link' : 'text-fw-bodyLight'}`} />
                          </div>
                          <div>
                            <p className="text-figma-base font-medium text-fw-heading tracking-[-0.03em]">
                              {item.label}
                            </p>
                            <p className="text-figma-sm text-fw-bodyLight tracking-[-0.03em]">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-figma-sm text-fw-bodyLight">{item.size}</span>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                            selected ? 'bg-fw-link border-fw-link' : 'border-fw-secondary'
                          }`}>
                            {selected && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedExports.length > 0 && (
                <Button variant="secondary" fullWidth icon={Download}>
                  Download {selectedExports.length} Selected Export{selectedExports.length !== 1 ? 's' : ''}
                </Button>
              )}
            </div>
          )}

          {/* STEP 3: FEEDBACK */}
          {currentStep === 'feedback' && (
            <div className="bg-fw-base rounded-3xl border border-fw-secondary p-6 space-y-6">
              <div>
                <h2 className="text-figma-xl font-bold text-fw-heading tracking-[-0.04em] mb-2">
                  We Value Your Feedback
                </h2>
                <p className="text-figma-base text-fw-body tracking-[-0.03em]">
                  Help us improve by sharing why you are leaving. This is optional but greatly appreciated.
                </p>
              </div>

              <div>
                <p className="text-figma-base font-medium text-fw-heading tracking-[-0.03em] mb-3">
                  Why are you closing your account?
                </p>
                <div className="space-y-2">
                  {FEEDBACK_REASONS.map(reason => (
                    <label
                      key={reason}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        feedbackReason === reason
                          ? 'border-fw-link bg-fw-active/5'
                          : 'border-fw-secondary hover:border-fw-bodyLight'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reason}
                        checked={feedbackReason === reason}
                        onChange={e => setFeedbackReason(e.target.value)}
                        className="w-4 h-4 text-fw-link border-fw-secondary focus:ring-fw-link"
                      />
                      <span className="text-figma-base text-fw-heading tracking-[-0.03em]">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-figma-base font-medium text-fw-heading tracking-[-0.03em] mb-3">
                  How would you rate your overall experience?
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      className="p-1 transition-colors"
                    >
                      <Star
                        className={`w-8 h-8 ${n <= rating ? 'text-fw-warn fill-fw-warn' : 'text-fw-secondary'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-figma-base font-medium text-fw-heading tracking-[-0.03em] mb-3">
                  Additional comments (optional)
                </p>
                <textarea
                  value={feedbackComment}
                  onChange={e => setFeedbackComment(e.target.value)}
                  placeholder="Tell us more about your experience..."
                  rows={4}
                  className="w-full rounded-lg border border-fw-secondary bg-fw-base px-4 py-3 text-figma-base text-fw-body tracking-[-0.03em] placeholder:text-fw-bodyLight focus:outline-none focus:ring-2 focus:ring-fw-link focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}

          {/* THANK YOU */}
          {currentStep === 'thankyou' && (
            <div className="bg-fw-base rounded-3xl border border-fw-secondary p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-fw-successLight flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-fw-success" />
              </div>

              <div>
                <h2 className="text-figma-xl font-bold text-fw-heading tracking-[-0.04em] mb-2">
                  Account Closure Request Submitted
                </h2>
                <p className="text-figma-base text-fw-body tracking-[-0.03em]">
                  Your request has been received and will be processed within 5 business days.
                </p>
              </div>

              <div className="bg-fw-wash rounded-2xl p-4 inline-block mx-auto">
                <p className="text-figma-sm text-fw-bodyLight tracking-[-0.03em]">Reference Number</p>
                <p className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em] font-mono">
                  {referenceNumber}
                </p>
              </div>

              <div className="text-left bg-fw-wash rounded-2xl p-4 space-y-2">
                <p className="text-figma-base font-medium text-fw-heading tracking-[-0.03em]">What happens next:</p>
                <ul className="space-y-2 text-figma-base text-fw-body tracking-[-0.03em]">
                  <li className="flex items-start gap-2">
                    <span className="text-fw-bodyLight mt-1">1.</span>
                    Active connections will be gracefully terminated within 24 hours
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fw-bodyLight mt-1">2.</span>
                    Your data will be retained for 30 days, then permanently deleted
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fw-bodyLight mt-1">3.</span>
                    A confirmation email will be sent to your registered address
                  </li>
                </ul>
              </div>

              <div className="border-t border-fw-secondary pt-6 space-y-3">
                <p className="text-figma-base font-medium text-fw-heading tracking-[-0.03em]">
                  Changed your mind?
                </p>
                <p className="text-figma-sm text-fw-bodyLight tracking-[-0.03em]">
                  You can reactivate your account within 30 days and restore all your connections.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="primary" icon={RefreshCw} onClick={() => setShowReactivation(true)}>
                    Reactivate Account
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/manage')}>
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep !== 'thankyou' && (
            <div className="flex items-center justify-between mt-6">
              {currentIndex > 0 ? (
                <Button variant="outline" icon={ArrowLeft} onClick={goBack}>
                  Back
                </Button>
              ) : (
                <Button variant="outline" onClick={() => navigate('/manage')}>
                  Cancel
                </Button>
              )}

              <Button
                variant="primary"
                onClick={goNext}
                disabled={!canProceed()}
                className="flex-row-reverse"
              >
                <ArrowRight className="w-5 h-5 ml-2" />
                {currentStep === 'feedback' ? 'Submit & Close Account' : 'Continue'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}