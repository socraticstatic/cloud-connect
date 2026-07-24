import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useCloudControlLive, useCloudControlActions } from '../../engine/react/useCloudControl';
import { toggleAndi } from '../andi/AndiPanel';

/**
 * The estate's promises, live. One row per declared intent: a status badge
 * the engine re-derives on every read, the evidence sentence, and the
 * repair. Synchronize stages the intent's compiled moves into the twin's
 * design tray (?draft=intent-<id>) - the machine never commits.
 *
 * Each intent threads into the strata it constrains: the chips name the
 * layers, and the row's left edge carries the status color so a violated
 * promise reads at a glance. `animate-pulse` is globally suppressed under
 * prefers-reduced-motion (see e2e/reduced-motion.spec.ts).
 */

/** Which strata a catalog key constrains - the same keys StackPanel's
 *  bands carry (stack-band-ai / -cloud / -naas / -transport). */
const THREADS: Record<string, string[]> = {
  'minimize-latency': ['naas', 'transport'],
  'path-diversity': ['naas', 'transport'],
  'route-by-cost': ['naas', 'transport'],
  'data-sensitivity': ['cloud', 'naas'],
  'private-inference': ['ai', 'naas'],
  'cap-token-spend': ['ai'],
};

const BADGE: Record<string, { dot: string; label: string }> = {
  aligned: { dot: 'bg-fw-success', label: 'Aligned' },
  drifting: { dot: 'bg-fw-gray-500', label: 'Drifting' },
  violated: { dot: 'bg-fw-red-600 animate-pulse', label: 'Violated' },
};

const EDGE: Record<string, string> = {
  aligned: 'border-l-fw-success',
  drifting: 'border-l-fw-gray-400',
  violated: 'border-l-fw-red-600',
};

export function IntentThreads() {
  const intents = useCloudControlLive(cc => cc.intentList());
  const actions = useCloudControlActions();
  const navigate = useNavigate();

  return (
    <section data-testid="intent-threads" className="mb-4">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h3 className="text-figma-sm font-bold text-fw-heading tracking-[-0.02em]">
          Standing intents
        </h3>
        {intents.length > 0 && (
          <span className="text-figma-xs text-fw-bodyLight">
            {intents.filter(i => i.reading.status === 'aligned').length} of {intents.length} aligned
          </span>
        )}
      </div>

      {intents.length === 0 ? (
        <p className="rounded-xl border border-dashed border-fw-secondary px-4 py-3 text-figma-sm text-fw-bodyLight">
          Nothing declared yet. Tell Andi the outcome you want, for example
          &ldquo;keep ai private&rdquo;, and the estate starts holding the promise.
          <button
            type="button"
            data-testid="intent-empty-andi"
            onClick={toggleAndi}
            className="ml-2 font-medium text-fw-link hover:underline"
          >
            Ask Andi
          </button>
        </p>
      ) : (
        <ul className="space-y-2">
          {intents.map(i => {
            const badge = BADGE[i.reading.status];
            return (
              <li
                key={i.id}
                data-testid={`intent-row-${i.id}`}
                className={`rounded-xl border border-fw-secondary border-l-4 ${EDGE[i.reading.status]} bg-fw-base px-4 py-3`}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span
                    data-testid={`intent-badge-${i.id}`}
                    data-status={i.reading.status}
                    className="inline-flex items-center gap-1.5 text-figma-xs font-semibold uppercase tracking-[0.08em] text-fw-heading"
                  >
                    <span aria-hidden="true" className={`h-2 w-2 rounded-full ${badge.dot}`} />
                    {badge.label}
                  </span>
                  <span className="text-figma-sm font-medium text-fw-heading">{i.scope.label}</span>
                  <span className="text-figma-xs text-fw-bodyLight">
                    {THREADS[i.key]?.map(s => s.toUpperCase()).join(' · ')}
                  </span>
                  <span className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      data-testid={`intent-mode-${i.id}`}
                      onClick={() => actions.setIntentMode(i.id, i.mode === 'watch' ? 'enforce' : 'watch')}
                      className="h-7 rounded-lg border border-fw-secondary px-2.5 text-figma-xs font-medium text-fw-body hover:bg-fw-wash"
                      title={i.mode === 'watch' ? 'Watching: evaluates and counts, changes nothing' : 'Enforcing: the standing control is applied'}
                    >
                      {i.mode === 'watch' ? 'Watch' : 'Enforce'}
                    </button>
                    {i.reading.moves.length > 0 && (
                      <button
                        type="button"
                        data-testid={`intent-sync-${i.id}`}
                        onClick={() => navigate(`/discover?draft=intent-${i.id}`)}
                        className="h-7 rounded-lg bg-fw-ctaPrimary px-3 text-figma-xs font-medium text-white hover:bg-fw-ctaPrimaryHover"
                      >
                        Synchronize
                      </button>
                    )}
                    <button
                      type="button"
                      data-testid={`intent-remove-${i.id}`}
                      aria-label={`Remove the ${i.scope.label} intent`}
                      onClick={() => actions.removeIntent(i.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-fw-bodyLight hover:bg-fw-wash hover:text-fw-body"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </span>
                </div>
                <p className="mt-1 text-figma-sm text-fw-body">{i.reading.evidence}</p>
                {i.reading.watch && (
                  <p className="mt-1 text-figma-xs text-fw-bodyLight">{i.reading.watch.note}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
