import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProviderLogo } from '../../components/brand/ProviderLogo';
import type { FabricRegion } from '../../engine/types';

/* ------------------------------------------------------------------ *
 * Cloud Fabric hero — the manipulable centerpiece of Connect.
 *
 * Three columns read as ONE fabric:
 *   Sites (left, first-mile labeled)
 *     → the unified "AT&T Fabric" band (center; on-ramps NetBond/DX/ER
 *       are thin labeled EDGES into it, never blocks — this is the point)
 *     → Cloud Regions (right, grouped by cloud) + an internet/SaaS egress node.
 *
 * Edges encode the three focuses Connect foregrounds:
 *   reliability  — single vs double line
 *   private/public — cobalt solid (on the fabric) vs slate dashed (public)
 *   performance  — hover reveals latency + a jump into Observe
 *
 * cloud↔cloud is first-class: c2c flows render as region↔region arcs
 * (cobalt when controlled, slate dashed when it rides public peering).
 *
 * Layout is fully deterministic (fixed coordinates, no clocks/RNG) and
 * every node is a real <button> (foreignObject) so the diagram is keyboard-
 * accessible. Motion (the provisioned-edge draw-in) respects reduced-motion.
 * ------------------------------------------------------------------ */

export type FabricSelection =
  | { kind: 'site'; id: string }
  | { kind: 'region'; id: string }
  | { kind: 'fabric' }
  | { kind: 'internet' };

export interface FabricModel {
  sites: { id: string; label: string; firstMile: string | null }[];
  onramps: { id: string; name: string; type: string; site: string; active: boolean; targets: [string, string][] }[];
  regions: FabricRegion[];
  c2c: { id: string; label: string; gbps: number; viaPublic: boolean; controlled: boolean }[];
}

/* Flywheel hex applied as literal SVG attributes (the tailwind config only
 * extends text/bg/border with fw-*, so fill/stroke fw- classes compile to
 * nothing). Cobalt = private/on-fabric, green = dual/resilient, slate =
 * public. No amber anywhere. */
const HEX = {
  cobalt: '#0057b8',
  cobaltSoft: '#7aa6d6',
  green: '#00a862',
  slate: '#94a3b8',
  slateInk: '#475569',
  ink: '#1d2329',
  wash: '#f8fafb',
  line: '#dcdfe3',
  band: '#eef4fb',
  bandStroke: '#c7ddf5',
} as const;

const VIEW_W = 1000;
const ROW_H = 52;
const TOP_PAD = 40;

const SITE_X = 40;
const SITE_W = 156;
const NODE_H = 44;

const FABRIC_X = 404;
const FABRIC_W = 92;
const FABRIC_RIGHT = FABRIC_X + FABRIC_W;

const REGION_X = 596;
const REGION_W = 320;
const REGION_RIGHT = REGION_X + REGION_W;

/** short product label for an on-ramp type — the edge detail, not a block. */
export function onrampShort(type: string): string {
  if (/direct connect/i.test(type)) return 'DX';
  if (/expressroute/i.test(type)) return 'ER';
  if (/interconnect/i.test(type)) return 'IX';
  if (/netbond/i.test(type)) return 'NetBond';
  return type;
}

/** which two region ids a cloud-to-cloud flow connects (by cloud keyword). */
function c2cEndpoints(label: string, regions: FabricRegion[]): [string, string] | null {
  const detect = (side: string): string | null => {
    const byName = regions.find(r => side.includes(r.name));
    if (byName) return byName.regionId;
    const cloud =
      /coreweave/i.test(side) ? 'cw' :
      /nebius/i.test(side) ? 'neb' :
      /google/i.test(side) ? 'gcp' :
      /azure/i.test(side) ? 'azure' :
      /oracle/i.test(side) ? 'oci' :
      /aws/i.test(side) ? 'aws' : null;
    if (!cloud) return null;
    const r = regions.find(x => x.cloudId === cloud);
    return r ? r.regionId : null;
  };
  const [a, b] = label.split('↔');
  if (!a || !b) return null;
  const ra = detect(a), rb = detect(b);
  return ra && rb ? [ra, rb] : null;
}

interface Pt { x: number; y: number }

export interface FabricLayout {
  viewW: number;
  viewH: number;
  fabric: { x: number; y: number; w: number; h: number; cx: number; cy: number };
  sites: { id: string; label: string; firstMile: string | null; x: number; y: number }[];
  regions: {
    region: FabricRegion; x: number; y: number;
    edge: { from: Pt; to: Pt; onrampLabel: string; mid: Pt };
  }[];
  internet: { x: number; y: number; edge: { from: Pt; to: Pt } };
  arcs: { id: string; label: string; controlled: boolean; a: Pt; b: Pt; ctrl: Pt; regionIds: [string, string] }[];
}

