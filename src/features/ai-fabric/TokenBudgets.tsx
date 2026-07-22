import { Link } from 'react-router-dom';
import { AttIcon } from '../../components/icons/AttIcon';
import { StatTile } from '../../components/viz';
import { useCloudControlLive } from '../../engine/react/useCloudControl';
import { aiSpendTotals, fmtTokens, fmtUsd, statesRealMoney } from './aiSpend';

/**
 * Token budgets and spend — cost control at the token layer.
 *
 * Every figure here is an `aiSpendTotals(cc)` derivation, which is the same
 * module the AI Fabric Observe screen's Cost and Savings KPI tiles read. The
 * two screens therefore agree by construction rather than by coincidence —
 * and, via `useCloudControlLive`, at the same instant: the meters tick while
 * a viewer is on the page, so a screen that froze at mount would state a
 * figure the screen beside it had already moved past.
 *
 * ## One derivation per claim
 *
 * Two engine facts look alike and are not: an identity accrues token spend
 * whenever its agent issues a request, but that spend only rides the private
 * fabric once the endpoint is attached. The seeded estate rests with tokens
 * metered and nothing attached. Every count below that says "how many
 * identities are metering" reads `meteringCount`; every count that says "how
 * many are on a governed path" reads `governedCount`; the token figures all
 * read `tokensToday`. Nothing on this screen re-counts.
 */
export function TokenBudgets() {
  const spend = useCloudControlLive(aiSpendTotals);

  const budgetPct =
    spend.budgetTokens > 0 ? Math.round((spend.tokensToday / spend.budgetTokens) * 100) : 0;

  const { meteringCount, governedCount, identityCount } = spend;
  const ungoverned = identityCount - governedCount;

  /* The summary has to be true in every state the engine can reach: nothing
     metered, metering over the public internet (the seeded resting state),
     and metering on the fabric. Each clause states one derived count. */
  const meteringSentence =
    meteringCount === 0
      ? `No identity has metered a token yet. The ${identityCount} ceilings below are the budgets the token policies on AI Fabric · Govern set, and spend appears here the moment an agent issues its first request.`
      : `${meteringCount} of ${identityCount} identit${meteringCount === 1 ? 'y is' : 'ies are'} metering against ${meteringCount === 1 ? 'its' : 'their'} budget today.`;

  const pathSentence =
    ungoverned === 0
      ? ` All ${identityCount} call a model endpoint attached to the fabric, so their spend rides a governed path.`
      : ` ${ungoverned} of ${identityCount} call a model endpoint that is not attached yet, so those requests leave over the public internet.`;

  /* Guarded on the FORMATTED saving, not the raw float: at $0.0015 a
     `savings > 0` test passes and the sentence prints "holds $0.00 back". */
  const savingsSentence =
    meteringCount > 0 && statesRealMoney(spend.savings)
      ? ` Keeping them off the external model instead of routing everything to it holds ${fmtUsd(spend.savings)} of that spend back.`
      : '';

  const summary = meteringSentence + pathSentence + savingsSentence;

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
            label: `${fmtTokens(spend.tokensToday)} of ${fmtTokens(spend.budgetTokens)} tokens across ${identityCount} identities`,
          }}
        />
      </div>

      <div className="space-y-1">
        <p className="text-figma-sm text-fw-bodyLight">
          {summary}
          {ungoverned > 0 && (
            <>
              {' '}
              <Link to="/ai/connect" className="font-medium text-[#0057b8] hover:underline">
                Attach them in AI Fabric · Connect
              </Link>
              .
            </>
          )}
        </p>
        {unmeteredNote && <p className="text-figma-sm text-fw-bodyLight">{unmeteredNote}</p>}
      </div>

      <div className="rounded-xl border border-fw-secondary bg-fw-base overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-fw-secondary bg-fw-wash">
          <AttIcon name="bill" className="h-5 w-5 text-fw-body" />
          <span className="font-medium text-fw-heading">Token budgets</span>
          <span className="text-figma-xs text-fw-bodyLight">
            {meteringCount} / {identityCount} metering
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
                  {/* Two facts, two lines. The pill answers "is it spending?";
                      the line under it answers "over what path?". Collapsing
                      them into one chip is what let the table read
                      "Endpoint not attached" beside a non-zero token count. */}
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`inline-flex items-center h-6 px-2.5 rounded-full text-figma-xs font-medium whitespace-nowrap ${
                        r.metering && r.onGovernedPath
                          ? 'bg-fw-successLight text-fw-success'
                          : 'bg-fw-neutral text-fw-bodyLight'
                      }`}
                    >
                      {r.metering ? 'Metering' : 'No spend yet'}
                    </span>
                    <div className="mt-1 text-figma-xs text-fw-bodyLight">
                      {r.onGovernedPath ? 'Governed endpoint' : 'Endpoint not attached'}
                    </div>
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
