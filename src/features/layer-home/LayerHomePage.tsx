import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AttIcon } from '../../components/icons/AttIcon';
import { NAV_LAYERS, type NavLayer } from '../../components/navigation/navItems';
import { useCloudControlLive } from '../../engine/react/useCloudControl';
import { fmtTokens, fmtUsd } from '../ai-fabric/aiSpend';
import { aiStratum, naasStratum } from '../discover/stackFigures';
import type { CloudControl } from '../../engine/types';

/**
 * A layer's Home — the landing when you pick the layer up top, first in the
 * left rail. It states the layer's live figures (from the same getters its
 * verb pages read) and opens onto the four verbs. A layer never drops you
 * straight onto Govern; it opens onto its overview.
 */

interface Stat { label: string; value: string; tone?: 'plain' | 'warn' }

function layerStats(key: NavLayer['key'], cc: CloudControl): Stat[] {
  if (key === 'ai') {
    const f = aiStratum(cc);
    return [
      { label: 'Model endpoints ready', value: `${f.modelsReady}/${f.modelsTotal}` },
      { label: 'Tokens today', value: fmtTokens(f.tokensToday) },
      { label: 'On the public internet', value: fmtTokens(f.ungovernedTokensToday), tone: f.ungovernedTokensToday > 0 ? 'warn' : 'plain' },
      { label: 'Spend today', value: fmtUsd(f.spendToday) },
    ];
  }
  const f = naasStratum(cc);
  const money = (n: number) => `$${Math.round(n).toLocaleString()}/mo`;
  return [
    { label: 'Regions on the fabric', value: `${f.regionsAttached}/${f.regionsTotal}` },
    { label: 'Sites', value: `${f.sites}` },
    { label: 'Egress on public transit', value: money(f.egressPubMo), tone: f.egressPubMo > 0 ? 'warn' : 'plain' },
    { label: 'Still on the table', value: money(f.availableSavingsMo) },
  ];
}

export function LayerHomePage({ layerKey }: { layerKey: NavLayer['key'] }) {
  const cc = useCloudControlLive(c => c);
  const layer = NAV_LAYERS.find(l => l.key === layerKey)!;
  const stats = layerStats(layerKey, cc);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
      <header className="mb-6">
        <p className="text-figma-sm font-semibold uppercase tracking-[0.1em] text-fw-bodyLight">{layer.tagline}</p>
        <h1 className="text-figma-2xl font-bold text-fw-heading tracking-[-0.03em] mt-1">{layer.label}</h1>
        <p className="text-figma-base text-fw-body mt-1 max-w-2xl">{layer.blurb}</p>
      </header>

      {/* Live figures — the same derivations the verb pages state. */}
      <div data-testid="layer-home-stats" className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl border border-fw-secondary bg-fw-base p-4">
            <div className={`text-figma-2xl font-bold tabular-nums tracking-[-0.02em] ${s.tone === 'warn' ? 'text-fw-warn' : 'text-fw-heading'}`}>
              {s.value}
            </div>
            <div className="text-figma-sm text-fw-bodyLight mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Into the lifecycle. */}
      <h2 className="text-figma-base font-bold text-fw-heading tracking-[-0.02em] mb-3">Work this layer</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {layer.items.map(item => (
          <Link
            key={item.to}
            to={item.to}
            data-testid={`home-verb-${item.to.split('/').pop()}`}
            className="group flex items-start gap-3.5 rounded-2xl border border-fw-secondary bg-fw-base p-4 hover:border-fw-active transition-colors"
          >
            <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-fw-accent flex-shrink-0">
              <AttIcon name={item.icon} className="h-5 w-5 text-fw-link" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-figma-base font-bold text-fw-heading tracking-[-0.02em]">
                {item.label}
                <ArrowRight className="h-4 w-4 text-fw-bodyLight group-hover:text-fw-link transition-colors" />
              </span>
              <span className="block text-figma-sm text-fw-bodyLight mt-0.5">{item.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
