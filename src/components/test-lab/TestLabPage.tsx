import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Download, ArrowRight, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getAllPacks } from '../../data/testLab/packs';
import { downloadSessionJson, queueLength, webhookConfigured, flushQueue } from '../../services/testLabSubmit';
import { useAuth } from '../../contexts/AuthContext';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-fw-wash">
      <div className="h-12 bg-fw-base border-b border-fw-secondary flex items-center px-6 gap-3">
        <span className="text-base font-bold tracking-[-0.03em] text-brand-accent">AT&T</span>
        <span className="text-base font-bold text-fw-heading tracking-[-0.03em]">
          NetBond<sup className="text-[10px]">®</sup> Advanced
        </span>
        <span className="h-4 border-l border-fw-secondary" />
        <span className="text-figma-xs text-fw-bodyLight">Test Lab</span>
      </div>
      <div className="max-w-xl mx-auto px-6 pt-16 pb-12">{children}</div>
    </div>
  );
}

function Scale7({ label, value, onChange }: { label: string; value: number | null; onChange: (n: number) => void }) {
  return (
    <div>
      <p className="text-figma-sm text-fw-body mb-2">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-figma-xs text-fw-bodyLight">Strongly disagree</span>
        {[1, 2, 3, 4, 5, 6, 7].map(n => (
          <button key={n} onClick={() => onChange(n)}
            className={`w-9 h-9 rounded-lg border text-figma-sm font-medium transition-colors ${
              value === n ? 'bg-fw-primary text-white border-fw-primary' : 'bg-fw-base text-fw-body border-fw-secondary hover:border-fw-active'
            }`}>{n}</button>
        ))}
        <span className="text-figma-xs text-fw-bodyLight">Strongly agree</span>
      </div>
    </div>
  );
}

