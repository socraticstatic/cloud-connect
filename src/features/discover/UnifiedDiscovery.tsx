import { useState } from 'react';
import { useUnifiedInventory } from './useUnifiedInventory';
import { DiscoveryRow } from './DiscoveryRow';

type Lens = 'all' | 'network' | 'ai';

export function UnifiedDiscovery() {
  const rows = useUnifiedInventory();
  const [lens, setLens] = useState<Lens>('all');
  const visible = rows.filter(r => (lens === 'all' ? true : lens === 'network' ? r.network : r.ai));
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
        {visible.map(r => (
          <DiscoveryRow key={r.key} row={r} lens={lens} />
        ))}
      </div>
    </div>
  );
}
