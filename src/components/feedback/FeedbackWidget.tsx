import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Bug, Lightbulb, MessageSquare, Star, CheckCircle, UserCheck, TrendingUp, ChevronRight, ExternalLink, Compass, Users } from 'lucide-react';
import { Button } from '../common/Button';
import { useStore } from '../../store/useStore';

type FeedbackType = 'bug' | 'feature' | 'general' | 'nps' | 'usertesting';
type Step = 'select' | 'form' | 'confirm';

interface BugFormData {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | '';
  screenshot: boolean;
}

interface FeatureFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | '';
  useCase: string;
}

interface GeneralFormData {
  title: string;
  description: string;
  rating: number;
}

interface NpsFormData {
  score: number | null;
  reason: string;
  improvement: string;
}

interface UserTestingFormData {
  ready: boolean;
}

const defaultBugData: BugFormData = { title: '', description: '', severity: '', screenshot: false };
const defaultFeatureData: FeatureFormData = { title: '', description: '', priority: '', useCase: '' };
const defaultGeneralData: GeneralFormData = { title: '', description: '', rating: 0 };
const defaultNpsData: NpsFormData = { score: null, reason: '', improvement: '' };
const defaultUserTestingData: UserTestingFormData = { ready: false };

const feedbackTypes = [
  {
    id: 'bug' as FeedbackType,
    label: 'Report a Bug',
    description: "Something isn't working as expected",
    icon: Bug,
  },
  {
    id: 'feature' as FeedbackType,
    label: 'Suggest a Feature',
    description: 'Share an idea to improve the platform',
    icon: Lightbulb,
  },
  {
    id: 'general' as FeedbackType,
    label: 'General Feedback',
    description: 'Share your thoughts or experience',
    icon: MessageSquare,
  },
  {
    id: 'nps' as FeedbackType,
    label: 'Recommend Score',
    description: 'How likely are you to recommend this platform?',
    icon: TrendingUp,
  },
  {
    id: 'usertesting' as FeedbackType,
    label: 'Usability Test',
    description: 'Complete a guided task scenario (5-10 min)',
    icon: UserCheck,
  },
];

const NPS_LABELS: Record<number, string> = {
  0: 'Not at all', 1: '', 2: '', 3: '', 4: '', 5: 'Neutral',
  6: '', 7: '', 8: '', 9: '', 10: 'Extremely likely',
};

function getNpsCategory(score: number): { label: string; color: string } {
  if (score <= 6) return { label: 'Detractor', color: 'text-fw-error' };
  if (score <= 8) return { label: 'Passive', color: 'text-fw-body' };
  return { label: 'Promoter', color: 'text-fw-success' };
}

const FEEDBACK_EMAIL = 'mb351v@att.com';
const MAZE_STUDY_URL = 'https://t.maze.co/515163142';

function logFeedback(type: FeedbackType, data: Record<string, unknown>) {
  const entry = {
    id: Math.random().toString(36).slice(2, 10).toUpperCase(),
    type,
    data,
    timestamp: new Date().toISOString(),
    page: window.location.href,
  };

  // 1. Console
  console.info('[NetBond Feedback]', entry);

  // 2. localStorage (keep last 100 entries)
  try {
    const existing: unknown[] = JSON.parse(localStorage.getItem('nb_feedback_log') || '[]');
    localStorage.setItem('nb_feedback_log', JSON.stringify([entry, ...existing].slice(0, 100)));
  } catch { /* storage full or unavailable */ }

  // 3. Email dispatch via mailto (prototype mode)
  //    In production: replace with fetch() to your email API / SendGrid / etc.
  try {
    const subject = encodeURIComponent(`[NetBond Advanced] ${type.charAt(0).toUpperCase() + type.slice(1)} Feedback — ${entry.id}`);
    const bodyLines = [
      `Feedback ID: ${entry.id}`,
      `Type: ${type}`,
      `Timestamp: ${entry.timestamp}`,
      `Page: ${entry.page}`,
      '',
      ...Object.entries(data).map(([k, v]) => `${String(k)}: ${String(v)}`),
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));
    const a = document.createElement('a');
    a.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch { /* mailto unavailable */ }

  return entry;
}

