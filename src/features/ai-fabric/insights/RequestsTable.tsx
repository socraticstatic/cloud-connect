import { fmtTokens, fmtUsd } from '../aiSpend';
import type { InsightRequestRow } from './insightsFigures';

/**
 * The request-level log (Figma 1:5302), savings columns in green. Ten
 * columns, not the comp's fifteen: this estate carries no ingress-site,
 * body-size or wall-clock-total facts, and an invented column is a mock
 * column. Divider borders only, wash header row, 56px rows.
 */
export function RequestsTable({ rows }: { rows: InsightRequestRow[] }) {
  return (
    <section
      data-testid="requests-table"
      className="rounded-2xl border border-fw-secondary bg-fw-base overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-figma-base font-bold text-fw-body tracking-[-0.03em]">
          Requests ({rows.length})
        </h3>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 pb-5 text-figma-sm text-fw-bodyLight">
          No requests yet. Agents issue traced requests every few seconds, so this
          table fills on its own.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-figma-sm">
            <thead>
              <tr className="bg-fw-wash border-b border-fw-secondary text-left">
                {['Time', 'Status', 'Identity', 'Model', 'Route', 'Tokens', 'Cost', 'Cost savings', 'TTFT', 'Reason'].map(h => (
                  <th key={h} className="px-3 py-2 first:pl-4 font-bold text-fw-heading whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr
                  key={r.id}
                  data-testid={`req-row-${r.id}`}
                  className="h-14 border-b border-fw-secondary last:border-b-0"
                >
                  <td className="px-3 pl-4 text-fw-body whitespace-nowrap">{r.time}</td>
                  <td className="px-3">
                    <span className="inline-flex items-center gap-1 rounded-2xl text-fw-body">
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${r.ok ? 'bg-fw-success' : 'bg-fw-red-600'}`}
                      />
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 text-fw-body">{r.identity}</td>
                  <td className="px-3">
                    <span className="block text-fw-body">{r.model}</span>
                    <span className="block text-xs text-fw-bodyLight">{r.provider}</span>
                  </td>
                  <td className="px-3 text-fw-body whitespace-nowrap">{r.route}</td>
                  <td className="px-3 text-fw-body">{r.tokens > 0 ? fmtTokens(r.tokens) : '0'}</td>
                  <td className="px-3 text-fw-body whitespace-nowrap">{r.ok ? fmtUsd(r.cost) : fmtUsd(0)}</td>
                  <td className="px-3 whitespace-nowrap">
                    {r.costSaved > 0 ? (
                      <>
                        <span className="block text-fw-success">{fmtUsd(r.costSaved)}</span>
                        <span className="block text-xs text-fw-success">{r.savedPct}%</span>
                      </>
                    ) : (
                      <span className="text-fw-bodyLight">·</span>
                    )}
                  </td>
                  <td className="px-3 text-fw-body whitespace-nowrap">
                    {r.ok ? `${Math.round(r.ttftMs)}ms` : '·'}
                  </td>
                  <td className="px-3 text-fw-bodyLight max-w-[280px] truncate" title={r.reason ?? undefined}>
                    {r.reason ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
