import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCloudControl, useCloudControlActions } from '../../engine/react/useCloudControl';
import { aiSpendRows, fmtTokens, fmtUsd } from './aiSpend';

/**
 * The AI Gateway's Governance rail pages (Figma: NAAS AI), phase 1 — each one
 * a real, engine-backed surface. Teams & limits reads the token policies the
 * engine already enforces; Providers reads the model catalog; Virtual keys
 * reads the agent identities and their scopes. Deeper treatments land with
 * the Insights/Cost rebuilds.
 */

function PageShell({ title, blurb, children }: { title: string; blurb: string; children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
      <header className="mb-6">
        <h1 className="text-figma-2xl font-bold text-fw-heading tracking-[-0.03em]">{title}</h1>
        <p className="text-figma-base text-fw-body mt-1 max-w-2xl">{blurb}</p>
      </header>
      {children}
    </div>
  );
}

const card = 'rounded-2xl border border-fw-secondary bg-fw-base overflow-hidden';
const th = 'px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-fw-bodyLight bg-fw-wash/60';
const td = 'px-5 py-3 text-figma-sm text-fw-body';

/** Teams & limits — every token policy: who it scopes, the ceiling, the meter. */
export function AiTeamsPage() {
  const cc = useCloudControlActions();
  const policies = useCloudControl(c => c.tokenPolicyList?.() ?? []) as {
    tag: string; scope?: string; budget: number; enforced?: boolean; guardrail?: boolean;
  }[];
  const rows = aiSpendRows(cc);

  return (
    <PageShell
      title="Teams & limits"
      blurb="Every team the gateway meters, its budget, and where today's tokens stand against it."
    >
      <div className={card} data-testid="teams-table">
        <table className="w-full">
          <thead>
            <tr>
              <th className={th}>Team / tag</th>
              <th className={th}>Scope</th>
              <th className={th}>Budget (tokens/day)</th>
              <th className={th}>Metered today</th>
              <th className={th}>Guardrail</th>
              <th className={th}>State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fw-secondary">
            {policies.map(p => {
              const meter = rows.find(r => r.tag === p.tag);
              return (
                <tr key={p.tag}>
                  <td className={`${td} font-medium text-fw-heading`}>{p.tag}</td>
                  <td className={td}>{p.scope ?? 'identity'}</td>
                  <td className={`${td} tabular-nums`}>{p.budget.toLocaleString()}</td>
                  <td className={`${td} tabular-nums`}>
                    {meter ? `${fmtTokens(meter.tokensToday)} · ${fmtUsd(meter.spendToday)}` : 'ceiling only — no meter'}
                  </td>
                  <td className={td}>{p.guardrail ? 'On' : 'Off'}</td>
                  <td className={td}>{p.enforced ? 'Enforced' : 'Draft'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Link to="/ai/govern" className="inline-flex items-center gap-1 mt-4 text-figma-sm font-medium text-fw-link hover:underline">
        Edit policies in Policies <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </PageShell>
  );
}

/** Providers — the model catalog the gateway can route to. */
export function AiProvidersPage() {
  const catalog = useCloudControl(c => c.modelCatalog?.() ?? []) as {
    id: string; name: string; kind: string; endpoint: string; p50: number; price: number; ready: boolean;
  }[];

  return (
    <PageShell
      title="Providers"
      blurb="Every model endpoint the gateway can route to — where it terminates, what it costs, and whether it is ready."
    >
      <div className={card} data-testid="providers-table">
        <table className="w-full">
          <thead>
            <tr>
              <th className={th}>Model</th>
              <th className={th}>Kind</th>
              <th className={th}>Endpoint</th>
              <th className={th}>P50 latency</th>
              <th className={th}>$ / 1M tokens</th>
              <th className={th}>State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fw-secondary">
            {catalog.map(m => (
              <tr key={m.id}>
                <td className={`${td} font-medium text-fw-heading`}>{m.name}</td>
                <td className={td}>{m.kind}</td>
                <td className={td}>{m.endpoint}</td>
                <td className={`${td} tabular-nums`}>{m.p50} ms</td>
                <td className={`${td} tabular-nums`}>${m.price.toFixed(2)}</td>
                <td className={td}>
                  {m.ready
                    ? <span className="text-fw-success font-medium">Ready</span>
                    : <span className="text-fw-bodyLight">Not attached</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link to="/ai/connect" className="inline-flex items-center gap-1 mt-4 text-figma-sm font-medium text-fw-link hover:underline">
        Attach endpoints in Connect <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </PageShell>
  );
}

/** Virtual keys — the agent identities that hold invoke scopes. */
export function AiKeysPage() {
  const cc = useCloudControlActions();
  const agents = useCloudControl(c => c.agentList?.() ?? []) as {
    id: string; name: string; app: string; scopes: string[]; enabled: boolean;
  }[];

  return (
    <PageShell
      title="Virtual keys"
      blurb="The identities that can invoke models through the gateway, and exactly what each one is scoped to."
    >
      <div className={card} data-testid="keys-table">
        <table className="w-full">
          <thead>
            <tr>
              <th className={th}>Key / agent</th>
              <th className={th}>App tag</th>
              <th className={th}>Scopes</th>
              <th className={th}>State</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fw-secondary">
            {agents.map(a => (
              <tr key={a.id}>
                <td className={`${td} font-medium text-fw-heading`}>{a.name}</td>
                <td className={td}>{a.app}</td>
                <td className={td}>
                  <span className="flex flex-wrap gap-1">
                    {a.scopes.map(s => (
                      <code key={s} className="rounded bg-fw-neutral px-1.5 py-0.5 text-[11px] text-fw-heading">{s}</code>
                    ))}
                  </span>
                </td>
                <td className={td}>
                  {a.enabled
                    ? <span className="text-fw-success font-medium">Active</span>
                    : <span className="text-fw-warn font-medium">Suspended</span>}
                </td>
                <td className={`${td} text-right`}>
                  <button
                    type="button"
                    data-testid={`key-toggle-${a.id}`}
                    onClick={() => cc.toggleAgent?.(a.id)}
                    className="rounded-full border border-fw-secondary bg-fw-base px-3 py-1 text-figma-sm font-medium text-fw-body hover:border-fw-active hover:text-fw-link"
                  >
                    {a.enabled ? 'Suspend' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
