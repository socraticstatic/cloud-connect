import { Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WidgetFrame } from '../WidgetFrame';
import type { LayerWidgetProps } from '../registry';
import { useCloudControlLive } from '../../../../engine/react/useCloudControl';
import { fmtTokens } from '../../../ai-fabric/aiSpend';

interface Policy { tag: string; budget: number; enforced: boolean }

export function TokenBudgetsWidget(_props: LayerWidgetProps) {
  const navigate = useNavigate();
  const policies = useCloudControlLive<Policy[]>(c => c.tokenPolicyList() as Policy[]);

  return (
    <WidgetFrame title="Token budgets" icon={Coins}>
      <ul className="flex flex-col divide-y divide-fw-secondary">
        {policies.map(p => (
          <li key={p.tag} data-testid="token-policy-row" className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <span className="flex-1 min-w-0">
              <span className="text-figma-sm font-medium text-fw-heading">{p.tag}</span>
              <span className="block text-figma-xs text-fw-bodyLight tabular-nums">{fmtTokens(p.budget)} budget</span>
            </span>
            {p.enforced ? (
              <span className="text-figma-xs font-medium text-fw-success">Enforced</span>
            ) : (
              <button
                data-testid="token-enforce"
                // setTokenPolicy pushes no undo entry, so this stages the
                // patch into the review tray (?draft=policy-<tag>, the same
                // 'policy' StagedMove the engine's own repairs use) instead
                // of mutating directly — the machine stages, never commits.
                onClick={() => navigate(`/discover?draft=policy-${p.tag}`)}
                className="rounded-full bg-fw-ctaPrimary px-3 py-1 text-figma-xs font-medium text-white hover:opacity-90 transition-opacity"
              >
                Enforce
              </button>
            )}
          </li>
        ))}
      </ul>
    </WidgetFrame>
  );
}
