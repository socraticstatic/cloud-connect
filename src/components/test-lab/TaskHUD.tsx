import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FlaskConical, Lightbulb, Flag, Check, X, ChevronDown, Move, SkipForward, LogOut } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getAllPacks } from '../../data/testLab/packs';

const CORNERS = ['bottom-4 right-4', 'bottom-4 left-4', 'top-16 left-4', 'top-16 right-4'];

export function TaskHUD() {
  const session = useStore(s => s.testLabSession);
  const testLabResume = useStore(s => s.testLabResume);
  const testLabHint = useStore(s => s.testLabHint);
  const testLabIssue = useStore(s => s.testLabIssue);
  const testLabVerified = useStore(s => s.testLabVerified);
  const testLabRoute = useStore(s => s.testLabRoute);
  const testLabFirstClick = useStore(s => s.testLabFirstClick);
  const testLabComplete = useStore(s => s.testLabComplete);
  const testLabGiveUp = useStore(s => s.testLabGiveUp);
  const testLabSkip = useStore(s => s.testLabSkip);
  const testLabExit = useStore(s => s.testLabExit);

  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [corner, setCorner] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [comprehensionPick, setComprehensionPick] = useState<number | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [showIssue, setShowIssue] = useState(false);
  const [issueText, setIssueText] = useState('');
  const [confirmGiveUp, setConfirmGiveUp] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);

  const active = session?.phase === 'in-task';
  const pack = active ? getAllPacks().find(p => p.id === session!.packId) : undefined;
  const script = pack?.scripts.find(s => s.id === session!.scriptId);
  const persona = pack?.personas.find(p => p.id === session!.personaId);
  const task = pack && script ? pack.tasks.find(t => t.id === (session!.taskOrder ?? script.taskIds)[session!.taskIndex]) : undefined;
  const taskKey = task ? `${task.id}:${session!.taskIndex}` : '';
  const phase = session?.phase;

  // Participants finishing their final task land on the wrap-up screen.
  useEffect(() => {
    if (phase === 'wrap-up') navigate('/test-lab');
  }, [phase, navigate]);

  // Re-apply persona after a mid-session refresh.
  useEffect(() => { if (active) testLabResume(); }, [active, testLabResume]);

  // Route trail.
  useEffect(() => {
    if (active) testLabRoute(location.pathname);
  }, [active, location.pathname, testLabRoute]);

  // First click per task (capture phase, document level — zero-touch).
  useEffect(() => {
    if (!active || !task) return;
    const handler = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('[data-testlab-hud]')) return; // ignore clicks on the HUD itself
      const label = (el.closest('button, a, [role="button"]') as HTMLElement | null)?.textContent?.trim().slice(0, 80)
        ?? el.textContent?.trim().slice(0, 80) ?? '(unknown)';
      testLabFirstClick(label, window.location.hash.replace(/^#/, '') || '/');
      document.removeEventListener('click', handler, true);
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [active, taskKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Verification subscription — nudge only, and not for permission-wall tasks.
  useEffect(() => {
    if (!active || !task?.verifyId || !pack) return;
    const verifier = pack.verifiers[task.verifyId];
    if (!verifier) return;
    const check = (state: Record<string, any>) => {
      try { if (verifier(state)) testLabVerified(); } catch { /* drift — dry-run catches this in preview */ }
    };
    check(useStore.getState());
    const unsub = useStore.subscribe(check);
    return () => unsub();
  }, [active, taskKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate to the task's start route when the task changes; reset per-task UI state.
  const lastNavKey = useRef('');
  useEffect(() => {
    if (!active || !task) return;
    if (lastNavKey.current === taskKey) return;
    lastNavKey.current = taskKey;
    setRating(null); setComment(''); setComprehensionPick(null);
    setShowRating(false); setShowIssue(false); setIssueText(''); setConfirmGiveUp(false);
    if (task.startRoute && session!.routeTrail.length === 0) navigate(task.startRoute);
  }, [active, taskKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!active || !task || !script || !persona) return null;

  const n = session!.taskIndex + 1;
  const total = script.taskIds.length;
  const showNudge = session!.verifiedAt != null && task.path !== 'permission-wall' && !showRating;
  const hintsShown = session!.hintsRevealed;

  if (collapsed) {
    return (
      <button data-testlab-hud onClick={() => setCollapsed(false)}
        className={`fixed ${CORNERS[corner]} z-[90] flex items-center gap-2 px-3 py-2 rounded-full bg-fw-heading text-white shadow-lg text-figma-xs font-medium`}>
        <FlaskConical className="w-3.5 h-3.5" /> Task {n} of {total}
      </button>
    );
  }

  const submitDone = () => {
    const comprehensionCorrect = task.comprehensionCheck
      ? comprehensionPick === task.comprehensionCheck.correctIndex
      : undefined;
    const comprehensionAnswer = task.comprehensionCheck && comprehensionPick !== null
      ? task.comprehensionCheck.options[comprehensionPick]
      : undefined;
    testLabComplete({ easeRating: rating ?? undefined, comment: comment || undefined, comprehensionCorrect, comprehensionAnswer });
  };

  return (
    <div data-testlab-hud className={`fixed ${CORNERS[corner]} z-[90] w-[340px] rounded-xl bg-fw-base border border-fw-secondary shadow-xl`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-fw-secondary/60">
        <FlaskConical className="w-4 h-4 text-fw-link shrink-0" />
        <span className="text-figma-xs font-semibold text-fw-heading">Task {n} of {total}</span>
        <span className="text-figma-xs text-fw-bodyLight truncate">· {persona.name.split(' ')[0]}</span>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setConfirmExit(true)} title="End session"
            className="p-1 rounded hover:bg-fw-accent text-fw-bodyLight"><LogOut className="w-3.5 h-3.5" /></button>
          <button onClick={() => setCorner((corner + 1) % CORNERS.length)} title="Move panel"
            className="p-1 rounded hover:bg-fw-accent text-fw-bodyLight"><Move className="w-3.5 h-3.5" /></button>
          <button onClick={() => setCollapsed(true)} title="Collapse"
            className="p-1 rounded hover:bg-fw-accent text-fw-bodyLight"><ChevronDown className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        <p className="text-figma-sm text-fw-body leading-relaxed">{task.scenario}</p>

        {showNudge && (
          <p className="flex items-center gap-1.5 text-figma-xs text-fw-success font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-fw-success inline-block" /> Looks like that's done — wrap up this task?
          </p>
        )}

        {hintsShown > 0 && (
          <ul className="space-y-1.5">
            {task.hints.slice(0, hintsShown).map((h, i) => (
              <li key={i} className="flex gap-2 text-figma-xs text-fw-body">
                <Lightbulb className="w-3.5 h-3.5 text-fw-link shrink-0 mt-0.5" />{h}
              </li>
            ))}
          </ul>
        )}

        {confirmExit && (
          <div className="space-y-2 rounded-lg border border-fw-secondary bg-fw-accent px-3 py-2.5">
            <p className="text-figma-xs text-fw-body">End the whole session? Completed tasks are already saved; the app returns to how it was.</p>
            <div className="flex gap-2">
              <button onClick={() => { testLabExit(); navigate('/test-lab'); }}
                className="flex-1 py-1.5 rounded-lg border border-fw-error/40 text-fw-error text-figma-xs font-semibold hover:bg-fw-error/5">End session</button>
              <button onClick={() => setConfirmExit(false)}
                className="px-3 py-1.5 rounded-lg border border-fw-secondary text-figma-xs text-fw-body hover:border-fw-active">Keep testing</button>
            </div>
          </div>
        )}

        {/* Rating panel (after Done) */}
        {showRating ? (
          <div className="space-y-3 pt-1">
            {task.comprehensionCheck && (
              <div>
                <p className="text-figma-xs font-medium text-fw-heading mb-1.5">{task.comprehensionCheck.question}</p>
                <div className="space-y-1">
                  {task.comprehensionCheck.options.map((opt, i) => (
                    <label key={i} className="flex items-start gap-2 text-figma-xs text-fw-body cursor-pointer">
                      <input type="radio" name="testlab-comprehension" checked={comprehensionPick === i}
                        onChange={() => setComprehensionPick(i)} className="mt-0.5" />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-figma-xs font-medium text-fw-heading mb-1.5">How easy was that task?</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map(v => (
                  <button key={v} onClick={() => setRating(v)}
                    className={`w-8 h-8 rounded-md border text-figma-xs font-medium ${
                      rating === v ? 'bg-fw-primary text-white border-fw-primary' : 'bg-fw-base text-fw-body border-fw-secondary hover:border-fw-active'
                    }`}>{v}</button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-fw-bodyLight mt-1"><span>Very difficult</span><span>Very easy</span></div>
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="Anything to add? (optional)"
              className="w-full px-2.5 py-2 rounded-lg border border-fw-secondary bg-fw-base text-figma-xs text-fw-heading focus:outline-none focus:border-fw-active" />
            <button disabled={rating === null || (!!task.comprehensionCheck && comprehensionPick === null)} onClick={submitDone}
              className="w-full py-2 rounded-lg bg-fw-primary text-white text-figma-xs font-semibold hover:bg-fw-linkHover disabled:opacity-40 disabled:cursor-not-allowed">
              {n === total ? 'Finish tasks' : 'Next task'}
            </button>
          </div>
        ) : showIssue ? (
          <div className="space-y-2 pt-1">
            <textarea value={issueText} onChange={e => setIssueText(e.target.value)} rows={3} autoFocus
              placeholder="What's wrong or confusing here?"
              className="w-full px-2.5 py-2 rounded-lg border border-fw-secondary bg-fw-base text-figma-xs text-fw-heading focus:outline-none focus:border-fw-active" />
            <div className="flex gap-2">
              <button onClick={() => { if (issueText.trim()) { testLabIssue(issueText.trim(), location.pathname); setIssueText(''); setShowIssue(false); } }}
                className="flex-1 py-2 rounded-lg bg-fw-primary text-white text-figma-xs font-semibold hover:bg-fw-linkHover">Send report</button>
              <button onClick={() => setShowIssue(false)}
                className="px-3 py-2 rounded-lg border border-fw-secondary text-figma-xs text-fw-body hover:border-fw-active">Cancel</button>
            </div>
          </div>
        ) : confirmGiveUp ? (
          <div className="space-y-2 pt-1">
            <p className="text-figma-xs text-fw-body">Skip this task? That's a useful finding too — no judgment. What stopped you?</p>
            <div className="grid grid-cols-2 gap-1.5">
              {["Couldn't find where", "Task wasn't clear", 'The product blocked me', 'Just moving on'].map(reason => (
                <button key={reason} onClick={() => testLabGiveUp(reason)}
                  className="py-2 px-2 rounded-lg border border-fw-error/40 text-fw-error text-figma-xs font-medium hover:bg-fw-error/5 text-left">{reason}</button>
              ))}
            </div>
            <button onClick={() => setConfirmGiveUp(false)}
              className="w-full py-2 rounded-lg border border-fw-secondary text-figma-xs text-fw-body hover:border-fw-active">Keep trying</button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 pt-1">
            <button onClick={() => setShowRating(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-fw-primary text-white text-figma-xs font-semibold hover:bg-fw-linkHover">
              <Check className="w-3.5 h-3.5" /> Done
            </button>
            {hintsShown < task.hints.length && (
              <button onClick={() => testLabHint()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-fw-secondary text-figma-xs font-medium text-fw-body hover:border-fw-active">
                <Lightbulb className="w-3.5 h-3.5" /> Hint
              </button>
            )}
            <button onClick={() => setShowIssue(true)} title="Report an issue"
              className="p-2 rounded-lg border border-fw-secondary text-fw-body hover:border-fw-active"><Flag className="w-3.5 h-3.5" /></button>
            <button onClick={() => setConfirmGiveUp(true)} title="Give up on this task"
              className="p-2 rounded-lg border border-fw-secondary text-fw-body hover:border-fw-active"><X className="w-3.5 h-3.5" /></button>
            {session!.preview && (
              <button onClick={() => testLabSkip()} title="Skip (preview only)"
                className="p-2 rounded-lg border border-dashed border-fw-secondary text-fw-bodyLight hover:border-fw-active"><SkipForward className="w-3.5 h-3.5" /></button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
