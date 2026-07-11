import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCloudControl } from '../../engine/react/useCloudControl';

// Literal Flywheel/Okabe-Ito hex values — SVG/Recharts fill props don't
// resolve `fill-fw-*` Tailwind classes, so bar colors are literal here.
const FALLBACK_COLORS = ['#0072B2', '#D55E00', '#CC79A7', '#009E73', '#E69F00', '#56B4E9'];

interface TokenMeter {
  tag: string;
  ready: boolean;
  today: number;
  budget: number;
  pct: number;
}

export function TokenCharts() {
  const meters = useCloudControl(cc => cc.tokenMeterList()) as TokenMeter[];

  const data = meters.map((m, i) => ({
    tag: m.tag,
    today: m.today,
    budget: m.budget,
    color: FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));

  return (
    <div className="rounded-2xl border border-fw-secondary bg-fw-base overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-fw-secondary bg-fw-wash">
        <span className="font-medium text-fw-heading">Token spend by app</span>
        <span className="text-figma-xs text-fw-bodyLight">tokens today</span>
      </div>

      {/* Explicit Flywheel legend — real DOM text a test can assert against,
          independent of whether Recharts renders series labels in jsdom. */}
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 px-5 pt-3" aria-label="Token meters">
        {data.map(m => (
          <li key={m.tag} className="inline-flex items-center gap-1.5 text-figma-xs text-fw-body">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: m.color }}
            />
            {m.tag}
            {!meters.find(x => x.tag === m.tag)?.ready && (
              <span className="text-fw-bodyLight">· not yet metering</span>
            )}
          </li>
        ))}
      </ul>

      <div style={{ width: '100%', height: 220 }} className="px-3 pb-4 pt-2">
        <ResponsiveContainer width="100%" height={220} minWidth={300} minHeight={220}>
          <BarChart data={data} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid stroke="#f3f4f6" strokeWidth={1} vertical={false} />
            <XAxis dataKey="tag" tick={{ fontSize: 10, fill: '#686e74' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: '#686e74' }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
            />
            <Tooltip />
            <Bar dataKey="today" name="Tokens today" isAnimationActive={false}>
              {data.map(m => (
                <Cell key={m.tag} fill={m.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
