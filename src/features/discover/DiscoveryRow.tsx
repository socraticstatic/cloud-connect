import { useState } from 'react';
import type { InventoryRow } from './useUnifiedInventory';

function Chip({ tone, children }: { tone: 'private' | 'public' | 'connected' | 'pending' | 'na'; children: React.ReactNode }) {
  const map: Record<string, string> = {
    private: 'bg-fw-successLight text-fw-success border-fw-success',
    public: 'bg-fw-wash text-fw-bodyLight border-fw-secondary',
    connected: 'bg-fw-successLight text-fw-success border-fw-success',
    pending: 'bg-fw-warnLight text-fw-warn border-fw-warn',
    na: 'bg-fw-wash text-fw-bodyLight border-fw-secondary',
  };
  return <span className={`inline-flex items-center h-6 px-2 rounded-full border text-figma-xs font-medium ${map[tone]}`}>{children}</span>;
}

export function DiscoveryRow({ row, lens }: { row: InventoryRow; lens: 'all' | 'network' | 'ai' }) {
  const [open, setOpen] = useState(false);
  const dimNet = lens === 'ai' ? 'opacity-40' : '';
  const dimAi = lens === 'network' ? 'opacity-40' : '';
  return (
    <div className="rounded-2xl border border-fw-secondary bg-fw-base overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)} aria-label={row.name}
        className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-fw-wash/60 transition-colors">
        <span className="inline-flex items-center justify-center h-7 w-7 rounded-md text-[10px] font-bold text-white" style={{ background: row.mark.color }}>{row.mark.label}</span>
        <span className="font-medium text-fw-heading flex-1">{row.name}</span>
        <span className={`flex items-center gap-2 ${dimNet}`}>
          <span className="text-figma-xs uppercase tracking-wide text-fw-bodyLight">Network</span>
          {row.network ? <Chip tone={row.network.path}>{row.network.path === 'private' ? 'Private' : 'Public'}</Chip> : <Chip tone="na">n/a</Chip>}
        </span>
        <span className={`flex items-center gap-2 ${dimAi}`}>
          <span className="text-figma-xs uppercase tracking-wide text-fw-bodyLight">AI</span>
          {row.ai ? <Chip tone={row.ai.status}>{row.ai.status === 'connected' ? 'Connected' : 'Pending'}</Chip> : <Chip tone="na">n/a</Chip>}
        </span>
      </button>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5 pb-4 pt-1 border-t border-fw-secondary">
          <div data-facet="network" className={dimNet}>
            <div className="text-figma-xs uppercase tracking-wide text-fw-bodyLight mb-1">Network</div>
            {row.network ? (
              <div className="text-figma-sm text-fw-body space-y-0.5">
                <div>{row.network.onrampName ?? 'No on-ramp'}</div>
                <div className="text-fw-bodyLight">{row.network.workloads} workloads · {row.network.path} path{row.network.attached ? ' · attached' : ''}</div>
              </div>
            ) : <div className="text-figma-sm text-fw-bodyLight">No network footprint</div>}
          </div>
          <div data-facet="ai" className={dimAi}>
            <div className="text-figma-xs uppercase tracking-wide text-fw-bodyLight mb-1">AI</div>
            {row.ai ? (
              <div className="text-figma-sm text-fw-body space-y-0.5">
                <div className="text-fw-bodyLight">{row.ai.provider} · {row.ai.readyCount}/{row.ai.models.length} ready</div>
                {row.ai.models.map(m => <div key={m.id}>{m.name}{m.ready ? '' : ' · pending'}</div>)}
              </div>
            ) : <div className="text-figma-sm text-fw-bodyLight">No AI endpoints</div>}
          </div>
        </div>
      )}
    </div>
  );
}
