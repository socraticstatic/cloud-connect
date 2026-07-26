import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Boxes } from 'lucide-react';
import { AttIcon } from '../../components/icons/AttIcon';
import { useCloudControl } from '../../engine/react/useCloudControl';
import { TokenPolicyBuilder } from './TokenPolicyBuilder';

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
  /** Whether an enforce-mode cap-token-spend intent covers this tag right
   *  now — the missing piece the old two-state pill could not name. */
  capEnforced: boolean;
}

export function TokenPolicies() {
  /* ONE subscribing selector for the policies, their group resolutions, and
     their cap-intent coverage, so every figure the row renders is a CC
     derivation taken at render — the estate changing re-renders it.
     Resolution is never stored on the policy; the engine hands back only
     the group id and (via intentCapEnforced) a live yes/no. */
  const policies = useCloudControl(cc =>
    (cc.tokenPolicyList() as TokenPolicy[]).map((p): PolicyRow => {
      const capEnforced = cc.intentCapEnforced(p.tag);
      if (!p.group) return { ...p, groupLabel: null, resolvedCount: null, capEnforced };
      const g = (cc.groupList() as { id: string; label: string }[]).find(x => x.id === p.group);
      if (!g) return { ...p, groupLabel: null, resolvedCount: null, capEnforced };
      return {
        ...p,
        groupLabel: g.label,
        resolvedCount: (cc.resolveGroup(p.group) as { count: number }).count,
        capEnforced,
      };
    }),
  );

  // Builder state lives here, not in the engine — opening it stages nothing
  // by itself. undefined editTag means "New policy"; a tag means "Edit that
  // row". Closing (Cancel, Escape, or a successful stage) clears the tag too,
  // so reopening via "New policy" afterward starts blank rather than
  // silently carrying the last edited row forward — same idiom as
  // RulesPanel's seedRuleId.
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editTag, setEditTag] = useState<string | undefined>(undefined);
  const openBuilder = (tag?: string) => {
    setEditTag(tag);
    setBuilderOpen(true);
  };

  return (
    <div className="rounded-2xl border border-fw-secondary bg-fw-base overflow-hidden" data-tour="aifabric-policies">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-fw-secondary bg-fw-wash">
        <AttIcon name="apis" className="h-5 w-5 text-fw-body" />
        <span className="font-medium text-fw-heading">Token policies</span>
        <span className="text-figma-xs text-fw-bodyLight">
          {policies.filter(p => p.enforced).length} / {policies.length} enforced
        </span>
        {/* Create action belongs in the card header, not trailing the table
            — same placement RulesPanel's "New rule" uses. */}
        <button
          type="button"
          onClick={() => openBuilder(undefined)}
          className="ml-auto inline-flex items-center h-8 px-3.5 rounded-full text-figma-xs font-medium bg-fw-active text-white hover:bg-fw-linkHover transition-colors"
        >
          New policy
        </button>
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
                {/* Display only — a one-click flip here bypassed review and
                    left no undo entry. Guardrail is now a builder field;
                    changing it goes through Edit below. */}
                <span
                  className={`inline-flex items-center h-6 px-2.5 rounded-full text-figma-xs font-medium ${
                    p.guardrail
                      ? 'bg-fw-successLight text-fw-success'
                      : 'bg-fw-neutral text-fw-bodyLight'
                  }`}
                >
                  {p.guardrail ? 'Guardrail on' : 'Guardrail off'}
                </span>
              </td>
              <td className="px-5 py-3 text-center">
                {/* Three states, because the engine has three. The budget
                    gate needs the policy enforced AND an enforce-mode
                    cap-token-spend intent for this tag AND the meter at its
                    ceiling, so "Enforced" alone was a badge claiming an
                    enforcement the estate does not have. Armed names the
                    missing piece. This describes the BUDGET gate only: a
                    no-external or self-hosted scope denies an external
                    model whatever this pill says. */}
                {(() => {
                  const status = !p.enforced ? 'Draft' : p.capEnforced ? 'Enforcing' : 'Armed';
                  return (
                    <span
                      data-testid="policy-status"
                      title={
                        status === 'Armed'
                          ? 'Enforced, but no enforce-mode cap-token-spend intent covers this identity yet - the budget gate denies nothing until one is declared.'
                          : undefined
                      }
                      className={`inline-flex items-center h-6 px-2.5 rounded-full text-figma-xs font-medium whitespace-nowrap ${
                        status === 'Enforcing'
                          ? 'bg-fw-successLight text-fw-success'
                          : status === 'Armed'
                          ? 'bg-fw-warnLight text-fw-warn'
                          : 'bg-fw-neutral text-fw-bodyLight'
                      }`}
                    >
                      {status}
                    </span>
                  );
                })()}
              </td>
              <td className="px-5 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => openBuilder(p.tag)}
                    className="inline-flex items-center h-8 px-3 rounded-full text-figma-xs font-medium border border-fw-secondary text-fw-body hover:bg-fw-wash transition-colors"
                  >
                    Edit
                  </button>
                  {!p.enforced && (
                    /* Stages the enforce patch into the review tray
                       (?draft=policy-<tag>, the same token the layer-home
                       dashboard's Enforce link already uses) instead of
                       calling setTokenPolicy directly — the machine stages,
                       never commits, and setTokenPolicy pushes no undo
                       entry of its own. */
                    <Link
                      to={`/discover?draft=policy-${p.tag}`}
                      className="inline-flex items-center h-8 px-3 rounded-full text-figma-xs font-medium bg-fw-active text-white hover:bg-fw-linkHover transition-colors"
                    >
                      Enforce
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <TokenPolicyBuilder
        open={builderOpen}
        onOpenChange={v => {
          setBuilderOpen(v);
          // Closing (Cancel, Escape, or a successful stage) clears the edit
          // tag too — reopening via "New policy" afterward must start
          // blank, not silently carry the last edited row's tag forward.
          if (!v) setEditTag(undefined);
        }}
        editTag={editTag}
      />
    </div>
  );
}
