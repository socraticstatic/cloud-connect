import { useState } from 'react';
import { Tag } from 'lucide-react';
import { AttIcon } from '../../components/icons/AttIcon';
import { useCloudControl, useCloudControlActions } from '../../engine/react/useCloudControl';

interface RuleSrc {
  tag?: string;
  cloud?: string;
}

interface Rule {
  id: string;
  pri: number;
  name: string;
  system?: boolean;
  src: RuleSrc;
  dst: string;
  ports: string;
  action: string;
  chain: string[];
  fix?: string;
}

interface Violation {
  tag?: string;
  vpc?: string | null;
  msg: string;
  policy?: string;
}

interface FixPreview {
  posture: number;
  pub: number;
  violations: number;
  egressPub: number;
  savings: number;
  scores: Record<string, number>;
}

function matchLabel(rule: Rule): string {
  const tagPart = rule.src.tag && rule.src.tag !== 'any' ? rule.src.tag : 'any';
  const cloudPart = rule.src.cloud && rule.src.cloud !== 'any' ? ` @ ${rule.src.cloud}` : '';
  return `${tagPart}${cloudPart}`;
}

function requirementLabel(rule: Rule): string {
  const dst = rule.dst === 'not-intra-tag' ? 'outside tag' : rule.dst;
  const via = rule.chain.length ? ` via ${rule.chain.join(' → ')}` : '';
  return `${rule.action} → ${dst}${rule.ports !== 'any' ? ` :${rule.ports}` : ''}${via}`;
}

export function RulesPanel() {
  const rules = useCloudControl(cc => cc.ruleList()) as Rule[];
  const violations = useCloudControl(cc => cc.violations()) as Violation[];
  const actions = useCloudControlActions();

  const [previews, setPreviews] = useState<Record<string, FixPreview | null>>({});

  const handleEnforce = (rule: Rule) => {
    actions.enforceAny(rule.id);
  };

  const handlePreview = (rule: Rule) => {
    if (!rule.fix) return;
    const result = actions.previewFix(rule.fix) as FixPreview | null;
    setPreviews(prev => ({ ...prev, [rule.id]: result }));
  };

  const handleApply = (rule: Rule) => {
    if (!rule.fix) return;
    actions.applyFix(rule.fix);
    setPreviews(prev => ({ ...prev, [rule.id]: null }));
  };

  return (
    <div className="space-y-4" data-tour="govern-rules">
      <div className="rounded-2xl border border-fw-secondary bg-fw-base overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-fw-secondary bg-fw-wash">
          <AttIcon name="check-shield" className="h-5 w-5 text-fw-body" />
          <span className="font-medium text-fw-heading">Rules</span>
          <span className="text-figma-xs text-fw-bodyLight">
            {rules.filter(r => actions.ruleEnforced(r)).length} / {rules.length} enforced
          </span>
          <span className="text-fw-bodyLight">·</span>
          <span className="text-figma-xs text-fw-bodyLight">
            {violations.length} violation{violations.length === 1 ? '' : 's'}
          </span>
        </div>

        <table className="w-full text-figma-sm">
          <thead>
            <tr className="text-left text-figma-xs uppercase tracking-wide text-fw-bodyLight bg-fw-wash/60">
              <th className="px-5 py-2 font-medium">Rule</th>
              <th className="px-5 py-2 font-medium">Match</th>
              <th className="px-5 py-2 font-medium">Requirement</th>
              <th className="px-5 py-2 font-medium">Status</th>
              <th className="px-5 py-2 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fw-secondary">
            {rules.map(rule => {
              const enforced = actions.ruleEnforced(rule);
              const preview = previews[rule.id];
              return (
                <tr key={rule.id} className="align-top">
                  <td className="px-5 py-3">
                    <div className="font-medium text-fw-heading">{rule.name}</div>
                    {!rule.system && (
                      <div className="text-figma-xs text-fw-bodyLight">Custom rule</div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-fw-body">
                    <span className="inline-flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-fw-bodyLight" aria-hidden="true" />
                      {matchLabel(rule)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-fw-body">{requirementLabel(rule)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center h-6 px-2.5 rounded-full text-figma-xs font-medium ${
                        enforced
                          ? 'bg-fw-successLight text-fw-success'
                          : 'bg-fw-neutral text-fw-bodyLight'
                      }`}
                    >
                      {enforced ? 'Enforced' : 'Unenforced'}
                    </span>
                    {preview && (
                      <div className="mt-1.5 text-figma-xs text-fw-bodyLight">
                        Preview: posture {preview.posture} · {preview.violations} violation
                        {preview.violations === 1 ? '' : 's'}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!enforced && (
                        <button
                          type="button"
                          onClick={() => handleEnforce(rule)}
                          className="inline-flex items-center h-8 px-3 rounded-full text-figma-xs font-medium bg-fw-active text-white hover:bg-fw-linkHover transition-colors"
                        >
                          Enforce
                        </button>
                      )}
                      {!enforced && rule.fix && (
                        <>
                          <button
                            type="button"
                            onClick={() => handlePreview(rule)}
                            className="inline-flex items-center h-8 px-3 rounded-full text-figma-xs font-medium border border-fw-secondary text-fw-body hover:bg-fw-wash transition-colors"
                          >
                            Preview impact
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApply(rule)}
                            className="inline-flex items-center h-8 px-3 rounded-full text-figma-xs font-medium border border-fw-secondary text-fw-body hover:bg-fw-wash transition-colors"
                          >
                            Apply
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {violations.length > 0 && (
        <div className="rounded-2xl border border-fw-secondary bg-fw-wash px-5 py-3">
          <div className="flex items-center gap-2 font-medium text-fw-heading text-figma-sm mb-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#94a3b8] shrink-0" />
            {violations.length} open violation{violations.length === 1 ? '' : 's'}
          </div>
          <ul className="space-y-1">
            {violations.map((v, i) => (
              <li key={i} className="text-figma-xs text-fw-body">
                {v.tag ? <span className="font-medium text-fw-heading">{v.tag}</span> : null}
                {v.tag ? ' — ' : ''}
                {v.msg}
                {v.vpc ? ` (${v.vpc})` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
