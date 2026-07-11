import { AttIcon } from '../../components/icons/AttIcon';
import { useCloudControl, useCloudControlActions } from '../../engine/react/useCloudControl';

interface TokenPolicy {
  tag: string;
  scope: string;
  budget: number;
  guardrail: boolean;
  enforced: boolean;
}

export function TokenPolicies() {
  const policies = useCloudControl(cc => cc.tokenPolicyList()) as TokenPolicy[];
  const actions = useCloudControlActions();

  return (
    <div className="rounded-2xl border border-fw-secondary bg-fw-base overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-fw-secondary bg-fw-wash">
        <AttIcon name="apis" className="h-5 w-5 text-fw-body" />
        <span className="font-medium text-fw-heading">Token policies</span>
        <span className="text-figma-xs text-fw-bodyLight">
          {policies.filter(p => p.enforced).length} / {policies.length} enforced
        </span>
      </div>

      <table className="w-full text-figma-sm">
        <thead>
          <tr className="text-left text-figma-xs uppercase tracking-wide text-fw-bodyLight bg-fw-wash/60">
            <th className="px-5 py-2 font-medium">Tag</th>
            <th className="px-5 py-2 font-medium">Scope</th>
            <th className="px-5 py-2 font-medium">Budget</th>
            <th className="px-5 py-2 font-medium">Guardrail</th>
            <th className="px-5 py-2 font-medium">Status</th>
            <th className="px-5 py-2 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-fw-secondary">
          {policies.map(p => (
            <tr key={p.tag} className="align-top">
              <td className="px-5 py-3">
                <div className="font-medium text-fw-heading">{p.tag}</div>
              </td>
              <td className="px-5 py-3 text-fw-body">{p.scope}</td>
              <td className="px-5 py-3 text-fw-body tabular-nums">{p.budget.toLocaleString()}</td>
              <td className="px-5 py-3">
                <button
                  type="button"
                  onClick={() => actions.setTokenPolicy(p.tag, { guardrail: !p.guardrail })}
                  className={`inline-flex items-center h-6 px-2.5 rounded-full text-figma-xs font-medium transition-colors ${
                    p.guardrail
                      ? 'bg-fw-successLight text-fw-success'
                      : 'bg-fw-neutral text-fw-bodyLight'
                  }`}
                >
                  {p.guardrail ? 'Guardrail on' : 'Guardrail off'}
                </button>
              </td>
              <td className="px-5 py-3">
                <span
                  className={`inline-flex items-center h-6 px-2.5 rounded-full text-figma-xs font-medium ${
                    p.enforced
                      ? 'bg-fw-successLight text-fw-success'
                      : 'bg-fw-neutral text-fw-bodyLight'
                  }`}
                >
                  {p.enforced ? 'Enforced' : 'Draft'}
                </span>
              </td>
              <td className="px-5 py-3 text-right">
                {!p.enforced && (
                  <button
                    type="button"
                    onClick={() => actions.setTokenPolicy(p.tag, { enforced: true })}
                    className="inline-flex items-center h-8 px-3 rounded-full text-figma-xs font-medium bg-fw-active text-white hover:bg-fw-linkHover transition-colors"
                  >
                    Enforce
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
