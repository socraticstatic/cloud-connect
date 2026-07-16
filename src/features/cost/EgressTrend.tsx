import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

/**
 * The widening gap. Two deterministic series over the trailing window: what the
 * same egress would cost at hyperscaler public rates (`hyper`, cobalt, filled)
 * vs what it actually costs on the AT&T fabric (`actual`, green). The band
 * between the two lines IS the accumulating saving — and it widens as more paths
 * are captured (each attach lowers `actual` and lifts the hyper-rate ratio).
 * One axis, recessive grid, no animation.
 */
export function EgressTrend({ actual, hyper }: { actual: number[]; hyper: number[] }) {
  const data = actual.map((v, i) => ({ i, actual: v, hyper: hyper[i] ?? v }));
  return (
    <div className="h-44" role="img" aria-label="Egress spend on the fabric vs at hyperscaler rates, trailing 60 days">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="i" hide />
          {/* Series is per-DAY, so the axis is $k/day — not the monthly invoice total. */}
          <YAxis width={52} tick={{ fontSize: 11, fill: '#64748b' }}
                 tickFormatter={(v: number) => `$${Math.round(v / 1000)}k/d`} />
          <Tooltip
            formatter={(v: number, name: string) => [
              `$${Math.round(v).toLocaleString()}/day`,
              name === 'hyper' ? 'At hyperscaler rates' : 'On the fabric',
            ]}
            labelFormatter={() => ''} />
          <Area dataKey="hyper" stroke="#0057b8" strokeWidth={1.5} fill="#0057b8" fillOpacity={0.06}
                dot={false} isAnimationActive={false} name="hyper" />
          <Line dataKey="actual" stroke="#00a862" strokeWidth={2} dot={false}
                activeDot={{ r: 4 }} isAnimationActive={false} name="actual" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
