import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function EgressTrend({ series }: { series: number[] }) {
  const data = series.map((v, i) => ({ i, v }));
  return (
    <div className="h-40" role="img" aria-label="Daily egress spend trend">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="i" hide />
          {/* Series is per-DAY, so the axis is $k/day — not the monthly invoice total. */}
          <YAxis width={52} tick={{ fontSize: 11, fill: '#64748b' }}
                 tickFormatter={(v: number) => `$${Math.round(v / 1000)}k/d`} />
          <Tooltip formatter={(v: number) => [`$${Math.round(v).toLocaleString()}/day`, 'Egress']}
                   labelFormatter={() => ''} />
          <Line dataKey="v" stroke="#0057b8" strokeWidth={2} dot={false}
                activeDot={{ r: 4 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
