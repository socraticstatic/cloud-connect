import { Gauge } from 'lucide-react';
import { WidgetFrame } from '../WidgetFrame';
import { useLayer, type LayerWidgetProps } from '../registry';
import { useCloudControlLive } from '../../../../engine/react/useCloudControl';
import { aiStratum, naasStratum } from '../../../discover/stackFigures';
import { fmtTokens, fmtUsd } from '../../../ai-fabric/aiSpend';
import type { CloudControl } from '../../../../engine/types';

interface Figure { label: string; value: string; warn?: boolean }

function estateFigures(cc: CloudControl, surface: 'naas' | 'ai'): Figure[] {
  if (surface === 'ai') {
    const f = aiStratum(cc);
    return [
      { label: 'Model endpoints ready', value: `${f.modelsReady}/${f.modelsTotal}` },
      { label: 'Tokens today', value: fmtTokens(f.tokensToday) },
      { label: 'On the public internet', value: fmtTokens(f.ungovernedTokensToday), warn: f.ungovernedTokensToday > 0 },
      { label: 'Spend today', value: fmtUsd(f.spendToday) },
    ];
  }
  const f = naasStratum(cc);
  const money = (n: number) => `$${Math.round(n).toLocaleString()}/mo`;
  return [
    { label: 'Regions on the fabric', value: `${f.regionsAttached}/${f.regionsTotal}` },
    { label: 'Sites', value: `${f.sites}` },
    { label: 'Egress on public transit', value: money(f.egressPubMo), warn: f.egressPubMo > 0 },
    { label: 'Still on the table', value: money(f.availableSavingsMo) },
  ];
}

export function EstateFiguresWidget(_props: LayerWidgetProps) {
  const surface = useLayer();
  const cc = useCloudControlLive(c => c);
  const figures = estateFigures(cc, surface);

  return (
    <WidgetFrame title="Estate at a glance" icon={Gauge}>
      <div className="grid grid-cols-2 gap-3">
        {figures.map(f => (
          <div key={f.label} data-testid="estate-figure">
            <div className={`text-figma-2xl font-bold tabular-nums tracking-[-0.02em] ${f.warn ? 'text-fw-warn' : 'text-fw-heading'}`}>
              {f.value}
            </div>
            <div className="text-figma-sm text-fw-bodyLight mt-0.5">{f.label}</div>
          </div>
        ))}
      </div>
    </WidgetFrame>
  );
}
