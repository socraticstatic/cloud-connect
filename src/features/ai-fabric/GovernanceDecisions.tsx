import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AttIcon } from '../../components/icons/AttIcon';
import { useCloudControlLive } from '../../engine/react/useCloudControl';

// Literal Flywheel/Okabe-Ito hex values — SVG/Recharts fill props don't
// resolve `fill-fw-*` Tailwind classes, so bar colors are literal here.
const ALLOWED_HEX = '#009E73';
const GUARDRAIL_HEX = '#E69F00';
const DENIED_HEX = '#D55E00';

interface Decision {
  ts: number;
  allowed: boolean;
  guarded: boolean;
}

/**
 * The decision log, subscribed LIVE.
 *
 * `agentTick` writes a decision every 7s and emits `hits`; `useCloudControl`
 * drops `hits`, so this panel froze at its mount instant while the REQUESTS
 * KPI 400px above it — which reads `decisionLog().length` through the same
 * engine — kept counting. On a cold `/ai/observe` that rendered `REQUESTS 1`
 * over "0 traced requests", and later `REQUESTS 10` over "9 traced requests".
 * One derivation, one screen, two numbers.
 */
export function GovernanceDecisions() {
  const log = useCloudControlLive(cc => cc.decisionLog()) as Decision[];

  const allowed = log.filter(d => d.allowed && !d.guarded).length;
  const guardrail = log.filter(d => d.allowed && d.guarded).length;
  const denied = log.filter(d => !d.allowed).length;

  const data = [
    { name: 'Allowed', count: allowed, color: ALLOWED_HEX },
    { name: 'Guardrail', count: guardrail, color: GUARDRAIL_HEX },
    { name: 'Denied', count: denied, color: DENIED_HEX },
  ];

  return (
    <div className="rounded-2xl border border-fw-secondary bg-fw-base overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-fw-secondary bg-fw-wash">
        <AttIcon name="apps" className="h-5 w-5 text-fw-body" />
        <span className="font-medium text-fw-heading">Governance decisions</span>
        <span className="text-figma-xs text-fw-bodyLight">{log.length} traced requests</span>
      </div>

      {/* Explicit Flywheel legend — real DOM text a test can assert against,
          independent of whether Recharts renders series labels in jsdom. */}
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 px-5 pt-3" aria-label="Decision outcomes">
        {data.map(d => (
          <li key={d.name} className="inline-flex items-center gap-1.5 text-figma-xs text-fw-body">
            <span className="inline-block h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            {d.name} · {d.count}
          </li>
        ))}
      </ul>

      {log.length === 0 ? (
        <p className="px-5 py-6 text-figma-sm text-fw-bodyLight">
          No requests traced yet — run a trace above to populate this view.
        </p>
      ) : (
        <div style={{ width: '100%', height: 200 }} className="px-3 pb-4 pt-2">
          <ResponsiveContainer width="100%" height={200} minWidth={300} minHeight={200}>
            <BarChart data={data} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="#f3f4f6" strokeWidth={1} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#686e74' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#686e74' }}
                axisLine={false}
                tickLine={false}
                width={32}
                allowDecimals={false}
              />
              <Tooltip />
              <Bar dataKey="count" name="Decisions" isAnimationActive={false}>
                {data.map(d => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
