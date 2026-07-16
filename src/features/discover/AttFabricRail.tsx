import { Network, Check, MapPin } from 'lucide-react';
import { AttentionTag } from '../../components/viz/AttentionTag';
import { regionsOf, type Cloud } from './discoveryModel';
import { fabricLatency } from './latency';
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
  site?: { name: string; lat: number; lon: number };
  targets: [string, string][];
}

// The PoP city is the tail of the site name ("Equinix IAD · Ashburn" -> "Ashburn").
function popCity(site?: Onramp['site']): string | null {
  if (!site?.name) return null;
  const parts = site.name.split('·');
  return parts[parts.length - 1].trim();
}

function targetLabel(
  cc: CloudControl,
  cloudId: string,
  regionId: string,
): { cloud: Cloud; region: string; lat: number; geo?: readonly [number, number] } | null {
  const cloud = (cc.clouds as Cloud[]).find(c => c.id === cloudId);
  const region = regionsOf(cc, cloudId).find(r => r.id === regionId);
  if (!cloud || !region) return null;
  return { cloud, region: region.name, lat: region.lat, geo: region.geo };
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
                {popCity(o.site) && (
                  <div className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-medium text-fw-body">
                    <MapPin size={11} className="shrink-0 text-fw-bodyLight" aria-hidden="true" />
                    From {popCity(o.site)}
                  </div>
                )}
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

            {/* Reach as from → to · latency: the PoP above is the "from", each
                row is a region it serves and the round-trip latency to it. */}
            <div className="mt-2 space-y-1">
              {o.targets.map(([cid, rid]) => {
                const t = targetLabel(cc, cid, rid);
                if (!t) return null;
                const lat =
                  o.site && t.geo
                    ? fabricLatency(`${o.id}:${cid}/${rid}`, [o.site.lat, o.site.lon], t.geo)
                    : { ms: t.lat, source: 'estimated' as const };
                const probed = lat.source === 'probed';
                return (
                  <div
                    key={`${cid}/${rid}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-fw-secondary bg-fw-wash px-2 py-1 text-[10px] font-medium text-fw-body"
                  >
                    <span className="flex min-w-0 items-center gap-1 truncate">
                      <span className="text-fw-bodyLight" aria-hidden="true">→</span>
                      <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: t.cloud.color }} />
                      <span className="truncate">{t.cloud.name} · {t.region}</span>
                    </span>
                    <span
                      className="flex shrink-0 items-center gap-1 tabular-nums text-fw-heading"
                      title={`Round-trip, ${popCity(o.site) ?? 'on-ramp'} → ${t.region} · ${
                        probed ? 'measured (vRouter probe)' : 'estimated (air-miles × 1.4 fiber factor)'
                      }`}
                    >
                      {lat.ms}ms
                      <span className={`text-[8px] font-semibold uppercase tracking-wide ${probed ? 'text-fw-success' : 'text-fw-bodyLight'}`}>
                        {probed ? 'probed' : 'est'}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
