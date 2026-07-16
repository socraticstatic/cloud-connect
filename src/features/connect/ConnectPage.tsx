import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { PageSection } from '../../components/common/layouts';
import { useCloudControl } from '../../engine/react/useCloudControl';
import { FlowBar } from '../../components/flow/FlowBar';
import { FabricHero } from './FabricHero';
import type { FabricModel, FabricSelection } from './FabricHero';
import { RegionPanel } from './RegionPanel';
import { SitePanel } from './SitePanel';
import { ConnectionsList } from './ConnectionsList';
import { ProvisionWizard } from './ProvisionWizard';

/** Fabric posture panel — the default view (no node selected, or fabric picked):
 * the whole-fabric summary, all derived from the same model. */
function FabricPanel({ model }: { model: FabricModel }) {
  const attached = model.regions.filter(r => r.path === 'private');
  const dual = attached.filter(r => r.reliability === 'dual');
  const publicRegions = model.regions.filter(r => r.path === 'public');
  const stats = [
    { label: 'On the fabric', value: `${attached.length}`, sub: `of ${model.regions.length} regions`, tone: 'text-[#0057b8]' },
    { label: 'Dual / resilient', value: `${dual.length}`, sub: 'diverse paths', tone: 'text-[#00a862]' },
    { label: 'Still public', value: `${publicRegions.length}`, sub: 'on the internet', tone: 'text-[#475569]' },
    { label: 'Cloud-to-cloud', value: `${model.c2c.length}`, sub: `${model.c2c.filter(c => c.controlled).length} on fabric`, tone: 'text-fw-heading' },
  ];
  return (
    <section aria-label="Fabric posture" className="rounded-2xl border border-fw-secondary bg-fw-base p-5 space-y-3">
      <header>
        <div className="font-semibold text-fw-heading">AT&amp;T Fabric</div>
        <div className="text-figma-xs text-fw-bodyLight">One fabric — select any site or region above to manipulate it.</div>
      </header>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-fw-secondary bg-fw-wash p-3">
            <div className="text-figma-xs text-fw-bodyLight">{s.label}</div>
            <div className={`mt-0.5 text-2xl font-semibold tabular-nums ${s.tone}`}>{s.value}</div>
            <div className="text-[11px] text-fw-bodyLight">{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ConnectPage() {
  const model = useCloudControl(cc => cc.fabricModel()) as FabricModel;
  const { search } = useLocation();
  const fromDiscover = new URLSearchParams(search).get('from') === 'discover';

  const [selected, setSelected] = useState<FabricSelection | null>({ kind: 'fabric' });
  const [wizardRegionId, setWizardRegionId] = useState<string | null>(null);
  const [justProvisioned, setJustProvisioned] = useState<string | null>(null);

  const selectedRegion =
    selected?.kind === 'region' ? model.regions.find(r => r.regionId === selected.id) ?? null : null;
  const wizardRegion = wizardRegionId ? model.regions.find(r => r.regionId === wizardRegionId) ?? null : null;

  const handleProvisioned = (regionId: string) => {
    setJustProvisioned(regionId);
    setSelected({ kind: 'region', id: regionId });
    // clear the draw-in flag after the animation window (deterministic single-shot)
    window.setTimeout(() => setJustProvisioned(cur => (cur === regionId ? null : cur)), 900);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 space-y-6">
      <PageSection
        title="Connect"
        description="Your cloud estate as one AT&T fabric — sites, the fabric, and cloud regions you can click and provision. On-ramps (NetBond / Direct Connect / ExpressRoute) ride the edges."
      >
        <FlowBar cta={{ label: 'Govern these paths', to: '/govern' }} />

        {fromDiscover && (
          <div role="status" className="flex items-center gap-2 rounded-lg border border-[#cbd5e1] bg-[#f8fafc] px-3 py-2 text-figma-sm text-[#475569]">
            <Globe size={14} className="shrink-0 text-[#64748b]" aria-hidden="true" />
            Attaching the workloads flagged on Discover — select a region and provision it onto the fabric.
          </div>
        )}

        <FabricHero
          model={model}
          selected={selected}
          onSelect={setSelected}
          justProvisioned={justProvisioned}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {selectedRegion ? (
            <RegionPanel
              region={selectedRegion}
              model={model}
              onProvision={() => setWizardRegionId(selectedRegion.regionId)}
              onProvisioned={handleProvisioned}
            />
          ) : selected?.kind === 'site' ? (
            <SitePanel siteId={selected.id} model={model} />
          ) : (
            <FabricPanel model={model} />
          )}

          <ConnectionsList
            model={model}
            selected={selected}
            onSelect={setSelected}
            onProvisioned={handleProvisioned}
          />
        </div>
      </PageSection>

      {wizardRegion && (
        <ProvisionWizard
          region={wizardRegion}
          model={model}
          onClose={() => setWizardRegionId(null)}
          onProvisioned={handleProvisioned}
        />
      )}
    </div>
  );
}
