import { PiggyBank } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WidgetFrame } from '../WidgetFrame';
import type { LayerWidgetProps } from '../registry';
import { useCloudControlLive } from '../../../../engine/react/useCloudControl';
import { advisorDraft } from '../../../discover/stackFigures';

export function MoneyOnTheTableWidget(_props: LayerWidgetProps) {
  const navigate = useNavigate();
  const { available, buckets, moveCount } = useCloudControlLive(c => {
    const arb = c.arbitrage();
    return {
      available: arb.availableSavings,
      buckets: arb.buckets.filter(b => !b.attached).slice(0, 3),
      moveCount: advisorDraft(c).moves.length,
    };
  });

  // Review stages the advisor's own draft into the twin's tray (?draft=andi,
  // the same param StackPanel's advisor chip uses) — the machine stages,
  // never commits.
  const review = (
    <button
      data-testid="money-review"
      disabled={moveCount === 0}
      onClick={() => navigate('/discover?draft=andi')}
      className="rounded-full bg-fw-ctaPrimary px-3 py-1.5 text-figma-xs font-medium text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
    >
      Review {moveCount} {moveCount === 1 ? 'move' : 'moves'}
    </button>
  );

  return (
    <WidgetFrame title="Money on the table" icon={PiggyBank} action={review}>
      <div className="text-figma-2xl font-bold tabular-nums tracking-[-0.02em] text-fw-heading">
        {`$${Math.round(available).toLocaleString()}/mo`}
      </div>
      <div className="text-figma-sm text-fw-bodyLight mt-0.5 mb-3">still on the table if every on-ramp attached</div>
      <ul className="flex flex-col divide-y divide-fw-secondary">
        {buckets.map(b => (
          <li key={b.key} data-testid="arb-bucket" className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
            <span className="text-figma-sm text-fw-body truncate">{b.label}</span>
            <span className="text-figma-sm font-semibold tabular-nums text-fw-success">
              {`$${Math.round(b.saving).toLocaleString()}/mo`}
            </span>
          </li>
        ))}
      </ul>
    </WidgetFrame>
  );
}
