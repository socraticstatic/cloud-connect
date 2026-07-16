import { useMemo, useState } from 'react';
import { ChevronRight, Globe } from 'lucide-react';
import { useCloudControl, useCloudControlActions } from '../../engine/react/useCloudControl';
import { useRevealStagger } from './useRevealStagger';
import { FlowBar } from '../../components/flow/FlowBar';
import { AttentionTag } from '../../components/viz/AttentionTag';
import { ProviderLogo } from '../../components/brand/ProviderLogo';
import { VpcMap } from './VpcMap';
import { AttFabricRail } from './AttFabricRail';
import {
  allKeys,
  cloudRegionCount,
  cloudVpcCount,
  cloudKey,
  regionKey,
  vpcKey,
  estateStats,
  openSummary,
  regionsOf,
  vpcsOf,
  tagHex,
  tagLabel,
  toggleKey,
  type Cloud,
  type Region,
  type Vpc,
  type Tag,
} from './discoveryModel';

/* ------------------------------ atoms ------------------------------ */

function StatTiles({ items }: { items: { v: React.ReactNode; l: string }[] }) {
  return (
    <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
      {items.map((it, i) => (
        <div key={i} className="min-w-[54px] rounded-lg border border-fw-secondary bg-fw-wash px-2.5 py-1 text-center">
          <div className="text-figma-sm font-semibold leading-tight text-fw-heading tabular-nums">{it.v}</div>
          <div className="whitespace-nowrap text-[10px] uppercase tracking-wide text-fw-bodyLight">{it.l}</div>
        </div>
      ))}
    </div>
  );
}

function Badge({ attached }: { attached: boolean }) {
  return attached ? (
    <span className="inline-flex items-center rounded-full border border-fw-success bg-fw-successLight px-2 py-0.5 text-[11px] font-medium text-fw-success">
      Private
    </span>
  ) : (
    <AttentionTag icon="globe">Public</AttentionTag>
  );
}

const AiFlag = () => (
  <span className="rounded-full border border-fw-primary/30 bg-fw-accent px-1.5 py-px text-[10px] font-medium text-fw-primary">
    GPU / AI
  </span>
);

