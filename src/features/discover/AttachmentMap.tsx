import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useCloudControl } from '../../engine/react/useCloudControl';
import { ProviderLogo } from '../../components/brand/ProviderLogo';
import { buildAttachmentMapModel } from './attachmentModel';
import { computeAttachmentLayout, NODE_H, SITE_W, WL_W } from './attachmentLayout';
import { ChainDrawer, type MapSelection } from './ChainDrawer';
import { DeployManagedVpcWizard } from '../connect/DeployManagedVpcWizard';

/**
 * The Attachment Map — the second lens on Discover. Four bands: sites →
 * AT&T fabric → regions → workloads, FabricHero idiom throughout: fixed
 * deterministic coordinates, every node a real <button> in a foreignObject,
 * cobalt solid = private path, slate dashed = public. Selection is local to
 * the map (the tree's selection set is a different act and stays untouched).
 */

const HEX = {
  cobalt: '#0057b8',
  slate: '#94a3b8',
  band: '#eef4fb',
  bandStroke: '#c7ddf5',
  line: '#dcdfe3',
} as const;

export function AttachmentMap() {
  const cc = useCloudControl(c => c);
  const model = buildAttachmentMapModel(cc);
  const layout = computeAttachmentLayout(model);
  const [sel, setSel] = useState<MapSelection | null>(null);
  const [deploy, setDeploy] = useState<{ cloudId: string; regionId: string } | null>(null);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start" data-testid="attachment-map">
      <div className="min-w-0 flex-1 rounded-2xl border border-fw-secondary bg-fw-base p-3">
        <svg
          viewBox={`0 0 ${layout.viewW} ${layout.viewH}`}
          width="100%"
          role="group"
          aria-label="Attachment map: workloads and their paths to the AT&T network"
        >
          {/* fabric band */}
          <rect
            x={layout.fabric.x} y={layout.fabric.y} width={layout.fabric.w} height={layout.fabric.h}
            rx={14} fill={HEX.band} stroke={HEX.bandStroke}
          />
          <text
            x={layout.fabric.x + layout.fabric.w / 2} y={layout.fabric.y + 18}
            textAnchor="middle" fontSize={11} fontWeight={600} fill="#1d2329"
          >
            AT&amp;T fabric
          </text>

          {/* site edges + nodes */}
          {layout.sites.map(s => (
            <g key={s.id}>
              <line x1={s.edge.from.x} y1={s.edge.from.y} x2={s.edge.to.x} y2={s.edge.to.y} stroke={HEX.line} strokeWidth={1.5} />
              <foreignObject x={s.x} y={s.y - NODE_H / 2} width={SITE_W} height={NODE_H}>
                <button
                  type="button"
                  className="h-full w-full truncate rounded-lg border border-fw-secondary bg-fw-base px-2 text-left text-[11px] font-medium text-fw-heading transition-colors hover:bg-fw-wash"
                  onClick={() => {
                    const branch = model.sites.find(b => b.id === s.id);
                    if (branch?.onrampId) setSel({ kind: 'onramp', onrampId: branch.onrampId });
                  }}
                >
                  {s.name}
                  <span className="block text-[10px] font-normal text-fw-bodyLight">{s.city}</span>
                </button>
              </foreignObject>
            </g>
          ))}

          {/* workload edges (under nodes) */}
          {layout.workloads.map(w => (
            <g key={`e-${w.wl.vpc.id}`}>
              <path
                data-edge={w.attached ? 'private' : 'public'}
                d={`M ${w.edge.from.x} ${w.edge.from.y} L ${w.edge.to.x} ${w.edge.to.y}`}
                fill="none"
                stroke={w.attached ? HEX.cobalt : HEX.slate}
                strokeWidth={w.attached ? 2 : 1.5}
                strokeDasharray={w.edge.dashed ? '5 4' : undefined}
              />
              {w.edge.viaShort && (
                <text
                  x={(w.edge.from.x + w.edge.to.x) / 2}
                  y={(w.edge.from.y + w.edge.to.y) / 2 - 5}
                  textAnchor="middle" fontSize={10} fill={HEX.cobalt} fontWeight={600}
                >
                  {w.edge.viaShort}
                </text>
              )}
            </g>
          ))}

          {/* region labels */}
          {layout.workloads.filter(w => w.regionLabel).map(w => {
            const hasManaged = !!model.groups
              .find(g => g.cloudId === w.wl.cloudId)?.regions
              .find(r => r.region.id === w.wl.regionId)?.managedVpc;
            return (
              <text
                key={`r-${w.wl.regionId}`}
                x={w.regionLabel!.x} y={w.regionLabel!.y - NODE_H / 2 - 4}
                fontSize={10} fontWeight={600} fill="#475569"
                style={{ textTransform: 'uppercase' }}
              >
                {hasManaged && <title>{'AT&T managed gateway · vSRX HA pair live'}</title>}
                {`${w.regionLabel!.cloudName} · ${w.regionLabel!.regionName}`}
                {hasManaged && (
                  <tspan fill="#0057b8" fontWeight={700}> · vSRX</tspan>
                )}
              </text>
            );
          })}

          {/* workload nodes */}
          {layout.workloads.map(w => (
            <foreignObject key={w.wl.vpc.id} x={w.x} y={w.y - NODE_H / 2} width={WL_W} height={NODE_H}>
              <button
                type="button"
                aria-pressed={sel?.kind === 'workload' && sel.vpcId === w.wl.vpc.id}
                className={`flex h-full w-full items-center gap-2 rounded-lg border px-2 text-left transition-colors ${
                  sel?.kind === 'workload' && sel.vpcId === w.wl.vpc.id
                    ? 'border-fw-ctaPrimary bg-fw-accent'
                    : 'border-fw-secondary bg-fw-base hover:bg-fw-wash'
                }`}
                onClick={() => setSel({ kind: 'workload', cloudId: w.wl.cloudId, regionId: w.wl.regionId, vpcId: w.wl.vpc.id })}
              >
                <ProviderLogo id={w.wl.cloudId} size={16} />
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-medium text-fw-heading">{w.wl.vpc.name}</span>
                  <span className="block font-mono text-[10px] text-fw-bodyLight">{w.wl.vpc.cidr}</span>
                </span>
                {w.ai && (
                  <span className="ml-auto shrink-0 rounded-full border border-fw-primary/30 bg-fw-accent px-1.5 py-px text-[9px] font-medium text-fw-primary">
                    AI
                  </span>
                )}
              </button>
            </foreignObject>
          ))}

          {/* internet node */}
          <foreignObject x={layout.internet.x - 70} y={layout.internet.y - 16} width={140} height={32}>
            <div className="flex h-full items-center justify-center gap-1.5 rounded-full border border-fw-secondary bg-fw-wash text-[11px] font-medium text-fw-bodyLight">
              <Globe size={12} aria-hidden="true" /> Public internet
            </div>
          </foreignObject>
        </svg>

        {/* legend */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-fw-secondary pt-2 text-[11px] text-fw-bodyLight">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-5 rounded" style={{ background: HEX.cobalt }} /> private · on the fabric
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0 w-5 border-t-2 border-dashed" style={{ borderColor: HEX.slate }} /> public internet
          </span>
        </div>
      </div>

      {sel && (
        <ChainDrawer
          selection={sel}
          onClose={() => setSel(null)}
          onDeployManagedVpc={(cloudId, regionId) => setDeploy({ cloudId, regionId })}
        />
      )}

      {deploy && <DeployManagedVpcWizard lockedRegion={deploy} onClose={() => setDeploy(null)} />}
    </div>
  );
}