export default function TestLabPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const session = useStore(s => s.testLabSession);
  const testLabStart = useStore(s => s.testLabStart);
  const testLabBegin = useStore(s => s.testLabBegin);
  const testLabWrapUp = useStore(s => s.testLabWrapUp);
  const testLabExit = useStore(s => s.testLabExit);
  const testLabDryRun = useStore(s => s.testLabDryRun);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [umux1, setUmux1] = useState<number | null>(null);
  const [umux2, setUmux2] = useState<number | null>(null);
  const [likedMost, setLikedMost] = useState('');
  const [likedLeast, setLikedLeast] = useState('');
  // Bumped after a retry flush so the submitted screen re-reads queueLength().
  const [, setFlushTick] = useState(0);

  // ── No session: invite-code entry ──
  if (!session) {
    const noStudies = getAllPacks().length === 0;
    return (
      <Shell>
        <div className="flex items-center gap-3 mb-2">
          <FlaskConical className="w-6 h-6 text-fw-link" />
          <h1 className="text-figma-2xl font-bold text-fw-heading tracking-[-0.03em]">Feature testing session</h1>
        </div>
        <p className="text-figma-base text-fw-body mb-8">
          You've been invited to try out new Cloud Connect features. Enter your invite code to begin —
          the whole session takes about 15 minutes.
        </p>
        {noStudies ? (
          <p className="text-figma-sm text-fw-bodyLight">No active studies right now.</p>
        ) : (
          <form onSubmit={e => {
            e.preventDefault();
            const err = testLabStart(code, name);
            setError(err);
          }} className="space-y-4">
            <div>
              <label htmlFor="testlab-code" className="block text-figma-sm font-medium text-fw-heading mb-1.5">Invite code</label>
              <input id="testlab-code" value={code} onChange={e => setCode(e.target.value)} autoFocus
                className="w-full px-3 py-2.5 rounded-lg border border-fw-secondary bg-fw-base text-figma-base text-fw-heading uppercase tracking-wide focus:outline-none focus:border-fw-active"
                placeholder="e.g. LMCC-R1" />
            </div>
            <div>
              <label htmlFor="testlab-name" className="block text-figma-sm font-medium text-fw-heading mb-1.5">Your name <span className="text-fw-bodyLight font-normal">(optional)</span></label>
              <input id="testlab-name" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-fw-secondary bg-fw-base text-figma-base text-fw-heading focus:outline-none focus:border-fw-active" />
            </div>
            {error && (
              <p className="flex items-center gap-2 text-figma-sm text-fw-error"><AlertCircle className="w-4 h-4" />{error}</p>
            )}
            <button type="submit" className="w-full py-3 rounded-lg bg-fw-primary text-white text-figma-base font-semibold hover:bg-fw-linkHover transition-colors">
              Continue
            </button>
            <p className="text-figma-xs text-fw-bodyLight leading-relaxed">
              By continuing you agree that this session records task timings, the routes you
              visit in this demo, your ratings and comments, and the name you enter — used only
              to improve these features. Everything here is simulated; no production systems or
              personal accounts are touched.
            </p>
          </form>
        )}
      </Shell>
    );
  }

  const pack = getAllPacks().find(p => p.id === session.packId);
  const script = pack?.scripts.find(s => s.id === session.scriptId);
  const persona = pack?.personas.find(p => p.id === session.personaId);
  const firstTask = pack?.tasks.find(t => t.id === script?.taskIds[0]);

  // ── Briefing ──
  if (session.phase === 'briefing' && pack && persona) {
    const dryRunProblems = session.preview ? testLabDryRun() : [];
    return (
      <Shell>
        {session.preview && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-fw-accent border border-fw-active/30 text-figma-sm text-fw-body">
            <strong className="font-semibold text-fw-heading">Preview mode.</strong> Results are marked preview and excluded from findings.
            {dryRunProblems.length > 0 && (
              <ul className="mt-2 space-y-1 text-fw-error">
                {dryRunProblems.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            )}
          </div>
        )}
        <p className="text-figma-xs font-semibold text-fw-link uppercase tracking-[0.08em] mb-1.5">Your role for this session</p>
        <h1 className="text-figma-2xl font-bold text-fw-heading tracking-[-0.03em] mb-4">{persona.name}</h1>
        <p className="text-figma-base text-fw-body leading-relaxed mb-3">{persona.bio}</p>
        <p className="text-figma-base text-fw-body leading-relaxed mb-8"><strong className="font-semibold text-fw-heading">Your goal:</strong> {persona.goal}</p>
        <p className="text-figma-sm text-fw-bodyLight mb-8">
          You'll work through {script?.taskIds.length} tasks in the live product. There are no wrong answers —
          we're testing the product, not you. A small panel follows you with the current task; use its hint button if you're stuck.
        </p>
        <button
          onClick={() => {
            signIn(`${(session.participantName || 'participant').toLowerCase().replace(/\s+/g, '.')}@testlab.local`);
            testLabBegin();
            navigate(firstTask?.startRoute ?? '/manage');
          }}
          className="w-full py-3 rounded-lg bg-fw-primary text-white text-figma-base font-semibold hover:bg-fw-linkHover transition-colors flex items-center justify-center gap-2">
          Begin testing <ArrowRight className="w-4 h-4" />
        </button>
      </Shell>
    );
  }

  // ── Mid-session visit to /test-lab ──
  if (session.phase === 'in-task') {
    const currentTask = pack?.tasks.find(t => t.id === script?.taskIds[session.taskIndex]);
    return (
      <Shell>
        <h1 className="text-figma-xl font-bold text-fw-heading mb-3">Session in progress</h1>
        <p className="text-figma-base text-fw-body mb-6">You're on task {session.taskIndex + 1} of {script?.taskIds.length}.</p>
        <button onClick={() => navigate(currentTask?.startRoute ?? '/manage')}
          className="px-4 py-2.5 rounded-lg bg-fw-primary text-white text-figma-sm font-semibold hover:bg-fw-linkHover">
          Return to the app
        </button>
      </Shell>
    );
  }

  // ── Wrap-up ──
  if (session.phase === 'wrap-up') {
    return (
      <Shell>
        <h1 className="text-figma-2xl font-bold text-fw-heading tracking-[-0.03em] mb-2">Almost done</h1>
        <p className="text-figma-base text-fw-body mb-8">Two quick ratings and two questions about the experience overall.</p>
        <div className="space-y-6">
          <Scale7 label="This product's capabilities meet my requirements." value={umux1} onChange={setUmux1} />
          <Scale7 label="This product is easy to use." value={umux2} onChange={setUmux2} />
          <div>
            <label htmlFor="testlab-liked-most" className="block text-figma-sm font-medium text-fw-heading mb-1.5">What worked best?</label>
            <textarea id="testlab-liked-most" value={likedMost} onChange={e => setLikedMost(e.target.value)} rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-fw-secondary bg-fw-base text-figma-base text-fw-heading focus:outline-none focus:border-fw-active" />
          </div>
          <div>
            <label htmlFor="testlab-liked-least" className="block text-figma-sm font-medium text-fw-heading mb-1.5">What was frustrating or confusing?</label>
            <textarea id="testlab-liked-least" value={likedLeast} onChange={e => setLikedLeast(e.target.value)} rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-fw-secondary bg-fw-base text-figma-base text-fw-heading focus:outline-none focus:border-fw-active" />
          </div>
          <button
            disabled={umux1 === null || umux2 === null}
            onClick={() => testLabWrapUp({ umuxCapabilities: umux1!, umuxEaseOfUse: umux2!, likedMost, likedLeast })}
            className="w-full py-3 rounded-lg bg-fw-primary text-white text-figma-base font-semibold hover:bg-fw-linkHover transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Submit results
          </button>
        </div>
      </Shell>
    );
  }

  // ── Submitted ──
  const pending = queueLength();
  return (
    <Shell>
      <h1 className="text-figma-2xl font-bold text-fw-heading tracking-[-0.03em] mb-2">Thank you</h1>
      <p className="text-figma-base text-fw-body mb-6">
        Your session is complete. Your feedback goes straight into shaping these features.
      </p>
      {(pending > 0 || !webhookConfigured()) && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-fw-accent border border-fw-active/30">
          <p className="text-figma-sm text-fw-body mb-3">
            {webhookConfigured()
              ? `${pending} result${pending === 1 ? '' : 's'} couldn't be sent automatically. Please download the file and email it to the study organizer.`
              : 'Automatic submission isn’t configured. Please download your results and email them to the study organizer.'}
          </p>
          <div className="flex items-center gap-3">
            <button onClick={() => downloadSessionJson(session)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-fw-secondary bg-fw-base text-figma-sm font-medium text-fw-heading hover:border-fw-active">
              <Download className="w-4 h-4" /> Download results
            </button>
            <button onClick={() => { void flushQueue().then(() => setFlushTick(t => t + 1)); }}
              className="px-3 py-2 rounded-lg border border-fw-secondary bg-fw-base text-figma-sm font-medium text-fw-heading hover:border-fw-active">
              Retry send
            </button>
          </div>
        </div>
      )}
      <button onClick={() => { testLabExit(); }}
        className="px-4 py-2.5 rounded-lg bg-fw-primary text-white text-figma-sm font-semibold hover:bg-fw-linkHover">
        Finish
      </button>
    </Shell>
  );
}
