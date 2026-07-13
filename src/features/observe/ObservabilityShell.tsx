import { useState } from 'react';
import type { ObservabilityBinding, RecordRow } from './ObservabilityBinding';

// Left-border tone indicator per record row. Uses Tailwind classes that
// resolve against tailwind.config.js's `borderColor.fw-success` /
// `borderColor.fw-warn` tokens (verified via a direct Tailwind CLI build —
// `.border-l-fw-success` / `.border-l-fw-warn` compile to real
// `border-left-color` declarations).
function toneClass(tone: RecordRow['tone']): string {
  switch (tone) {
    case 'ok':
      return 'border-l-2 border-l-fw-success';
    case 'warn':
    case 'bad':
      return 'border-l-2 border-l-fw-warn';
    default:
      return '';
  }
}

export function ObservabilityShell({ binding }: { binding: ObservabilityBinding }) {
  const tabs = binding.flowTabs();
  const groups = binding.groupByOptions();
  const [tab, setTab] = useState(tabs[0]?.id ?? '');
  const [groupBy, setGroupBy] = useState(groups[0]?.id ?? 'none');
  const kpis = binding.kpis();
  const rows = binding.records(groupBy);
  const series = binding.flowSeries(tab);
  const brief = binding.briefing();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-figma-2xl font-semibold text-fw-heading">{binding.title}</h1>
        <span className="inline-flex items-center gap-1.5 text-figma-xs font-medium text-fw-success">
          <span className="h-2 w-2 rounded-full bg-fw-success" /> Live
        </span>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map(k => (
          <div key={k.key} data-testid="kpi-tile" className="rounded-2xl border border-fw-secondary bg-fw-base p-4">
            <div className="text-figma-xs uppercase tracking-wide text-fw-bodyLight">{k.label}</div>
            <div className="mt-1 text-figma-2xl font-semibold text-fw-heading tabular-nums">
              {k.value}{k.unit ? <span className="text-figma-sm text-fw-bodyLight ml-1">{k.unit}</span> : null}
            </div>
            {k.sub ? <div className="text-figma-xs text-fw-bodyLight mt-0.5">{k.sub}</div> : null}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* main column */}
        <div className="lg:col-span-2 space-y-4">
          {/* flow panel */}
          <div className="rounded-2xl border border-fw-secondary bg-fw-base overflow-hidden">
            <div className="flex items-center gap-1 px-3 py-2 border-b border-fw-secondary bg-fw-wash">
              {tabs.map(t => (
                <button key={t.id} type="button" onClick={() => setTab(t.id)}
                  className={`h-8 px-3 rounded-full text-figma-xs font-medium ${tab === t.id ? 'bg-fw-heading text-white' : 'text-fw-body hover:bg-fw-wash'}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div data-testid="flow-panel" data-tab={tab} className="p-4">
              {/* deterministic mini bar series — inline SVG keeps it dep-free + testable */}
              <svg viewBox={`0 0 ${Math.max(series.length * 10, 10)} 40`} className="w-full h-24">
                {series.map((p, i) => {
                  const max = Math.max(...series.map(s => s.v), 1);
                  const h = (p.v / max) * 36;
                  return <rect key={i} x={i * 10 + 1} y={40 - h} width="8" height={h} rx="1" fill="#009FDB" />;
                })}
              </svg>
            </div>
          </div>

          {/* records table */}
          <div className="rounded-2xl border border-fw-secondary bg-fw-base overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-fw-secondary bg-fw-wash">
              <span className="font-medium text-fw-heading flex-1">Records</span>
              <label className="text-figma-xs text-fw-bodyLight">Group by</label>
              <select data-testid="groupby-select" value={groupBy} onChange={e => setGroupBy(e.target.value)}
                className="h-8 px-2 rounded-md border border-fw-secondary bg-fw-base text-figma-xs text-fw-body">
                {groups.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
            </div>
            <table className="w-full text-figma-sm">
              <thead>
                <tr className="text-left text-figma-xs uppercase tracking-wide text-fw-bodyLight bg-fw-wash/60">
                  {binding.columns.map(c => <th key={c} className="px-5 py-2 font-medium">{c}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-fw-secondary">
                {rows.map(r => (
                  <tr key={r.id} data-testid="record-row" className={toneClass(r.tone)}>
                    {r.cells.map((cell, i) => <td key={i} className="px-5 py-2.5 text-fw-body">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* briefing rail */}
        <aside className="rounded-2xl border border-fw-secondary bg-fw-wash p-4 space-y-3">
          <div className="text-figma-xs uppercase tracking-wide text-fw-bodyLight">{binding.layer === 'ai' ? 'Fabric briefing' : 'Network briefing'}</div>
          <div className="space-y-2 text-figma-sm text-fw-body">
            {brief.narrative.map((b, i) => (
              <p key={i} className={b.emphasis === 'risk' ? 'text-fw-warn' : b.emphasis === 'strong' ? 'text-fw-heading font-medium' : ''}>{b.text}</p>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {brief.actions.map(a => (
              <button key={a.id} type="button" className="h-8 px-3 rounded-full border border-fw-secondary bg-fw-base text-figma-xs text-fw-body hover:bg-fw-wash">{a.label}</button>
            ))}
          </div>
          <div className="pt-2 border-t border-fw-secondary space-y-1">
            {brief.followups.map((q, i) => <div key={i} className="text-figma-xs text-fw-bodyLight">{q}</div>)}
          </div>
        </aside>
      </div>
    </div>
  );
}
