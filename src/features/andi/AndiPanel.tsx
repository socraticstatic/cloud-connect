import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowUp, X } from 'lucide-react';
import { useCloudControlLive } from '../../engine/react/useCloudControl';
import { layerForPath, railSectionsFor, NAV_LAYERS } from '../../components/navigation/navItems';
import { andiAnswer, andiResolveCards, andiSuggestions, type AndiAction } from './andiBrain';

/**
 * Andi — the assistant panel from the AI Gateway design (NAAS AI Figma),
 * app-wide per Micah's decision. Anatomy per the extracted spec: 480px wash
 * panel, "Andi" header, Resolve action cards, Ask suggested prompts, thread
 * with confirm-to-run actions, prompt box pinned to a context chip.
 *
 * Every answer is engine-grounded (andiBrain). Copy deviation from the
 * Figma, on purpose: we say changes are REVERSIBLE (Undo covers every
 * commit) and do not claim time-boxing, which is not built.
 */

interface ThreadEntry {
  role: 'user' | 'andi';
  text?: string;
  html?: string;
  actions?: AndiAction[];
}

export const ANDI_OPEN_EVENT = 'cc-andi-toggle';
const OPEN_KEY = 'cc-andi-open';

/** The header button (MainNav) and the panel talk over a window event so no
 *  provider has to thread through the layout. */
export function toggleAndi() {
  window.dispatchEvent(new CustomEvent(ANDI_OPEN_EVENT));
}

