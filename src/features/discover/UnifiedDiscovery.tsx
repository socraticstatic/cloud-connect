import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useUnifiedInventory } from './useUnifiedInventory';
import { DiscoveryRow } from './DiscoveryRow';
import { useRevealStagger } from './useRevealStagger';
import { FlowBar } from '../../components/flow/FlowBar';

type Lens = 'all' | 'network' | 'ai';

export function UnifiedDiscovery() {
  const rows = useUnifiedInventory();
  const [lens, setLens] = useState<Lens>('all');
  const visible = rows.filter(r => (lens === 'all' ? true : lens === 'network' ? r.network : r.ai));
  // +1 slot reserved for the public-internet finding, which always lands last.
  const stagger = useRevealStagger(visible.length + 1);
  const publicWorkloads = rows
    .filter(r => r.network?.path === 'public')
    .reduce((sum, r) => sum + (r.network?.workloads ?? 0), 0);
  const chips: { id: Lens; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'network', label: 'Network' },
    { id: 'ai', label: 'AI' },
  ];
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-figma-2xl font-semibold text-fw-heading">Discover</h1>
        <p className="text-figma-sm text-fw-bodyLight">
          One inventory — network on-ramps and AI endpoints across every cloud and provider.
        </p>
      </div>
      <FlowBar
        cta={
          publicWorkloads > 0
            ? { label: `Attach ${publicWorkloads} public workloads`, to: '/connect?from=discover' }
            : undefined
        }
      />
      <div className="flex items-center gap-2">
        {chips.map(c => (
          <button
            key={c.id}
            type="button"
            aria-pressed={lens === c.id}
            onClick={() => setLens(c.id)}
            className={`h-8 px-3 rounded-full border text-figma-xs font-medium transition-colors ${
              lens === c.id
                ? 'bg-fw-heading text-white border-transparent'
                : 'bg-fw-base text-fw-body border-fw-secondary hover:bg-fw-wash'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {visible.map((r, i) => (
          <div key={r.key} style={stagger(i)}>
            <DiscoveryRow row={r} lens={lens} />
          </div>
        ))}
      </div>
      {publicWorkloads > 0 && (
        <div
          role="alert"
          style={stagger(visible.length)}
          className="flex items-center gap-2 rounded-2xl border border-l-2 border-[#cbd5e1] border-l-[#94a3b8] bg-[#f8fafc] px-4 py-3 text-figma-sm font-medium text-[#475569]"
        >
          <Globe size={15} className="shrink-0 text-[#64748b]" aria-hidden="true" />
          {publicWorkloads} workload{publicWorkloads === 1 ? '' : 's'} reachable over the public internet
        </div>
      )}
    </div>
  );
}
