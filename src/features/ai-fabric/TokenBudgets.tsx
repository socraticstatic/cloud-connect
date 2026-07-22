import { AttIcon } from '../../components/icons/AttIcon';
import { StatTile } from '../../components/viz';
import { useCloudControl } from '../../engine/react/useCloudControl';
import { aiSpendTotals, fmtTokens, fmtUsd } from './aiSpend';

/**
 * Token budgets and spend — cost control at the token layer.
 *
 * Every figure here is an `aiSpendTotals(cc)` derivation, which is the same
 * module the AI Fabric Observe screen's Cost and Savings KPI tiles read. The
 * two screens therefore agree by construction rather than by coincidence.
 *
 * An identity only meters once its endpoint's path is attached, so a freshly
 * seeded estate has budgets but no spend. That is a real state, not a blank
 * one: the ceilings still render, every row says why it is not metering, and
 * the summary line says where to go and attach one.
 */
export function TokenBudgets() {
  const spend = useCloudControl(aiSpendTotals);

  const budgetPct =
    spend.budgetTokens > 0 ? Math.round((spend.tokensToday / spend.budgetTokens) * 100) : 0;

  // The summary sentence has to be true in BOTH states the engine can reach.
  // Nothing metering: no spend claim at all. Metering: the savings clause only
  // appears when there is a saving to state.
  const summary =
    spend.tokensToday === 0
      ? 'No identity is metering yet — token spend starts when a model endpoint is attached in AI Fabric · Connect. The ceilings below are the budgets set by the token policies on AI Fabric · Govern.'
      : `${spend.meteringCount} of ${spend.identityCount} identities are metering against their budgets today.` +
        (spend.savings > 0
          ? ` Keeping them off the external model instead of routing everything to it holds ${fmtUsd(spend.savings)} of that spend back.`
          : '');

  /* Govern lists every token policy; only the metered app tags appear here.
     Say so, in the reader's terms and with the count derived — otherwise this
     screen totals three budgets while Govern shows four, and the discrepancy
     is left for the audience to find. */
  const unmetered = spend.unmeteredPolicyTags;
  const unmeteredNote =
    unmetered.length === 0
      ? null
      : `${unmetered.length} further token polic${unmetered.length === 1 ? 'y' : 'ies'} on AI Fabric · Govern (${unmetered.join(', ')}) scope${unmetered.length === 1 ? 's' : ''} a group rather than a metered identity, so ${unmetered.length === 1 ? 'it carries' : 'they carry'} a ceiling but no meter here.`;

  return (
    <div className="space-y-4">
      <div data-testid="ai-cost-totals" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile label="Tokens today" value={fmtTokens(spend.tokensToday)} />
        <StatTile label="Spend today" value={fmtUsd(spend.spendToday)} />
        <StatTile
          label="Budget used"
          value={`${budgetPct}%`}
          meter={{
            pct: budgetPct,
            label: `${fmtTokens(spend.tokensToday)} of ${fmtTokens(spend.budgetTokens)} tokens across ${spend.identityCount} metered identities`,
          }}
        />
      </div>

      <div className="space-y-1">
        <p className="text-figma-sm text-fw-bodyLight">{summary}</p>
        {unmeteredNote && <p className="text-figma-sm text-fw-bodyLight">{unmeteredNote}</p>}
      </div>

      <div className="rounded-xl border border-fw-secondary bg-fw-base overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-fw-secondary bg-fw-wash">
          <AttIcon name="bill" className="h-5 w-5 text-fw-body" />
          <span className="font-medium text-fw-heading">Token budgets</span>
          <span className="text-figma-xs text-fw-bodyLight">
            {spend.meteringCount} / {spend.identityCount} metering
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-figma-sm">
            <thead>
              <tr className="text-left text-figma-xs uppercase tracking-wide text-fw-bodyLight bg-fw-wash/60">
                <th className="px-5 py-2 font-medium">Identity</th>
                <th className="px-5 py-2 font-medium">Model</th>
                <th className="px-5 py-2 font-medium">Tokens today</th>
                <th className="px-5 py-2 font-medium">Budget</th>
                <th className="px-5 py-2 font-medium">Spend today</th>
                <th className="px-5 py-2 font-medium text-center">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fw-secondary">
              {spend.rows.map(r => (
                <tr key={r.tag} className="align-top">
                  <td className="px-5 py-3">
                    <div className="font-mono text-figma-xs text-fw-heading">{r.tag}</div>
                  </td>
                  <td className="px-5 py-3 text-fw-body">
                    {r.modelName}
                    <div className="mt-0.5 text-figma-xs text-fw-bodyLight tabular-nums">
                      ${r.price.toFixed(2)}/1M
                    </div>
                  </td>
                  <td className="px-5 py-3 text-fw-body tabular-nums">
                    {r.tokensToday.toLocaleString()}
                    <div className="mt-0.5 text-figma-xs text-fw-bodyLight tabular-nums">
                      {r.pct}% of budget
                    </div>
                  </td>
                  <td className="px-5 py-3 text-fw-body tabular-nums">
                    {r.budgetTokens.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-fw-body tabular-nums">{fmtUsd(r.spendToday)}</td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`inline-flex items-center h-6 px-2.5 rounded-full text-figma-xs font-medium whitespace-nowrap ${
                        r.metering
                          ? 'bg-fw-successLight text-fw-success'
                          : 'bg-fw-neutral text-fw-bodyLight'
                      }`}
                    >
                      {r.metering ? 'Metering' : 'Endpoint not attached'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
