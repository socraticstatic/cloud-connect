import { useCloudControl } from '../../engine/react/useCloudControl';
import { StatTile } from '../../components/viz';
import { EgressSplit } from './EgressSplit';
import { EgressTrend } from './EgressTrend';
import { InvoiceTable } from './InvoiceTable';
import { SteerToSave } from './SteerToSave';
import { estimateMonthlySavings, publicGbps, toSavingsRec, PUBLIC_EXPOSURE_ALERT_USD } from './costMath';

export function CostPage() {
  const billing = useCloudControl(cc => cc.billing());
  const egress = useCloudControl(cc => cc.egress());
  // telemetry(n).egress is a per-tick { pub, priv } $ split (state-telemetry.ts
  // egressSeries), not a flat number[] — sum the two buckets into a single
  // $/tick figure for the trend line.
  const series = useCloudControl(cc => cc.telemetry(60).egress.map(e => e.pub + e.priv));
  const advisor = useCloudControl(cc => cc.routeAdvisor());
  const flows = useCloudControl(cc => cc.routeFlows());

  const identified = billing.savings +
    estimateMonthlySavings(
      advisor.recommendations.map(r => toSavingsRec(r, flows)),
      egress.pub, publicGbps(flows));

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-4">
        <h1 className="text-xl font-semibold text-slate-900">Cost</h1>
        <p className="text-sm text-slate-500">
          What the fabric costs, what it saves, and what is still on the table.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Savings identified" value={`$${identified.toLocaleString()}/mo`}
                  delta={{ text: `${billing.forecast} forecast`, tone: egress.pub > PUBLIC_EXPOSURE_ALERT_USD ? 'bad' : 'good' }} />
        <StatTile label="This month" value={`$${billing.total.toLocaleString()}`} />
        <StatTile label="Public exposure" value={`$${billing.uncommitted.toLocaleString()}/mo`}
                  delta={{ text: billing.uncommitted > 0 ? 'uncommitted, no SLA' : 'fully committed', tone: billing.uncommitted > 0 ? 'bad' : 'good' }} />
        <StatTile label="Commit draw" value={`$${billing.commitDraw.toLocaleString()}`}
                  meter={{ pct: billing.commitPct, label: `Commit draw ${billing.commitPct}% of $${billing.commit.toLocaleString()}` }} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section aria-labelledby="split-h" className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 id="split-h" className="mb-3 text-sm font-semibold text-slate-900">Egress: private vs public</h2>
            <EgressSplit priv={egress.priv} pub={egress.pub} />
          </section>
          <section aria-labelledby="trend-h" className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 id="trend-h" className="mb-3 text-sm font-semibold text-slate-900">Egress spend, trailing 60 ticks</h2>
            <EgressTrend series={series} />
          </section>
          <section aria-labelledby="inv-h" className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 id="inv-h" className="mb-3 text-sm font-semibold text-slate-900">Consumption invoice</h2>
            <InvoiceTable lines={billing.lines} total={billing.total} />
          </section>
        </div>
        <aside className="rounded-xl border border-slate-200 bg-white p-4 h-fit">
          <SteerToSave />
        </aside>
      </div>
    </main>
  );
}