export function AndiPanel() {
  const cc = useCloudControlLive(c => c);
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(() => {
    try { return localStorage.getItem(OPEN_KEY) === '1'; } catch { return false; }
  });
  const [thread, setThread] = useState<ThreadEntry[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onToggle = () => setOpen(o => !o);
    window.addEventListener(ANDI_OPEN_EVENT, onToggle);
    return () => window.removeEventListener(ANDI_OPEN_EVENT, onToggle);
  }, []);
  useEffect(() => {
    try { localStorage.setItem(OPEN_KEY, open ? '1' : '0'); } catch { /* private mode */ }
  }, [open]);
  useEffect(() => {
    // Optional-call: jsdom elements carry no scrollTo.
    scrollRef.current?.scrollTo?.({ top: scrollRef.current.scrollHeight });
  }, [thread]);

  const layer = layerForPath(location.pathname);
  const sectionLabel = layer
    ? railSectionsFor(layer).flatMap(s => s.items).find(i => location.pathname.startsWith(i.to))?.label ?? 'Overview'
    : 'Estate';
  const contextChip = `${layer?.label ?? 'Discover'} · ${sectionLabel}`;

  const ask = (q: string) => {
    const answer = andiAnswer(cc, q, layer?.key ?? null);
    setThread(t => [...t, { role: 'user', text: q }, { role: 'andi', ...answer }]);
  };

  const runAction = (a: AndiAction) => {
    if (a.kind === 'navigate' && a.to) navigate(a.to);
    else if (a.kind === 'ask' && a.prompt) ask(a.prompt);
    else if (a.kind === 'run' && a.run) {
      a.run();
      setThread(t => [...t, {
        role: 'andi',
        text: 'Applied. Undo (top bar) reverts it, and every screen already states the new figures.',
      }]);
    }
  };

  if (!open) return null;

  const resolve = andiResolveCards(cc);
  const suggestions = andiSuggestions(layer?.key ?? null);

  return (
    <aside
      data-testid="andi-panel"
      aria-label="Andi assistant"
      className="hidden min-[1024px]:flex flex-col w-[400px] min-[1440px]:w-[480px] flex-shrink-0 border-l border-fw-secondary bg-fw-wash min-h-full"
    >
      {/* chat header */}
      <div className="flex items-center justify-between h-[60px] pl-6 pr-4 flex-shrink-0">
        <span className="text-figma-base font-bold text-fw-heading tracking-[-0.03em]">Andi</span>
        <button
          type="button"
          data-testid="andi-close"
          aria-label="Close Andi"
          onClick={() => setOpen(false)}
          className="flex items-center justify-center h-10 w-10 rounded-full text-fw-bodyLight hover:bg-fw-neutral hover:text-fw-body"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-4 space-y-8">
        <p className="text-figma-sm text-fw-body">
          Ask anything about this view, or trigger an action below. Every change is
          reversible — Undo covers each commit.
        </p>

        {thread.length === 0 && (
          <>
            {resolve.length > 0 && (
              <section data-testid="andi-resolve">
                <h3 className="text-figma-sm font-bold text-fw-heading mb-2">Resolve</h3>
                <div className="space-y-3">
                  {resolve.map(cardItem => (
                    <div
                      key={cardItem.title}
                      className="rounded-2xl border border-fw-secondary bg-fw-base p-3 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                    >
                      <p className="text-figma-sm text-fw-body">{cardItem.title}</p>
                      <p className="text-figma-sm text-fw-bodyLight">
                        {cardItem.detail}
                        {cardItem.savingMo !== null && ` · saves ~$${Math.round(cardItem.savingMo).toLocaleString()}/mo`}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/discover?draft=andi')}
                        className="mt-3 h-8 rounded-lg bg-fw-ctaPrimary px-4 text-figma-sm font-medium text-white hover:bg-fw-ctaPrimaryHover"
                      >
                        Draft in the twin
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section data-testid="andi-ask">
              <h3 className="text-figma-sm font-bold text-fw-heading mb-2">Ask</h3>
              <div className="space-y-3">
                {suggestions.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="block w-full text-left rounded-lg border border-fw-secondary bg-fw-wash p-2 text-figma-sm text-fw-body shadow-[0px_1px_1px_rgba(0,0,0,0.05)] hover:border-fw-active"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {/* thread */}
        {thread.map((entry, i) =>
          entry.role === 'user' ? (
            <div key={i} className="flex justify-end">
              <p className="rounded-lg rounded-tr-none bg-fw-accent px-2 py-2 text-figma-sm text-fw-heading">
                {entry.text}
              </p>
            </div>
          ) : (
            <div key={i} className="space-y-3">
              {entry.html
                // Engine-authored HTML only (CC.answerFor) — user input is
                // matched against known questions, never interpolated.
                ? <div className="text-figma-sm text-fw-bodyLight leading-relaxed [&_b]:text-fw-heading" dangerouslySetInnerHTML={{ __html: entry.html }} />
                : <p className="text-figma-sm text-fw-bodyLight leading-relaxed">{entry.text}</p>}
              {entry.actions && entry.actions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.actions.map(a => (
                    <button
                      key={a.label}
                      type="button"
                      onClick={() => runAction(a)}
                      className="h-8 rounded-lg border border-fw-secondary bg-fw-base px-4 text-figma-sm font-medium text-fw-heading shadow-[0px_1px_1px_rgba(0,0,0,0.1)] hover:border-fw-active"
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ),
        )}
      </div>

      {/* prompt box */}
      <div className="px-6 pb-4 flex-shrink-0">
        <form
          onSubmit={e => {
            e.preventDefault();
            if (input.trim()) {
              ask(input.trim());
              setInput('');
            }
          }}
          className="rounded-2xl border border-fw-secondary bg-fw-base p-3 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
        >
          <input
            data-testid="andi-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask Andi"
            className="w-full bg-transparent text-figma-sm text-fw-heading placeholder:text-fw-bodyLight focus:outline-none"
          />
          <div className="mt-4 flex items-center justify-between">
            <span
              data-testid="andi-context"
              className="rounded-lg border border-fw-secondary bg-fw-wash px-2 py-1 text-[12px] text-fw-heading"
            >
              {contextChip}
            </span>
            <button
              type="submit"
              aria-label="Send"
              className="flex items-center justify-center h-8 w-8 rounded-full bg-fw-ctaPrimary text-white hover:bg-fw-ctaPrimaryHover"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-[11px] leading-4 text-fw-bodyLight">
          Answers are computed from the live engine. Review every action before applying.
        </p>
      </div>
    </aside>
  );
}