export function FeedbackWidget({ onStartTour }: { onStartTour?: () => void }) {
  const setDemoBarVisible = useStore(s => s.setDemoBarVisible);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('select');
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [bugData, setBugData] = useState<BugFormData>(defaultBugData);
  const [featureData, setFeatureData] = useState<FeatureFormData>(defaultFeatureData);
  const [generalData, setGeneralData] = useState<GeneralFormData>(defaultGeneralData);
  const [npsData, setNpsData] = useState<NpsFormData>(defaultNpsData);
  const [submittedId, setSubmittedId] = useState<string>('');

  const reset = () => {
    setStep('select');
    setFeedbackType(null);
    setBugData(defaultBugData);
    setFeatureData(defaultFeatureData);
    setGeneralData(defaultGeneralData);
    setNpsData(defaultNpsData);
    setSubmittedId('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(reset, 300);
  };

  const handleTypeSelect = (type: FeedbackType) => {
    setFeedbackType(type);
    setStep('form');
  };

  const handleSubmit = () => {
    if (!feedbackType) return;

    let data: Record<string, unknown> = {};
    if (feedbackType === 'bug') data = { ...bugData };
    else if (feedbackType === 'feature') data = { ...featureData };
    else if (feedbackType === 'general') data = { ...generalData };
    else if (feedbackType === 'nps') data = { ...npsData };
    else if (feedbackType === 'usertesting') data = { action: 'maze_launched', url: MAZE_STUDY_URL };

    const entry = logFeedback(feedbackType, data);
    setSubmittedId(entry.id);
    setStep('confirm');
  };

  const handleLaunchMaze = () => {
    window.open(MAZE_STUDY_URL, '_blank', 'noopener,noreferrer');
    handleSubmit();
  };

  const canSubmit = (): boolean => {
    if (!feedbackType) return false;
    if (feedbackType === 'bug') return bugData.title.trim().length > 0 && bugData.description.trim().length > 0;
    if (feedbackType === 'feature') return featureData.title.trim().length > 0 && featureData.description.trim().length > 0;
    if (feedbackType === 'general') return generalData.title.trim().length > 0 && generalData.description.trim().length > 0;
    if (feedbackType === 'nps') return npsData.score !== null;
    return false;
  };

  const panelVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring' as const, damping: 28, stiffness: 280 } },
    exit: { x: '100%', opacity: 0, transition: { duration: 0.2 } },
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, x: -16, transition: { duration: 0.15 } },
  };

  const stepTitle = () => {
    if (step === 'confirm') return 'Thank You';
    if (step === 'select') return 'Share Feedback';
    const found = feedbackTypes.find(t => t.id === feedbackType);
    return found?.label ?? 'Feedback';
  };

  return (
    <>
      {/* Trigger — half-disc embedded in right edge */}
      {!isOpen && (
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
          className="fixed z-[60] flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all"
          style={{
            top: '50%',
            right: '-36px',
            transform: 'translateY(-50%)',
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 87, 184, 0.6)',
            transition: 'background-color 0.3s ease, right 0.3s ease, box-shadow 0.3s ease',
          }}
          onMouseEnter={(e) => { const t = e.currentTarget as HTMLButtonElement; t.style.backgroundColor = 'rgba(0, 56, 143, 0.85)'; t.style.right = '-32px'; }}
          onMouseLeave={(e) => { const t = e.currentTarget as HTMLButtonElement; t.style.backgroundColor = 'rgba(0, 87, 184, 0.6)'; t.style.right = '-36px'; }}
          aria-label="Open feedback panel"
        >
          <MessageSquare className="h-4 w-4" style={{ marginRight: '24px' }} />
        </button>
      )}

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/20"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Side drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 h-full w-full sm:w-[380px] bg-fw-base border-l border-fw-secondary shadow-xl z-[61] rounded-l-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-fw-secondary shrink-0">
              <div>
                <h2 className="text-[16px] font-semibold text-fw-heading tracking-[-0.03em]">
                  {stepTitle()}
                </h2>
                {step === 'form' && (
                  <button
                    onClick={() => setStep('select')}
                    className="tab-button text-[12px] text-fw-link hover:underline mt-0.5"
                  >
                    Back to options
                  </button>
                )}
              </div>
              <button
                onClick={handleClose}
                className="tab-button p-1 rounded-md text-fw-bodyLight hover:text-fw-heading hover:bg-fw-wash transition-colors"
                aria-label="Close feedback panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">

                {/* — Select Step — */}
                {step === 'select' && (
                  <motion.div
                    key="select"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-5 space-y-2"
                  >
    {/* Demo utilities — tour + role switcher live here so nothing auto-pops over the app */}
                    <div className="flex items-center gap-2 mb-4">
                      <button
                        onClick={() => { onStartTour?.(); setIsOpen(false); }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-fw-secondary text-[12px] font-medium text-fw-body hover:border-fw-link/40 hover:bg-fw-wash transition-colors"
                      >
                        <Compass className="h-3.5 w-3.5" /> Product tour
                      </button>
                      <button
                        onClick={() => { setDemoBarVisible(true); setIsOpen(false); }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-fw-secondary text-[12px] font-medium text-fw-body hover:border-fw-link/40 hover:bg-fw-wash transition-colors"
                      >
                        <Users className="h-3.5 w-3.5" /> Role switcher
                      </button>
                    </div>
                    <p className="text-[13px] text-fw-bodyLight mb-4">
                      How would you like to help improve NetBond Advanced?
                    </p>
                    {feedbackTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => handleTypeSelect(type.id)}
                          className="tab-button w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl border border-fw-secondary bg-fw-base hover:bg-fw-wash hover:border-fw-link/40 transition-all group"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-fw-bodyLight group-hover:text-fw-link transition-colors" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-fw-heading">
                              {type.label}
                            </div>
                            <div className="text-[11px] text-fw-bodyLight mt-0.5 truncate">
                              {type.description}
                            </div>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-fw-secondary group-hover:text-fw-bodyLight transition-colors shrink-0" />
                        </button>
                      );
                    })}
                  </motion.div>
                )}

                {/* — Bug Form — */}
                {step === 'form' && feedbackType === 'bug' && (
                  <motion.div
                    key="bug-form"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-5 space-y-4"
                  >
                    <div>
                      <label className="fw-label fw-label-required">Title</label>
                      <input
                        className="fw-input"
                        placeholder="Brief summary of the bug"
                        value={bugData.title}
                        onChange={(e) => setBugData({ ...bugData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="fw-label fw-label-required">Description</label>
                      <textarea
                        className="fw-textarea"
                        rows={4}
                        placeholder="Steps to reproduce, what you expected, what happened..."
                        value={bugData.description}
                        onChange={(e) => setBugData({ ...bugData, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="fw-label">Severity</label>
                      <select
                        className="fw-select"
                        value={bugData.severity}
                        onChange={(e) => setBugData({ ...bugData, severity: e.target.value as BugFormData['severity'] })}
                      >
                        <option value="">Select severity</option>
                        <option value="low">Low — Minor inconvenience</option>
                        <option value="medium">Medium — Affects workflow</option>
                        <option value="high">High — Blocks key functionality</option>
                        <option value="critical">Critical — System unusable</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bugData.screenshot}
                        onChange={(e) => setBugData({ ...bugData, screenshot: e.target.checked })}
                        className="h-4 w-4 rounded border-fw-secondary text-fw-link focus:ring-fw-link"
                      />
                      <span className="text-[13px] text-fw-body">
                        Include screenshot on submit
                      </span>
                    </label>
                  </motion.div>
                )}

                {/* — Feature Form — */}
                {step === 'form' && feedbackType === 'feature' && (
                  <motion.div
                    key="feature-form"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-5 space-y-4"
                  >
                    <div>
                      <label className="fw-label fw-label-required">Title</label>
                      <input
                        className="fw-input"
                        placeholder="Short name for the feature"
                        value={featureData.title}
                        onChange={(e) => setFeatureData({ ...featureData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="fw-label fw-label-required">Description</label>
                      <textarea
                        className="fw-textarea"
                        rows={4}
                        placeholder="Describe the feature and how it should work..."
                        value={featureData.description}
                        onChange={(e) => setFeatureData({ ...featureData, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="fw-label">Priority</label>
                      <select
                        className="fw-select"
                        value={featureData.priority}
                        onChange={(e) => setFeatureData({ ...featureData, priority: e.target.value as FeatureFormData['priority'] })}
                      >
                        <option value="">Select priority</option>
                        <option value="low">Low — Nice to have</option>
                        <option value="medium">Medium — Would improve workflow</option>
                        <option value="high">High — Critical for my use case</option>
                      </select>
                    </div>
                    <div>
                      <label className="fw-label">Use Case</label>
                      <textarea
                        className="fw-textarea"
                        rows={3}
                        placeholder="How would this help you day-to-day?"
                        value={featureData.useCase}
                        onChange={(e) => setFeatureData({ ...featureData, useCase: e.target.value })}
                      />
                    </div>
                  </motion.div>
                )}

                {/* — General Form — */}
                {step === 'form' && feedbackType === 'general' && (
                  <motion.div
                    key="general-form"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-5 space-y-4"
                  >
                    <div>
                      <label className="fw-label fw-label-required">Subject</label>
                      <input
                        className="fw-input"
                        placeholder="What is your feedback about?"
                        value={generalData.title}
                        onChange={(e) => setGeneralData({ ...generalData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="fw-label fw-label-required">Details</label>
                      <textarea
                        className="fw-textarea"
                        rows={5}
                        placeholder="Share your thoughts..."
                        value={generalData.description}
                        onChange={(e) => setGeneralData({ ...generalData, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="fw-label">Overall Rating</label>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setGeneralData({ ...generalData, rating: star })}
                            className="tab-button p-0.5 transition-transform hover:scale-110"
                            aria-label={`Rate ${star} out of 5`}
                          >
                            <Star
                              className={`h-6 w-6 transition-colors ${
                                star <= generalData.rating
                                  ? 'text-fw-link fill-fw-link'
                                  : 'text-fw-disabled'
                              }`}
                            />
                          </button>
                        ))}
                        {generalData.rating > 0 && (
                          <span className="text-[12px] text-fw-bodyLight ml-2">{generalData.rating} / 5</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* — NPS Form — */}
                {step === 'form' && feedbackType === 'nps' && (
                  <motion.div
                    key="nps-form"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-5 space-y-5"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-fw-heading mb-1">
                        How likely are you to recommend NetBond Advanced to a colleague?
                      </p>
                      <p className="text-[11px] text-fw-bodyLight mb-4">0 = Not at all likely, 10 = Extremely likely</p>
                      <div className="grid grid-cols-11 gap-1">
                        {[0,1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setNpsData({ ...npsData, score: n })}
                            className={`tab-button h-8 w-full text-[12px] font-medium rounded-lg border transition-all ${
                              npsData.score === n
                                ? 'bg-fw-link border-fw-link text-white'
                                : 'bg-fw-base border-fw-secondary text-fw-body hover:border-fw-link hover:text-fw-link'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] text-fw-bodyLight">Not likely</span>
                        <span className="text-[10px] text-fw-bodyLight">Extremely likely</span>
                      </div>
                      {npsData.score !== null && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 flex items-center gap-2"
                        >
                          <span className="text-[11px] text-fw-bodyLight">You selected</span>
                          <span className="text-[13px] font-semibold text-fw-heading">{npsData.score}</span>
                          <span className={`text-[11px] font-medium ${getNpsCategory(npsData.score).color}`}>
                            ({getNpsCategory(npsData.score).label})
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {npsData.score !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="fw-label">
                            {npsData.score <= 6
                              ? 'What would need to change to improve your score?'
                              : npsData.score <= 8
                              ? 'What would make you more likely to recommend it?'
                              : 'What do you value most about the platform?'}
                          </label>
                          <textarea
                            className="fw-textarea"
                            rows={3}
                            placeholder="Your answer..."
                            value={npsData.reason}
                            onChange={(e) => setNpsData({ ...npsData, reason: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="fw-label">What's the one thing we should improve first?</label>
                          <textarea
                            className="fw-textarea"
                            rows={2}
                            placeholder="Optional..."
                            value={npsData.improvement}
                            onChange={(e) => setNpsData({ ...npsData, improvement: e.target.value })}
                          />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* — Usability Test — */}
                {step === 'form' && feedbackType === 'usertesting' && (
                  <motion.div
                    key="usertesting-form"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-5 space-y-5"
                  >
                    <div className="rounded-xl border border-fw-secondary bg-fw-wash p-4 space-y-3">
                      <h3 className="text-[13px] font-semibold text-fw-heading">What to expect</h3>
                      <ul className="space-y-2">
                        {[
                          { label: 'Duration', detail: '5 to 10 minutes' },
                          { label: 'Method', detail: 'Task-based scenarios via Maze' },
                          { label: 'Anonymity', detail: 'Responses are anonymous by default' },
                          { label: 'Scope', detail: 'Covers core connection management flows' },
                        ].map(({ label, detail }) => (
                          <li key={label} className="flex items-start gap-2 text-[12px]">
                            <span className="text-fw-bodyLight w-20 shrink-0">{label}</span>
                            <span className="text-fw-heading font-medium">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-[13px] font-semibold text-fw-heading mb-2">Task scenarios included</h3>
                      <div className="space-y-2">
                        {[
                          'Create a new cloud connection to AWS',
                          'Locate and review connection logs',
                          'Modify bandwidth on an existing connection',
                          'Add a connection to a pool',
                        ].map((task, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-[12px] text-fw-body">
                            <span className="h-5 w-5 rounded-full bg-fw-wash border border-fw-secondary text-[10px] font-semibold text-fw-bodyLight flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            {task}
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-fw-bodyLight">
                      The test will open in a new tab. Your session data helps us measure task completion rates and identify friction points.
                    </p>

                    <Button
                      variant="primary"
                      onClick={handleLaunchMaze}
                      fullWidth
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Start Usability Test
                    </Button>
                  </motion.div>
                )}

                {/* — Confirm Step — */}
                {step === 'confirm' && (
                  <motion.div
                    key="confirm"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-5 flex flex-col items-center justify-center min-h-[320px] text-center"
                  >
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 16, stiffness: 200, delay: 0.1 }}
                    >
                      <CheckCircle className="h-14 w-14 text-fw-success mb-4" />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <h3 className="text-[18px] font-semibold text-fw-heading tracking-[-0.03em]">
                        Feedback received
                      </h3>
                      <p className="text-[13px] text-fw-body max-w-[260px]">
                        Your feedback has been logged and sent to the product team.
                      </p>
                      {submittedId && (
                        <p className="text-[11px] font-mono text-fw-bodyLight mt-3">
                          ID: {submittedId}
                        </p>
                      )}
                      <p className="text-[11px] text-fw-bodyLight mt-1">
                        Sent to {FEEDBACK_EMAIL}
                      </p>
                    </motion.div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer */}
            {step === 'form' && feedbackType !== 'usertesting' && (
              <div className="px-5 py-4 border-t border-fw-secondary shrink-0 flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={!canSubmit()}
                >
                  Submit Feedback
                </Button>
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            )}

            {step === 'confirm' && (
              <div className="px-5 py-4 border-t border-fw-secondary shrink-0">
                <Button variant="primary" onClick={handleClose} fullWidth>
                  Done
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