/** Pure, deterministic layout — identical model in ⇒ identical geometry out. */
export function computeFabricLayout(model: FabricModel): FabricLayout {
  const rightCount = model.regions.length + 1; // regions + internet node
  const viewH = TOP_PAD * 2 + (rightCount - 1) * ROW_H;
  const bandTop = 28;
  const bandBottom = viewH - 28;
  const clampBand = (y: number) => Math.min(bandBottom - 10, Math.max(bandTop + 10, y));

  const fabric = { x: FABRIC_X, y: bandTop, w: FABRIC_W, h: bandBottom - bandTop, cx: FABRIC_X + FABRIC_W / 2, cy: viewH / 2 };

  // Sites: vertically centered stack.
  const siteGap = 92;
  const siteSpan = (model.sites.length - 1) * siteGap;
  const siteStart = viewH / 2 - siteSpan / 2;
  const sites = model.sites.map((s, i) => ({
    id: s.id, label: s.label, firstMile: s.firstMile,
    x: SITE_X, y: siteStart + i * siteGap,
  }));

  const byId = new Map(model.regions.map(r => [r.regionId, r] as const));
  const rowY = (i: number) => TOP_PAD + i * ROW_H;

  const regions = model.regions.map((region, i) => {
    const y = rowY(i);
    const onrampLabel = region.onrampIds
      .map(id => onrampShort(model.onramps.find(o => o.id === id)?.type ?? ''))
      .filter((v, idx, a) => v && a.indexOf(v) === idx)
      .join(' + ');
    const from: Pt = { x: FABRIC_RIGHT, y: clampBand(y) };
    const to: Pt = { x: REGION_X, y };
    const mid: Pt = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 - 7 };
    return { region, x: REGION_X, y, edge: { from, to, onrampLabel, mid } };
  });

  const internetY = rowY(model.regions.length);
  const internet = {
    x: REGION_X, y: internetY,
    edge: { from: { x: FABRIC_RIGHT, y: clampBand(internetY) }, to: { x: REGION_X, y: internetY } },
  };

  // c2c arcs — region↔region, bowing right past the region column.
  const yOf = (rid: string) => {
    const idx = model.regions.findIndex(r => r.regionId === rid);
    return idx >= 0 ? rowY(idx) : viewH / 2;
  };
  const arcs = model.c2c.map(f => {
    const ends = c2cEndpoints(f.label, model.regions);
    if (!ends || !byId.has(ends[0]) || !byId.has(ends[1])) return null;
    const ya = yOf(ends[0]);
    const yb = yOf(ends[1]);
    const a: Pt = { x: REGION_RIGHT - 6, y: ya };
    const b: Pt = { x: REGION_RIGHT - 6, y: yb };
    const ctrl: Pt = { x: REGION_RIGHT + 66, y: (ya + yb) / 2 };
    return { id: f.id, label: f.label, controlled: f.controlled, a, b, ctrl, regionIds: ends };
  }).filter(Boolean) as FabricLayout['arcs'];

  return { viewW: VIEW_W, viewH, fabric, sites, regions, internet, arcs };
}

/* ----- edge stroke encoding: private vs public, single vs double ----- */
function edgeStroke(path: 'private' | 'public'): { color: string; dash?: string } {
  return path === 'private'
    ? { color: HEX.cobalt }
    : { color: HEX.slate, dash: '5 5' };
}

function ReliabilityDot({ reliability }: { reliability: FabricRegion['reliability'] }) {
  const map = {
    dual: { c: HEX.green, t: 'Dual · resilient' },
    single: { c: HEX.cobalt, t: 'Single path' },
    none: { c: HEX.slate, t: 'Not attached' },
  } as const;
  const m = map[reliability];
  return (
    <span title={m.t} className="inline-flex items-center gap-1 shrink-0">
      <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ background: m.c }} />
      {reliability === 'dual' && <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ background: m.c }} />}
    </span>
  );
}

interface FabricHeroProps {
  model: FabricModel;
  selected?: FabricSelection | null;
  onSelect?: (sel: FabricSelection) => void;
  justProvisioned?: string | null;
}

