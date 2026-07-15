import { useState } from 'react';
import type { InventoryRow } from './useUnifiedInventory';

/**
 * Provider marks carry brand colors from the data layer (AWS orange, Azure
 * blue, …). White glyphs on a saturated mid-tone brand fail WCAG AA, so we pick
 * whichever of near-black / white gives the higher contrast against the brand
 * fill — keeping the mark on-brand while clearing 4.5:1. Saturated brand tones
 * resolve to dark text; genuinely dark brands keep white.
 */
function relLuminance(hex: string): number {
  const m = hex.replace('#', '');
  const h = m.length === 3 ? m.split('').map(c => c + c).join('') : m;
  const ch = [0, 2, 4].map(i => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
function readableOn(bg: string): string {
  const L = relLuminance(bg);
  const onDark = (L + 0.05) / 0.05; // pure-black glyph
  const onLight = 1.05 / (L + 0.05); // white glyph
  return onDark >= onLight ? '#000000' : '#ffffff';
}

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
      <button type="button" onClick={() => setOpen(o => !o)} aria-label={row.name} aria-expanded={open}
        className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-fw-wash/60 transition-colors">
        <span className="inline-flex items-center justify-center h-7 w-7 rounded-md text-[10px] font-bold" style={{ background: row.mark.color, color: readableOn(row.mark.color) }}>{row.mark.label}</span>
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
