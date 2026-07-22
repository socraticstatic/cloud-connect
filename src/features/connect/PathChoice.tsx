import { Info } from 'lucide-react';
import { useCloudControl, useCloudControlActions } from '../../engine/react/useCloudControl';
import { AVAILABILITY_LABEL, CONNECTIVITY_PATHS, pathEvidence } from './pathEvidence';
import type { PathAvailability } from './pathEvidence';

/**
 * How a customer chooses between the two connectivity options, using portal
 * data rather than a slide. Every figure and every state comes from
 * `pathEvidence`, which reads `cc.fabricModel()` — so the card moves when the
 * estate moves, and its latency is the same figure the Performance tile four
 * lines above it shows.
 */

/* Badge treatments reuse RegionPanel's own pills so the two read as one panel:
   green for what is live, cobalt for what the customer can turn on, neutral
   for what does not exist here. No amber; nothing here is a policy violation. */
const BADGE: Record<PathAvailability, string> = {
  live: 'bg-fw-successLight text-fw-success',
  provisionable: 'bg-[#0057b8]/[0.08] text-[#0057b8]',
  none: 'bg-fw-neutral text-fw-bodyLight',
};

const CARD: Record<PathAvailability, string> = {
  live: 'border-[#0057b8]/30 bg-[#0057b8]/[0.04]',
  provisionable: 'border-fw-secondary bg-fw-base',
  none: 'border-fw-secondary bg-fw-neutral/40',
};

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
              data-availability={e.availability}
              className={`rounded-lg border p-3 ${CARD[e.availability]} ${e.availability === 'none' ? 'opacity-70' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-figma-sm font-semibold text-fw-heading">{path.label}</span>
                <span
                  className={`inline-flex items-center h-6 px-2.5 rounded-full text-figma-xs font-medium ${BADGE[e.availability]}`}
                >
                  {AVAILABILITY_LABEL[e.availability]}
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
                {e.handoffSite && (
                  <div className="col-span-2">
                    <dt className="text-fw-bodyLight">Hand-off</dt>
                    <dd className="font-semibold text-fw-heading">{e.handoffSite}</dd>
                  </div>
                )}
                {e.capacityNote && (
                  <div className="col-span-2">
                    <dt className="text-fw-bodyLight">Capacity / state</dt>
                    <dd className="font-semibold text-fw-heading">{e.capacityNote}</dd>
                  </div>
                )}
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