export function FabricHero({ model, selected = null, onSelect, justProvisioned = null }: FabricHeroProps) {
  const layout = useMemo(() => computeFabricLayout(model), [model]);
  const [hover, setHover] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number; region: FabricRegion } | null>(null);

  const selId =
    selected?.kind === 'region' ? selected.id :
    selected?.kind === 'site' ? selected.id :
    selected?.kind === 'internet' ? 'e-net' :
    selected?.kind === 'fabric' ? '__fabric__' : null;

  // A node is "lit" when it is the hover target, the selection, or (for the
  // fabric) whenever the whole fabric is the focus.
  const focusId = hover ?? selId;
  const fabricFocus = focusId === '__fabric__';

  const siteEdgeLit = (siteId: string) => fabricFocus || focusId === siteId;
  const regionEdgeLit = (rid: string) => fabricFocus || focusId === rid;
  const arcLit = (ids: [string, string]) => ids.includes(focusId ?? '');

  const select = (sel: FabricSelection) => onSelect?.(sel);

  return (
    <div
      data-tour="connect-onramp"
      data-testid="fabric-hero"
      className="rounded-2xl border border-fw-secondary bg-fw-base overflow-x-auto"
    >
      <svg
        viewBox={`0 0 ${layout.viewW} ${layout.viewH}`}
        width="100%"
        role="group"
        aria-label="Cloud fabric: sites to the AT&T fabric to cloud regions"
        className="min-w-[720px]"
      >
        {/* ---- the unified AT&T Fabric band (a single shape, clickable) ---- */}
        <g>
          <rect
            x={layout.fabric.x} y={layout.fabric.y} width={layout.fabric.w} height={layout.fabric.h}
            rx={18} fill={HEX.band} stroke={fabricFocus ? HEX.cobalt : HEX.bandStroke}
            strokeWidth={fabricFocus ? 2.5 : 1.5}
          />
        </g>

        {/* ---- site → fabric edges (first-mile onto the private fabric) ---- */}
        <g data-edges-site>
          {layout.sites.map(s => {
            const from = { x: s.x + SITE_W, y: s.y };
            const to = { x: layout.fabric.x, y: Math.min(layout.fabric.y + layout.fabric.h - 10, Math.max(layout.fabric.y + 10, s.y)) };
            const lit = siteEdgeLit(s.id);
            return (
              <path
                key={`se-${s.id}`} data-fabric-edge data-kind="site"
                d={`M ${from.x} ${from.y} C ${from.x + 60} ${from.y}, ${to.x - 60} ${to.y}, ${to.x} ${to.y}`}
                fill="none" stroke={HEX.cobaltSoft} strokeWidth={lit ? 2.5 : 1.5}
                strokeOpacity={focusId && !lit ? 0.35 : 0.9} strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* ---- fabric → region edges (on-ramp is the labeled edge detail) ---- */}
        <g data-edges-region>
          {layout.regions.map(({ region, edge }) => {
            const { color, dash } = edgeStroke(region.path);
            const lit = regionEdgeLit(region.regionId);
            const dual = region.reliability === 'dual';
            const provisioned = justProvisioned === region.regionId;
            const d = `M ${edge.from.x} ${edge.from.y} C ${edge.from.x + 60} ${edge.from.y}, ${edge.to.x - 60} ${edge.to.y}, ${edge.to.x} ${edge.to.y}`;
            return (
              <g key={`re-${region.regionId}`}>
                {/* double line = dual/resilient; single line otherwise */}
                {dual && (
                  <path d={d} fill="none" stroke={color} strokeWidth={lit ? 2.5 : 1.5}
                    strokeOpacity={focusId && !lit ? 0.3 : 0.85} transform="translate(0,-2.4)" strokeLinecap="round" />
                )}
                <path
                  data-fabric-edge data-kind="region" data-region-id={region.regionId} data-path={region.path}
                  className={provisioned ? 'fabric-edge-enter' : undefined}
                  d={d} fill="none" stroke={color} strokeWidth={lit ? 2.6 : 1.6}
                  strokeOpacity={focusId && !lit ? 0.3 : 0.9}
                  strokeDasharray={dash} strokeLinecap="round"
                >
                  <title>{region.cloudName} {region.name} · {region.path} · {region.reliability} · {region.latencyMs}ms</title>
                </path>
                {/* on-ramp product label — the edge detail-on-demand */}
                {region.onrampIds.length > 0 && (
                  <text x={edge.mid.x} y={edge.mid.y} textAnchor="middle"
                    fill={HEX.slateInk} stroke={HEX.wash} strokeWidth={3} paintOrder="stroke"
                    className="text-[10px] font-medium" style={{ opacity: focusId && !lit ? 0.4 : 1 }}>
                    {edge.onrampLabel}
                  </text>
                )}
              </g>
            );
          })}
          {/* fabric → internet/SaaS (always public egress) */}
          {(() => {
            const e = layout.internet.edge;
            const lit = fabricFocus || focusId === 'e-net';
            const d = `M ${e.from.x} ${e.from.y} C ${e.from.x + 60} ${e.from.y}, ${e.to.x - 60} ${e.to.y}, ${e.to.x} ${e.to.y}`;
            return (
              <path data-fabric-edge data-kind="internet" d={d} fill="none" stroke={HEX.slate}
                strokeWidth={lit ? 2.4 : 1.5} strokeOpacity={focusId && !lit ? 0.3 : 0.85}
                strokeDasharray="5 5" strokeLinecap="round" />
            );
          })()}
        </g>

        {/* ---- cloud ↔ cloud arcs (first-class east-west) ---- */}
        <g data-edges-c2c>
          {layout.arcs.map(a => {
            const lit = arcLit(a.regionIds);
            return (
              <path
                key={`arc-${a.id}`} data-fabric-arc data-controlled={a.controlled}
                d={`M ${a.a.x} ${a.a.y} Q ${a.ctrl.x} ${a.ctrl.y} ${a.b.x} ${a.b.y}`}
                fill="none" stroke={a.controlled ? HEX.cobalt : HEX.slate}
                strokeWidth={lit ? 2.2 : 1.4} strokeOpacity={focusId && !lit ? 0.28 : 0.75}
                strokeDasharray={a.controlled ? undefined : '4 5'} strokeLinecap="round"
              >
                <title>{a.label} · {a.controlled ? 'AT&T fabric' : 'public peering'}</title>
              </path>
            );
          })}
        </g>

        {/* ---- fabric label (its own button) ---- */}
        <foreignObject x={layout.fabric.x - 6} y={layout.fabric.cy - 30} width={layout.fabric.w + 12} height={60}>
          <button
            type="button"
            aria-pressed={selected?.kind === 'fabric'}
            data-testid="fabric-node-fabric"
            onClick={() => select({ kind: 'fabric' })}
            onMouseEnter={() => setHover('__fabric__')} onMouseLeave={() => setHover(null)}
            onFocus={() => setHover('__fabric__')} onBlur={() => setHover(null)}
            className="w-full h-full flex flex-col items-center justify-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057b8]/50"
          >
            <span className="text-[11px] font-semibold leading-tight text-[#0057b8]">AT&amp;T</span>
            <span className="text-[11px] font-semibold leading-tight text-[#0057b8]">Fabric</span>
          </button>
        </foreignObject>

        {/* ---- site nodes ---- */}
        <g data-nodes-site>
          {layout.sites.map(s => {
            const isSel = selected?.kind === 'site' && selected.id === s.id;
            return (
              <foreignObject key={`sn-${s.id}`} x={s.x} y={s.y - NODE_H / 2} width={SITE_W} height={NODE_H}>
                <button
                  type="button" aria-pressed={isSel}
                  data-fabric-node data-testid={`fabric-node-site-${s.id}`}
                  onClick={() => select({ kind: 'site', id: s.id })}
                  onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(s.id)} onBlur={() => setHover(null)}
                  className={`w-full h-full flex flex-col justify-center rounded-lg border px-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057b8]/50 ${
                    isSel ? 'border-[#0057b8] bg-[#0057b8]/[0.05] ring-1 ring-[#0057b8]' : 'border-fw-secondary bg-fw-base hover:bg-fw-wash'
                  }`}
                >
                  <span className="truncate text-[11px] font-semibold text-fw-heading leading-tight">{s.label.split(' · ')[0]}</span>
                  <span className="truncate text-[10px] text-fw-bodyLight leading-tight">
                    {s.firstMile ? `first-mile · ${s.firstMile}` : 'public internet'}
                  </span>
                </button>
              </foreignObject>
            );
          })}
        </g>

        {/* ---- region nodes (grouped by cloud) + internet/SaaS ---- */}
        <g data-nodes-region>
          {layout.regions.map(({ region, x, y }, i) => {
            const prev = layout.regions[i - 1]?.region.cloudId;
            const firstOfCloud = region.cloudId !== prev;
            const isSel = selected?.kind === 'region' && selected.id === region.regionId;
            return (
              <foreignObject key={`rn-${region.regionId}`} x={x} y={y - NODE_H / 2} width={REGION_W} height={NODE_H}>
                <button
                  type="button" aria-pressed={isSel}
                  data-fabric-node data-region-node data-testid={`fabric-node-region-${region.regionId}`}
                  data-region-id={region.regionId} data-path={region.path} data-reliability={region.reliability}
                  onClick={() => select({ kind: 'region', id: region.regionId })}
                  onMouseEnter={() => { setHover(region.regionId); setHoverInfo({ x: x - 8, y: y - NODE_H / 2 - 34, region }); }}
                  onMouseLeave={() => { setHover(null); setHoverInfo(null); }}
                  onFocus={() => { setHover(region.regionId); setHoverInfo({ x: x - 8, y: y - NODE_H / 2 - 34, region }); }}
                  onBlur={() => { setHover(null); setHoverInfo(null); }}
                  className={`w-full h-full flex items-center gap-2 rounded-lg border pl-2 pr-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057b8]/50 ${
                    isSel ? 'border-[#0057b8] bg-[#0057b8]/[0.05] ring-1 ring-[#0057b8]' : 'border-fw-secondary bg-fw-base hover:bg-fw-wash'
                  }`}
                >
                  <ProviderLogo id={region.cloudId} size={26} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[11px] font-semibold text-fw-heading leading-tight">{region.name}</span>
                      {firstOfCloud && <span className="truncate text-[10px] text-fw-bodyLight leading-tight">· {region.cloudName}</span>}
                    </span>
                    <span className="flex items-center gap-1.5 leading-tight">
                      <span className={`text-[10px] font-medium ${region.path === 'private' ? 'text-[#0057b8]' : 'text-[#475569]'}`}>
                        {region.path === 'private' ? 'Private' : 'Public'}
                      </span>
                      <span className="text-[10px] text-fw-bodyLight">· {region.latencyMs}ms</span>
                    </span>
                  </span>
                  <ReliabilityDot reliability={region.reliability} />
                </button>
              </foreignObject>
            );
          })}
          {/* internet / SaaS egress node */}
          {(() => {
            const isSel = selected?.kind === 'internet';
            return (
              <foreignObject x={layout.internet.x} y={layout.internet.y - NODE_H / 2} width={REGION_W} height={NODE_H}>
                <button
                  type="button" aria-pressed={isSel}
                  data-fabric-node data-testid="fabric-node-internet"
                  onClick={() => select({ kind: 'internet' })}
                  onMouseEnter={() => setHover('e-net')} onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover('e-net')} onBlur={() => setHover(null)}
                  className={`w-full h-full flex items-center gap-2 rounded-lg border border-dashed pl-2.5 pr-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057b8]/50 ${
                    isSel ? 'border-[#0057b8] bg-[#0057b8]/[0.05] ring-1 ring-[#0057b8]' : 'border-fw-secondary bg-fw-wash hover:bg-fw-neutral'
                  }`}
                >
                  <span className="flex items-center justify-center h-6 w-6 rounded-md bg-fw-neutral text-fw-bodyLight text-[10px] font-bold shrink-0">SaaS</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-semibold text-fw-heading leading-tight">Internet / SaaS</span>
                    <span className="block truncate text-[10px] text-fw-bodyLight leading-tight">Public egress · breakout</span>
                  </span>
                </button>
              </foreignObject>
            );
          })()}
        </g>

        {/* ---- performance hover tooltip: latency + jump to Observe ---- */}
        {hoverInfo && (
          <foreignObject x={Math.max(4, hoverInfo.x - 150)} y={Math.max(2, hoverInfo.y)} width={200} height={34}>
            <div className="flex items-center justify-end gap-1.5 whitespace-nowrap rounded-md border border-fw-secondary bg-white px-2 py-1 text-[10px] shadow-sm">
              <span className="font-semibold tabular-nums text-fw-heading">{hoverInfo.region.latencyMs}ms</span>
              <Link to="/observe" className="font-medium text-[#0057b8] hover:underline">View in Observe →</Link>
            </div>
          </foreignObject>
        )}
      </svg>

      {/* provisioned edge draw-in — CSS only, geometry never touched; off under reduced-motion */}
      <style>{`
        .fabric-edge-enter { stroke-dasharray: 240; stroke-dashoffset: 240; animation: fabric-edge-draw .7s ease-out forwards; }
        @keyframes fabric-edge-draw { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .fabric-edge-enter { animation: none; stroke-dasharray: none; stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
