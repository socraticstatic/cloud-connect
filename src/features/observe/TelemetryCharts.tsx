import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useCloudControl } from '../../engine/react/useCloudControl';

const N = 56;

// Literal Flywheel/Okabe-Ito hex values — SVG/Recharts stroke props don't
// resolve `stroke-fw-*` Tailwind classes, so series colors are literal here.
const FALLBACK_COLORS = ['#0072B2', '#D55E00', '#CC79A7', '#009E73', '#E69F00', '#56B4E9'];

interface TelemetryRegion {
  key: string;
  name: string;
  cloudName: string;
  color?: string;
  attached: boolean;
  latency: number[];
  throughput: number[];
}

export function TelemetryCharts() {
  const t = useCloudControl(cc => cc.telemetry(N)) as {
    regions: TelemetryRegion[];
    egress: Array<{ pub: number; priv: number }>;
  };

  const regions = t.regions;
  const latencyData = Array.from({ length: N }, (_, i) => {
    const row: Record<string, number> = { i };
    regions.forEach(r => { row[r.key] = r.latency[i]; });
    return row;
  });
  const egressData = t.egress.map((e, i) => ({ i, pub: e.pub, priv: e.priv }));

  return (
    <div className="space-y-4" data-tour="observe-telemetry">
      <div className="rounded-2xl border border-fw-secondary bg-fw-base overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-fw-secondary bg-fw-wash">
          <span className="font-medium text-fw-heading">Latency by region</span>
          <span className="text-figma-xs text-fw-bodyLight">ms · last {N} samples</span>
        </div>

        {/* Explicit Flywheel legend — real DOM text a test can assert against,
            independent of whether Recharts renders series labels in jsdom. */}
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 px-5 pt-3" aria-label="Regions">
          {regions.map((r, i) => (
            <li key={r.key} className="inline-flex items-center gap-1.5 text-figma-xs text-fw-body">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: r.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length] }}
              />
              {r.name}
              <span className="text-fw-bodyLight">· {r.cloudName}</span>
              {r.attached && (
                <span className="inline-flex items-center h-4 px-1.5 rounded-full bg-fw-successLight text-fw-success text-[10px] font-medium">
                  private
                </span>
              )}
            </li>
          ))}
        </ul>

        <div style={{ width: '100%', height: 240 }} className="px-3 pb-4 pt-2">
          <ResponsiveContainer width="100%" height={240} minWidth={300} minHeight={240}>
            <LineChart data={latencyData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="#f3f4f6" strokeWidth={1} vertical={false} />
              <XAxis dataKey="i" tick={{ fontSize: 10, fill: '#686e74' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#686e74' }}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(v: number) => `${v}ms`}
              />
              <Tooltip />
              {regions.map((r, i) => (
                <Line
                  key={r.key}
                  type="monotone"
                  dataKey={r.key}
                  name={r.name}
                  stroke={r.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-fw-secondary bg-fw-base overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-fw-secondary bg-fw-wash">
          <span className="font-medium text-fw-heading">Egress · public vs. committed private</span>
          <span className="text-figma-xs text-fw-bodyLight">$/day · last {N} samples</span>
        </div>

        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 px-5 pt-3" aria-label="Egress series">
          <li className="inline-flex items-center gap-1.5 text-figma-xs text-fw-body">
            <span className="inline-block h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: '#D55E00' }} />
            Public transit
          </li>
          <li className="inline-flex items-center gap-1.5 text-figma-xs text-fw-body">
            <span className="inline-block h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: '#009E73' }} />
            Committed private
          </li>
        </ul>

        <div style={{ width: '100%', height: 200 }} className="px-3 pb-4 pt-2">
          <ResponsiveContainer width="100%" height={200} minWidth={300} minHeight={200}>
            <AreaChart data={egressData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="#f3f4f6" strokeWidth={1} vertical={false} />
              <XAxis dataKey="i" tick={{ fontSize: 10, fill: '#686e74' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#686e74' }}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(v: number) => `$${v}`}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="pub"
                name="Public transit"
                stroke="#D55E00"
                fill="#D55E00"
                fillOpacity={0.12}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                stackId="egress"
              />
              <Area
                type="monotone"
                dataKey="priv"
                name="Committed private"
                stroke="#009E73"
                fill="#009E73"
                fillOpacity={0.12}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                stackId="egress"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
