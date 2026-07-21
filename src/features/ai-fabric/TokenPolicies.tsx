import { Boxes } from 'lucide-react';
import { AttIcon } from '../../components/icons/AttIcon';
import { useCloudControl, useCloudControlActions } from '../../engine/react/useCloudControl';

interface TokenPolicy {
  tag: string;
  scope: string;
  budget: number;
  guardrail: boolean;
  enforced: boolean;
  /** Optional group id — the Govern grouping vocabulary reaching the token layer. */
  group?: string;
}

/** A group-scoped row, resolved for rendering. `label` null means the group
 *  id names nothing live — a dangling reference degrades to the raw key with
 *  no resolution line, visible rather than swallowed (same contract as
 *  Govern's rules table). */
interface PolicyRow extends TokenPolicy {
  groupLabel: string | null;
  resolvedCount: number | null;
}

export function TokenPolicies() {
  /* ONE subscribing selector for the policies and their group resolutions,
     so the "resolves to N right now" figure is a CC derivation taken at
     render — the estate changing re-renders it. Resolution is never stored
     on the policy; the engine hands back only the group id. */
  const policies = useCloudControl(cc =>
    (cc.tokenPolicyList() as TokenPolicy[]).map((p): PolicyRow => {
      if (!p.group) return { ...p, groupLabel: null, resolvedCount: null };
      const g = (cc.groupList() as { id: string; label: string }[]).find(x => x.id === p.group);
      if (!g) return { ...p, groupLabel: null, resolvedCount: null };
      return {
        ...p,
        groupLabel: g.label,
        resolvedCount: (cc.resolveGroup(p.group) as { count: number }).count,
      };
    }),
  );
  const actions = useCloudControlActions();

  return (
    <div className="rounded-2xl border border-fw-secondary bg-fw-base overflow-hidden" data-tour="aifabric-policies">
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
            <th className="px-5 py-2 font-medium text-center">Status</th>
            <th className="px-5 py-2 font-medium text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-fw-secondary">
          {policies.map(p => (
            <tr key={p.tag} className="align-top">
              <td className="px-5 py-3">
                {p.groupLabel !== null ? (
                  /* Govern's idiom for a group reference: Boxes icon + label
                     (a group and a tag are different kinds of match), the
                     stored id in mono underneath, and what the name means
                     right now — resolved live, not stored. */
                  <>
                    <div className="flex items-center gap-1.5 font-medium text-fw-heading">
                      <Boxes className="w-3.5 h-3.5 shrink-0 text-fw-bodyLight" aria-hidden="true" />
                      {p.groupLabel}
                    </div>
                    <div className="mt-0.5 font-mono text-figma-xs text-fw-bodyLight">{p.tag}</div>
                    <div className="mt-1 text-figma-xs text-fw-bodyLight">
                      resolves to {p.resolvedCount} object{p.resolvedCount === 1 ? '' : 's'} right now
                    </div>
                  </>
                ) : (
                  <div className="font-medium text-fw-heading">{p.tag}</div>
                )}
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
              <td className="px-5 py-3 text-center">
                <span
                  className={`inline-flex items-center h-6 px-2.5 rounded-full text-figma-xs font-medium whitespace-nowrap ${
                    p.enforced
                      ? 'bg-fw-successLight text-fw-success'
                      : 'bg-fw-neutral text-fw-bodyLight'
                  }`}
                >
                  {p.enforced ? 'Enforced' : 'Draft'}
                </span>
              </td>
              <td className="px-5 py-3 text-center">
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
