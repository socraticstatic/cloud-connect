import { Info } from 'lucide-react';
import { useCloudControl, useCloudControlActions } from '../../engine/react/useCloudControl';
import { CONNECTIVITY_PATHS, pathEvidence } from './pathChoice';

/**
 * How a customer chooses between the two connectivity options, using portal
 * data rather than a slide. Every figure comes from `pathEvidence`, which
 * reads the engine seeds — so the choice moves when the estate moves.
 */
export function PathChoice({ cloudId, regionId }: { cloudId: string; regionId: string }) {
  const cc = useCloudControlActions();
  // Re-derive when an on-ramp is activated or a region is provisioned.
  useCloudControl(() => 0);

  const rows = pathEvidence(cc, cloudId, regionId);
  if (rows.length === 0) return null;

  return (
    <section className="rounded-xl border border-fw-secondary bg-fw-wash p-4">
      <h3 className="text-figma-sm font-semibold text-fw-heading">How you connect</h3>
      <p className="mt-1 text-figma-xs text-fw-bodyLight">
        Two ways onto the fabric for this region. The numbers below are this estate&apos;s, not a brochure&apos;s.
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {CONNECTIVITY_PATHS.map(path => {
          const e = rows.find(r => r.pathId === path.id)!;
          return (
            <div
              key={path.id}
              data-testid={`path-${path.id}`}
              className={`rounded-lg border p-3 ${
                e.available ? 'border-[#0057b8]/30 bg-[#0057b8]/[0.04]' : 'border-fw-secondary bg-fw-neutral/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-figma-sm font-semibold text-fw-heading">{path.label}</span>
                <span
                  className={`inline-flex items-center h-6 px-2.5 rounded-full text-figma-xs font-medium ${
                    e.available ? 'bg-fw-successLight text-fw-success' : 'bg-fw-neutral text-fw-bodyLight'
                  }`}
                >
                  {e.available ? 'Available here' : 'Not available here'}
                </span>
              </div>

              <p className="mt-1.5 text-figma-xs text-fw-body">{path.promise}</p>

              <dl className="mt-3 grid grid-cols-2 gap-2 text-figma-xs">
                <div>
                  <dt className="text-fw-bodyLight">Latency</dt>
                  <dd className="font-semibold text-fw-heading">{e.latencyMs} ms</dd>
                </div>
                <div>
                  <dt className="text-fw-bodyLight">Isolation</dt>
                  <dd className="font-semibold text-fw-heading">
                    {e.isolation === 'per-tenant' ? 'Per tenant' : 'Shared mid-mile'}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-fw-bodyLight">On-ramp</dt>
                  <dd className="font-semibold text-fw-heading">{e.onrampName ?? 'None in this region'}</dd>
                </div>
              </dl>

              <p className="mt-3 text-figma-xs text-fw-bodyLight">{path.underlay}</p>

              {e.caveats.map(c => (
                <p key={c} className="mt-2 flex gap-1.5 text-figma-xs text-fw-body">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0057b8]" aria-hidden />
                  <span>{c}</span>
                </p>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
