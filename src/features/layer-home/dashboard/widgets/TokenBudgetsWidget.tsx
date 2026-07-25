import { Coins } from 'lucide-react';
import { WidgetFrame } from '../WidgetFrame';
import type { LayerWidgetProps } from '../registry';
import { useCloudControlLive, useCloudControlActions } from '../../../../engine/react/useCloudControl';
import { fmtTokens } from '../../../ai-fabric/aiSpend';

interface Policy { tag: string; budget: number; enforced: boolean }

export function TokenBudgetsWidget(_props: LayerWidgetProps) {
  const cc = useCloudControlActions();
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
                onClick={() => cc.setTokenPolicy(p.tag, { enforced: true })}
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
