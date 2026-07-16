import { Gauge, ShieldCheck, Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProviderLogo } from '../../components/brand/ProviderLogo';
import { useCloudControlActions } from '../../engine/react/useCloudControl';
import { ATTACH_TYPES } from './attachCatalog';
import type { FabricModel } from './FabricHero';
import type { FabricRegion } from '../../engine/types';

/* ------------------------------------------------------------------ *
 * Region panel — the selected region as a first-class object. Foregrounds
 * ONLY the three focuses (reliability / performance / private-public) and
 * hosts attach types as a per-region function (folded off the old top-level
 * AttachTypes block). A Provision button opens the wizard.
 * ------------------------------------------------------------------ */

function ReliabilityPill({ reliability }: { reliability: FabricRegion['reliability'] }) {
  const map = {
    dual: { t: 'Dual · resilient', cls: 'bg-fw-successLight text-fw-success' },
    single: { t: 'Single path', cls: 'bg-[#0057b8]/[0.08] text-[#0057b8]' },
    none: { t: 'Not attached', cls: 'bg-fw-neutral text-fw-bodyLight' },
  } as const;
  const m = map[reliability];
  return <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-figma-xs font-medium ${m.cls}`}>{m.t}</span>;
}

/** The attach type the region's on-ramp implies (badged "on this region"). */
function activeAttachId(region: FabricRegion, model: FabricModel): string {
  const type = model.onramps.find(o => region.onrampIds.includes(o.id) && o.active)?.type ?? '';
  if (/direct connect|expressroute|interconnect/i.test(type)) return 'dedicated';
  if (/netbond/i.test(type)) return 'ip';
  return '';
}

interface RegionPanelProps {
  region: FabricRegion;
  model: FabricModel;
  onProvision: () => void;
  onProvisioned: (regionId: string) => void;
}

export function RegionPanel({ region, model, onProvision, onProvisioned }: RegionPanelProps) {
  const actions = useCloudControlActions();
  const activeAttach = activeAttachId(region, model);

  const makeDual = () => {
    actions.provisionRegion(region.regionId, { resilient: true });
    onProvisioned(region.regionId);
  };

  return (
    <section aria-label={`${region.cloudName} ${region.name}`} className="rounded-2xl border border-fw-secondary bg-fw-base p-5 space-y-4">
      <header className="flex items-center gap-3">
        <ProviderLogo id={region.cloudId} size={34} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-fw-heading leading-tight">{region.name}</div>
          <div className="text-figma-xs text-fw-bodyLight leading-tight">{region.cloudName}</div>
        </div>
        <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-figma-xs font-medium ${
          region.path === 'private' ? 'bg-[#0057b8]/[0.08] text-[#0057b8]' : 'bg-fw-neutral text-fw-bodyLight'
        }`}>{region.path === 'private' ? 'Private' : 'Public'}</span>
      </header>

      {/* the three focuses */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-fw-secondary bg-fw-wash p-3">
          <div className="flex items-center gap-1.5 text-figma-xs text-fw-bodyLight"><ShieldCheck size={13} /> Reliability</div>
          <div className="mt-1.5 flex items-center gap-2">
            <ReliabilityPill reliability={region.reliability} />
          </div>
          {region.reliability !== 'dual' && region.path === 'private' && (
            <button type="button" onClick={makeDual}
              className="mt-2 text-figma-xs font-medium text-[#0057b8] hover:underline">Make dual →</button>
          )}
        </div>
        <div className="rounded-xl border border-fw-secondary bg-fw-wash p-3">
          <div className="flex items-center gap-1.5 text-figma-xs text-fw-bodyLight"><Gauge size={13} /> Performance</div>
          <div className="mt-1.5 text-figma-lg font-semibold text-fw-heading tabular-nums">{region.latencyMs}<span className="text-figma-sm font-normal text-fw-bodyLight">ms</span></div>
          <Link to="/observe" className="mt-1 inline-flex items-center gap-0.5 text-figma-xs font-medium text-[#0057b8] hover:underline">View in Observe <ArrowRight size={12} /></Link>
        </div>
        <div className="rounded-xl border border-fw-secondary bg-fw-wash p-3">
          <div className="flex items-center gap-1.5 text-figma-xs text-fw-bodyLight"><Layers size={13} /> Reach</div>
          <div className="mt-1.5 text-figma-sm text-fw-body">
            {region.path === 'private'
              ? `On the fabric via ${region.onrampIds.map(id => model.onramps.find(o => o.id === id)?.name?.split(' · ')[0]).filter(Boolean).join(', ') || 'AT&T'}`
              : 'On the public internet — not yet attached'}
          </div>
        </div>
      </div>

      {/* attach types — region-scoped (folded from the old top-level block) */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <h3 className="text-figma-sm font-semibold text-fw-heading">Attach type</h3>
          <span className="text-figma-xs text-fw-bodyLight">how {region.name} rides the fabric</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ATTACH_TYPES.map(t => {
            const isActive = activeAttach === t.id;
            return (
              <div key={t.id} className={`rounded-lg border p-2.5 ${isActive ? 'border-[#0057b8] bg-[#0057b8]/[0.04]' : 'border-fw-secondary bg-fw-base'}`}>
                <div className="flex items-center gap-1.5">
                  <span className={`text-figma-sm font-medium ${isActive ? 'text-[#0057b8]' : 'text-fw-heading'}`}>{t.label}</span>
                  {isActive && <span className="ml-auto inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-fw-successLight text-fw-success shrink-0">On this region</span>}
                </div>
                <div className="mt-1 text-[11px] text-fw-bodyLight">{t.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button" data-testid="open-provision-wizard" onClick={onProvision}
        className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-lg text-figma-sm font-semibold bg-[#0057b8] text-white hover:bg-[#00478f] transition-colors"
      >
        {region.path === 'private' ? 'Reprovision connectivity' : 'Provision connectivity'} <ArrowRight size={15} />
      </button>
    </section>
  );
}
