import { Network, Check } from 'lucide-react';
import { AttentionTag } from '../../components/viz/AttentionTag';
import { regionsOf, type Cloud } from './discoveryModel';
import type { CloudControl } from '../../engine/types';

/**
 * The AT&T fabric on-ramp rail. A faithful-but-simpler take on the original's
 * left column: each NetBond / Direct Connect / ExpressRoute / NetBond Adv
 * on-ramp with its status and the clouds·regions it reaches. No SVG
 * connection lines — the reach is spelled out in chips, which reads cleaner in
 * the light theme than half-drawn beziers.
 */

interface Onramp {
  id: string;
  name: string;
  type: string;
  sub: string;
  active: boolean;
  planned?: boolean;
  targets: [string, string][];
}

function targetLabel(cc: CloudControl, cloudId: string, regionId: string): { cloud: Cloud; region: string } | null {
  const cloud = (cc.clouds as Cloud[]).find(c => c.id === cloudId);
  const region = regionsOf(cc, cloudId).find(r => r.id === regionId);
  if (!cloud || !region) return null;
  return { cloud, region: region.name };
}

export function AttFabricRail({
  cc,
  highlighted,
  onHover,
}: {
  cc: CloudControl;
  /** on-ramp ids to highlight (driven by hovering a region/cloud in the tree) */
  highlighted?: ReadonlySet<string>;
  /** report which on-ramp the pointer is over, so the tree can light up its reach */
  onHover?: (id: string | null) => void;
}) {
  const onramps = cc.onramps as Onramp[];
  const active = onramps.filter(o => o.active).length;
  const reached = new Set<string>();
  for (const o of onramps) if (o.active) for (const [c, r] of o.targets) reached.add(`${c}/${r}`);

  return (
    <aside className="space-y-3" aria-label="AT&T fabric on-ramps">
      <div>
        <h2 className="flex items-center gap-2 text-figma-sm font-semibold text-fw-heading">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-fw-accent text-fw-primary">
            <Network size={14} aria-hidden="true" />
          </span>
          AT&amp;T fabric
        </h2>
        <p className="mt-1 text-[11px] text-fw-bodyLight">
          {active} of {onramps.length} on-ramps attached · {reached.size} region{reached.size === 1 ? '' : 's'} reached
        </p>
      </div>

      <div className="space-y-2.5">
        {onramps.map(o => (
          <div
            key={o.id}
            onMouseEnter={() => onHover?.(o.id)}
            onMouseLeave={() => onHover?.(null)}
            className={`rounded-xl border bg-fw-base p-3 transition-all ${
              highlighted?.has(o.id)
                ? 'border-[#0057b8] ring-1 ring-[#0057b8]/50'
                : o.active ? 'border-fw-success/40' : 'border-fw-secondary'
            }`}
          >
            <div className="flex items-start gap-2">
              <span
                className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                  o.active ? 'bg-fw-successLight text-fw-success' : 'bg-fw-neutral text-fw-bodyLight'
                }`}
              >
                <Network size={14} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-figma-sm font-medium text-fw-heading">{o.name}</div>
                <div className="truncate text-[11px] text-fw-bodyLight">
                  {o.type} · {o.sub}
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              {o.active ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-fw-success bg-fw-successLight px-2 py-0.5 text-[11px] font-medium text-fw-success">
                  <Check size={12} aria-hidden="true" /> Attached
                </span>
              ) : o.planned ? (
                <AttentionTag icon="clock">Planned</AttentionTag>
              ) : (
                <AttentionTag>Available</AttentionTag>
              )}
              <span className="text-[11px] text-fw-bodyLight">
                {o.targets.length} region{o.targets.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {o.targets.map(([cid, rid]) => {
                const t = targetLabel(cc, cid, rid);
                if (!t) return null;
                return (
                  <span
                    key={`${cid}/${rid}`}
                    className="inline-flex items-center gap-1 rounded-full border border-fw-secondary bg-fw-wash px-2 py-0.5 text-[10px] font-medium text-fw-body"
                  >
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: t.cloud.color }} />
                    {t.cloud.name} · {t.region}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
