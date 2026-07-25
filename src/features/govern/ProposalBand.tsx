import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useCloudControlLive } from '../../engine/react/useCloudControl';
import { ruleProposals } from './ruleProposals';

/**
 * What Andi spotted, above the rules it concerns. Every row restates the
 * engine's own finding sentence and the dryRun figures for the rule that
 * answers it; both actions navigate, neither mutates. A row disappears on its
 * own once its rule is enforced, because the finding's active predicate is
 * recomputed from the estate.
 */
export function ProposalBand() {
  const cc = useCloudControlLive(c => c);
  const proposals = ruleProposals(cc);

  if (!proposals.length) {
    return (
      <p data-testid="proposal-band-empty" className="text-figma-sm text-fw-bodyLight mb-3">
        Nothing on the estate currently needs a new rule.
      </p>
    );
  }

  return (
    <section
      data-testid="proposal-band"
      className="mb-4 rounded-2xl border border-fw-secondary bg-fw-wash p-4"
    >
      <h3 className="flex items-center gap-2 text-figma-sm font-semibold text-fw-heading tracking-[-0.03em] mb-3">
        <ShieldAlert className="h-4 w-4 text-fw-warn" aria-hidden="true" />
        Andi spotted {proposals.length} thing{proposals.length === 1 ? '' : 's'} worth a rule
      </h3>
      <ul className="flex flex-col divide-y divide-fw-secondary">
        {proposals.map(p => (
          <li key={p.id} data-testid="proposal-row" className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className={`text-figma-xs font-semibold uppercase tracking-[0.08em] ${p.severity === 'crit' ? 'text-fw-warn' : 'text-fw-bodyLight'}`}>
                  {p.severity}
                </span>
                <span className="text-figma-sm font-medium text-fw-heading">{p.title}</span>
              </span>
              <span className="block text-figma-sm text-fw-body mt-0.5">{p.detail}</span>
              <span className="block text-figma-xs text-fw-bodyLight mt-1 tabular-nums">
                {p.source} · enforcing {p.ruleName} would match {p.impact.matched} flow
                {p.impact.matched === 1 ? '' : 's'} carrying {p.impact.gbps} Gbps
              </span>
            </span>
            <span className="flex flex-shrink-0 items-center gap-2">
              <Link
                data-testid="proposal-enforce"
                to={`/discover?draft=${p.id}`}
                aria-label={`Enforce it: ${p.title}`}
                className="rounded-full bg-fw-ctaPrimary px-3 py-1.5 text-figma-xs font-medium text-white hover:opacity-90 transition-opacity"
              >
                Enforce it
              </Link>
              <Link
                data-testid="proposal-tighten"
                to={`/naas/govern?rule=${p.ruleId}`}
                aria-label={`Tighten it: ${p.title}`}
                className="rounded-full border border-fw-secondary bg-fw-base px-3 py-1.5 text-figma-xs font-medium text-fw-link hover:border-fw-active transition-colors"
              >
                Tighten it
              </Link>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
