import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useFlowProgress, type FlowStatus } from './useFlowProgress';

/* Marker styling per status. Cobalt = current, green = done, slate = upcoming.
   No amber anywhere — attention lives in copy + the forward CTA, not hue. */
const MARKER: Record<FlowStatus, string> = {
  current: 'bg-[#0057b8] border-[#0057b8] text-white',
  done: 'bg-[#00a862] border-[#00a862] text-white',
  upcoming: 'bg-white border-[#cbd5e1] text-[#94a3b8]',
};

const LABEL: Record<FlowStatus, string> = {
  current: 'text-[#0057b8] font-semibold',
  done: 'text-[#0f172a] font-medium',
  upcoming: 'text-[#64748b] font-medium',
};

/**
 * Persistent horizontal flow rail: Discover → Connect → Govern → Observe →
 * Cost. Completion derives from engine state via `useFlowProgress()`. Compact
 * enough to sit directly under a page header.
 */
export function FlowStepper() {
  const stages = useFlowProgress();

  return (
    <nav aria-label="Flow progress" className="w-full">
      <ol className="flex items-center">
        {stages.map((s, i) => {
          const last = i === stages.length - 1;
          return (
            <li
              key={s.stage}
              aria-current={s.status === 'current' ? 'step' : undefined}
              className={`flex items-center ${last ? '' : 'flex-1'} min-w-0`}
            >
              <Link
                to={s.route}
                className="flex items-center gap-2 rounded-md px-1 py-0.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057b8]/40"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${MARKER[s.status]}`}
                >
                  {s.status === 'done' && <Check size={12} aria-hidden="true" />}
                  {s.status === 'current' && <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />}
                </span>
                <span className={`text-[13px] leading-none ${LABEL[s.status]}`}>{s.label}</span>
              </Link>
              {!last && (
                <span
                  aria-hidden="true"
                  className={`mx-2 h-px flex-1 ${s.status === 'done' ? 'bg-[#00a862]/40' : 'bg-[#e2e8f0]'}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