const Chevron = ({ open }: { open: boolean }) => (
  <ChevronRight
    size={16}
    className={`shrink-0 text-fw-bodyLight transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
    aria-hidden="true"
  />
);

/* ------------------------------ view ------------------------------ */

export function UnifiedDiscovery() {
  const cc = useCloudControlActions();
  // Subscribe the whole tree to engine mutations (attach / fix / sim) so
  // badges, stat tiles and map violations re-render when posture changes.
  useCloudControl(() => 0);

  const clouds = cc.clouds as Cloud[];
  const tags = cc.TAGS as Record<string, Tag>;
  const stats = estateStats(cc);
  const publicWorkloads = clouds.filter(c => !c.attached).reduce((s, c) => s + c.workloads, 0);

  const [open, setOpen] = useState<ReadonlySet<string>>(new Set(['aws']));
  const toggle = (key: string) => setOpen(o => toggleKey(o, key));

  // Fabric ↔ estate association: hovering an on-ramp lights up the clouds/regions
  // it reaches; hovering a region (or cloud) lights up the on-ramps that serve it.
  const onramps = cc.onramps as { id: string; targets: [string, string][] }[];
  const [hover, setHover] = useState<{ k: 'onramp' | 'region' | 'cloud'; id: string } | null>(null);
  const hl = useMemo(() => {
    const on = new Set<string>();
    const reg = new Set<string>();
    const cl = new Set<string>();
    if (hover) {
      if (hover.k === 'onramp') {
        on.add(hover.id);
        onramps.find(o => o.id === hover.id)?.targets.forEach(([c, r]) => { reg.add(`${c}/${r}`); cl.add(c); });
      } else if (hover.k === 'region') {
        reg.add(hover.id);
        cl.add(hover.id.split('/')[0]);
        onramps.forEach(o => { if (o.targets.some(([c, r]) => `${c}/${r}` === hover.id)) on.add(o.id); });
      } else {
        cl.add(hover.id);
        onramps.forEach(o => o.targets.forEach(([c, r]) => { if (c === hover.id) { on.add(o.id); reg.add(`${c}/${r}`); } }));
      }
    }
    return { on, reg, cl };
  }, [hover, onramps]);
  const linkCls = (active: boolean, base: string) =>
    active ? 'border-[#0057b8] ring-1 ring-[#0057b8]/50' : base;

  // Reveal stagger runs on the top-level cloud rows (+1 slot for the finding strip).
  const stagger = useRevealStagger(clouds.length + 1);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-figma-2xl font-semibold text-fw-heading">Discover</h1>
        <p className="text-figma-sm text-fw-bodyLight">
          Your full estate — every cloud, region, VPC and subnet, with the AT&amp;T fabric that attaches them.
        </p>
      </div>

      <FlowBar
        cta={
          publicWorkloads > 0
            ? { label: `Attach ${publicWorkloads} public workloads`, to: '/connect?from=discover' }
            : undefined
        }
      />

      {/* Estate header */}
      <div data-tour="discover-estate" className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {stats.map(s => (
          <div key={s.key} className="rounded-xl border border-fw-secondary bg-fw-base px-3 py-2.5">
            <div className="text-figma-lg font-semibold text-fw-heading tabular-nums">{s.value}</div>
            <div className="text-[11px] uppercase tracking-wide text-fw-bodyLight">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <AttFabricRail
          cc={cc}
          highlighted={hl.on}
          onHover={id => setHover(id ? { k: 'onramp', id } : null)}
        />

        <div className="space-y-3">
          {/* Tree controls */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wide text-fw-bodyLight">{openSummary(open)}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setOpen(new Set(allKeys(cc)))}
                className="h-7 rounded-full border border-fw-secondary bg-fw-base px-3 text-figma-xs font-medium text-fw-body transition-colors hover:bg-fw-wash"
              >
                Expand all
              </button>
              <button
                type="button"
                onClick={() => setOpen(new Set())}
                className="h-7 rounded-full border border-fw-secondary bg-fw-base px-3 text-figma-xs font-medium text-fw-body transition-colors hover:bg-fw-wash"
              >
                Collapse all
              </button>
            </div>
          </div>

          {/* Cloud tree */}
          <div className="space-y-2.5">
            {clouds.map((c, i) => {
              const ck = cloudKey(c.id);
              const cOpen = open.has(ck);
              return (
                <div
                  key={c.id}
                  style={stagger(i)}
                  className={`rounded-2xl border bg-fw-base transition-all ${linkCls(hl.cl.has(c.id), 'border-fw-secondary')}`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(ck)}
                    onMouseEnter={() => setHover({ k: 'cloud', id: c.id })}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover({ k: 'cloud', id: c.id })}
                    onBlur={() => setHover(null)}
                    aria-expanded={cOpen}
                    aria-label={c.name}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-fw-wash/60"
                  >
                    <Chevron open={cOpen} />
                    <ProviderLogo id={c.id} size={30} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-fw-heading">{c.name}</span>
                        {c.ai && <AiFlag />}
                      </div>
                      <div className="text-figma-xs text-fw-bodyLight">
                        {cloudRegionCount(cc, c.id)} regions · {cloudVpcCount(cc, c.id)} VPC/VNet · {c.workloads} workloads
                      </div>
                    </div>
                    <StatTiles
                      items={[
                        { v: cloudRegionCount(cc, c.id), l: 'Regions' },
                        { v: cloudVpcCount(cc, c.id), l: 'VPC/VNet' },
                        { v: c.workloads, l: 'Workloads' },
                      ]}
                    />
                    <Badge attached={c.attached} />
                  </button>

                  {cOpen && (
                    <div className="space-y-2 border-t border-fw-secondary py-2 pl-4 pr-2 sm:pl-6">
                      {regionsOf(cc, c.id).length === 0 && (
                        <div className="px-3 py-2 text-[11px] text-fw-bodyLight">No regions discovered in this cloud yet.</div>
                      )}
                      {regionsOf(cc, c.id).map((r: Region) => {
                        const rk = regionKey(c.id, r.id);
                        const rOpen = open.has(rk);
                        return (
                          <div
                            key={r.id}
                            className={`rounded-xl border bg-fw-wash/40 transition-all ${linkCls(hl.reg.has(rk), 'border-fw-secondary')}`}
                          >
                            <button
                              type="button"
                              onClick={() => toggle(rk)}
                              onMouseEnter={() => setHover({ k: 'region', id: rk })}
                              onMouseLeave={() => setHover(null)}
                              onFocus={() => setHover({ k: 'region', id: rk })}
                              onBlur={() => setHover(null)}
                              aria-expanded={rOpen}
                              aria-label={r.name}
                              className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-fw-wash"
                            >
                              <Chevron open={rOpen} />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-figma-sm font-medium text-fw-heading">{r.name}</span>
                                  {r.ai && <AiFlag />}
                                </div>
                                <div className="text-[11px] text-fw-bodyLight">{r.sub}</div>
                              </div>
                              <StatTiles
                                items={[
                                  { v: vpcsOf(cc, r.id).length, l: 'VPC/VNet' },
                                  { v: r.subnets, l: 'Subnets' },
                                  { v: `${r.lat}ms`, l: 'Latency' },
                                ]}
                              />
                              <Badge attached={r.attached} />
                            </button>

                            {rOpen && (
                              <div className="space-y-2 border-t border-fw-secondary px-2 py-2 sm:px-3">
                                {vpcsOf(cc, r.id).length === 0 && (
                                  <div className="px-3 py-2 text-[11px] text-fw-bodyLight">No VPCs or VNets in this region yet.</div>
                                )}
                                {vpcsOf(cc, r.id).map((v: Vpc) => {
                                  const vk = vpcKey(c.id, r.id, v.id);
                                  const vOpen = open.has(vk);
                                  return (
                                    <div key={v.id} className="rounded-xl border border-fw-secondary bg-fw-base">
                                      <button
                                        type="button"
                                        onClick={() => toggle(vk)}
                                        aria-expanded={vOpen}
                                        aria-label={v.name}
                                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-fw-wash/60"
                                      >
                                        <Chevron open={vOpen} />
                                        <span className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-fw-secondary bg-fw-wash px-1.5 text-[10px] font-bold text-fw-body">
                                          {v.vnet ? 'VN' : 'VPC'}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-figma-sm font-medium text-fw-heading">{v.name}</span>
                                            {v.ai && <AiFlag />}
                                          </div>
                                          <div className="text-[11px] text-fw-bodyLight">
                                            {v.role} · <span className="font-mono">{v.cidr}</span>
                                          </div>
                                          {v.tags && v.tags.length > 0 && (
                                            <div className="mt-1 flex flex-wrap gap-1">
                                              {v.tags.map(t => {
                                                const hex = tagHex(t, tags);
                                                return (
                                                  <span
                                                    key={t}
                                                    className="inline-flex items-center rounded-full border px-1.5 py-px text-[10px] font-medium"
                                                    style={{ color: hex, borderColor: `${hex}40`, background: `${hex}14` }}
                                                  >
                                                    {tagLabel(t, tags)}
                                                  </span>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                        <StatTiles
                                          items={[
                                            { v: v.azs, l: 'AZs' },
                                            { v: v.subnets, l: 'Subnets' },
                                          ]}
                                        />
                                        <Badge attached={v.attached} />
                                      </button>

                                      {vOpen && (
                                        <div className="px-3 pb-3">
                                          <VpcMap
                                            vpc={v}
                                            cloud={{ id: c.id, name: c.name, color: c.color }}
                                            region={{ id: r.id, name: r.name, sub: r.sub }}
                                            tags={tags}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {publicWorkloads > 0 && (
            <div
              role="alert"
              style={stagger(clouds.length)}
              className="flex items-center gap-2 rounded-2xl border border-l-2 border-[#cbd5e1] border-l-[#94a3b8] bg-[#f8fafc] px-4 py-3 text-figma-sm font-medium text-[#475569]"
            >
              <Globe size={15} className="shrink-0 text-[#64748b]" aria-hidden="true" />
              {publicWorkloads} workload{publicWorkloads === 1 ? '' : 's'} reachable over the public internet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
