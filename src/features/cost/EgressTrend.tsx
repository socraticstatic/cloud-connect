import { VIZ_HEX, computeTrendGeometry } from '../../components/viz/kit';

const VIEW_W = 600;
const VIEW_H = 176;

/**
 * The widening gap, hand-rolled: what the same egress would cost at
 * hyperscaler public rates (cobalt band) vs what it actually costs on the
 * AT&T fabric (green line). The gap between them IS the accumulating
 * saving. One axis, three recessive gridlines, no animation.
 */
export function EgressTrend({ actual, hyper }: { actual: number[]; hyper: number[] }) {
  const both = [...actual, ...hyper];
  const max = Math.max(...both, 1);
  const gHyper = computeTrendGeometry(hyper.map(v => (v / max) * 100), VIEW_W, VIEW_H);
  const gActual = computeTrendGeometry(actual.map(v => (v / max) * 100), VIEW_W, VIEW_H);
  const gridYs = [0.25, 0.5, 0.75].map(f => VIEW_H * f);
  const kPerDay = (f: number) => `$${Math.round((max * (1 - f)) / 1000)}k/d`;
  return (
    <div className="h-44" role="img" aria-label="Egress spend on the fabric vs at hyperscaler rates, trailing 60 days">
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-full w-full">
        {gridYs.map((y, i) => (
          <g key={y}>
            <line x1={0} y1={y} x2={VIEW_W} y2={y} stroke={VIZ_HEX.line} strokeDasharray="3 3" />
            <text x={4} y={y - 3} fill={VIZ_HEX.slateInk} className="text-[10px] tabular-nums">
              {kPerDay([0.25, 0.5, 0.75][i])}
            </text>
          </g>
        ))}
        <path d={gHyper.area} fill={VIZ_HEX.cobalt} fillOpacity={0.06} />
        <path d={gHyper.line} fill="none" stroke={VIZ_HEX.cobalt} strokeWidth={1.5} />
        <path d={gActual.line} fill="none" stroke="#00a862" strokeWidth={2} />
      </svg>
    </div>
  );
}
