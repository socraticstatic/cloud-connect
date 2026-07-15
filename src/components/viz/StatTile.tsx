// De-amber semantics: 'good' stays green, 'neutral' replaces the old warm
// 'bad' with slate-600 (no amber), and 'critical' is red — reserved for true
// errors only, never a routine "needs attention" state.
const DELTA_TONE = {
  good: 'text-[#00a862]',
  neutral: 'text-[#475569]',
  critical: 'text-[#dc2626]',
} as const;

export function StatTile({ label, value, delta, meter }: {
  label: string;
  value: string;
  delta?: { text: string; tone: keyof typeof DELTA_TONE };
  meter?: { pct: number; label: string };
}) {
  const pct = meter ? Math.min(100, Math.max(0, meter.pct)) : 0;
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 min-w-[180px]">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900 tabular-nums">{value}</div>
      {delta && <div className={`mt-0.5 text-xs font-medium ${DELTA_TONE[delta.tone]}`}>{delta.text}</div>}
      {meter && (
        <div className="mt-2">
          <div role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
               aria-label={meter.label} className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-[#0057b8] transition-[width] duration-200 ease-out"
                 style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1 text-[11px] text-slate-500">{meter.label}</div>
        </div>
      )}
    </div>
  );
}
