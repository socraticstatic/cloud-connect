import type { SankeyModel } from './sankeyModel';

/* ------------------------------------------------------------------ *
 * The Flow tab's ribbon diagram, hand-rolled in the FabricHero idiom:
 * deterministic geometry, Flywheel palette, no chart library. recharts'
 * generic Sankey rendered gray slivers and floating labels — on the one
 * screen sold as visibility-led, the paths have to BE the picture.
 *
 * Color carries exactly one meaning, the same one the whole app uses:
 * cobalt = riding the AT&T fabric, slate = exposed to the public
 * internet. Everything else is ink. The headline states the split so the
 * takeaway survives even a glance; the ribbons make the same claim in
 * proportion; the sr-only list restates every ribbon for screen readers
 * (the records table below is the full data view).
 * ------------------------------------------------------------------ */

const HEX = {
  cobalt: '#0057b8',
  slate: '#94a3b8',
  slateInk: '#64748b',
  ink: '#1d2329',
  inkSoft: '#475569',
} as const;

const VIEW_W = 1000;
const SRC_BAR_X = 212;
const MID_X = 494;
const DEST_BAR_X = 782;
const BAR_W = 7;
const NODE_GAP = 14;
const RIBBON_GAP = 2;
const PLOT_INNER = 272;
const PAD_Y = 12;

export interface GNode {
  name: string;
  band: 'source' | 'path' | 'dest';
  x: number;
  y: number;
  h: number;
  value: number;
  fill: string;
  pathKind?: 'private' | 'public';
}
export interface GRibbon {
  d: string;
  fill: string;
  label: string;
  key: string;
}
export interface SankeyGeometry {
  w: number;
  h: number;
  nodes: GNode[];
  ribbons: GRibbon[];
  privateGbps: number;
  publicGbps: number;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Pure geometry: identical model in ⇒ identical layout out. */
export function computeSankeyGeometry(model: SankeyModel): SankeyGeometry {
  const nodeValue = (i: number) =>
    model.links.reduce((s, l) => s + (l.source === i || l.target === i ? l.value : 0), 0) /
    (model.nodes[i].band === 'path' ? 2 : 1);

  const idx = model.nodes.map((n, i) => ({ n, i, value: nodeValue(i) }));
  const privateIdx = idx.find(x => x.n.band === 'path' && x.n.name === 'AT&T fabric');
  const publicIdx = idx.find(x => x.n.band === 'path' && x.n.name !== 'AT&T fabric');

  /* Band orders. Sources: public-path flows first (they dominate), each
     group by size — this keeps ribbon crossings near zero. Mid: public on
     top for the same reason. Dests by size. */
  const srcKind = (i: number): 'private' | 'public' =>
    model.links.some(l => l.source === i && l.pathKind === 'private') ? 'private' : 'public';
  const sources = idx
    .filter(x => x.n.band === 'source')
    .sort((a, b) =>
      srcKind(a.i) === srcKind(b.i) ? b.value - a.value : srcKind(a.i) === 'public' ? -1 : 1,
    );
  const mids = [publicIdx, privateIdx].filter(Boolean) as typeof idx;
  const dests = idx.filter(x => x.n.band === 'dest').sort((a, b) => b.value - a.value);

  const bands = [sources, mids, dests];
  const scale = Math.min(
    ...bands.map(b => {
      const gaps = (b.length - 1) * NODE_GAP;
      const total = b.reduce((s, x) => s + x.value, 0) || 1;
      return (PLOT_INNER - gaps) / total;
    }),
  );

  const heights = new Map<number, number>();
  bands.flat().forEach(x => heights.set(x.i, Math.max(x.value * scale, 8)));
  const bandH = (b: typeof idx) =>
    b.reduce((s, x) => s + heights.get(x.i)!, 0) + (b.length - 1) * NODE_GAP;
  const h = Math.max(...bands.map(bandH)) + PAD_Y * 2;

  const yTop = new Map<number, number>();
  const xFor = (band: GNode['band']) => (band === 'source' ? SRC_BAR_X : band === 'path' ? MID_X : DEST_BAR_X);
  const nodes: GNode[] = [];
  for (const b of bands) {
    let y = (h - bandH(b)) / 2;
    for (const x of b) {
      yTop.set(x.i, y);
      nodes.push({
        name: x.n.name,
        band: x.n.band,
        x: xFor(x.n.band),
        y,
        h: heights.get(x.i)!,
        value: r1(x.value),
        fill:
          x.n.band === 'path'
            ? x.n.name === 'AT&T fabric'
              ? HEX.cobalt
              : HEX.slateInk
            : HEX.slateInk,
        pathKind: x.n.band === 'path' ? (x.n.name === 'AT&T fabric' ? 'private' : 'public') : undefined,
      });
      y += heights.get(x.i)! + NODE_GAP;
    }
  }

  /* Ribbons. Offsets stack per node end; each end's thickness is the
     link's share of that node's height (minus the 2px gaps), so ribbons
     always stay inside their bars even where a min-height applied. */
  const linkCount = new Map<number, number>();
  model.links.forEach(l => {
    linkCount.set(l.source, (linkCount.get(l.source) ?? 0) + 1);
    linkCount.set(l.target, (linkCount.get(l.target) ?? 0) + 1);
  });
  const nodeTotal = new Map<number, number>();
  bands.flat().forEach(x => nodeTotal.set(x.i, x.value || 1));
  /* Two accumulators, deliberately separate: a path-band node is the TARGET
     of source→path ribbons and the SOURCE of path→dest ribbons, and each
     side stacks from the top of the bar independently. */
  const sAcc = new Map<number, number>();
  const tAcc = new Map<number, number>();
  const endThickness = (i: number, value: number) => {
    const inner = heights.get(i)! - (linkCount.get(i)! - 1) * RIBBON_GAP;
    return Math.max((value / nodeTotal.get(i)!) * inner, 2);
  };

  const bandOrder = new Map<number, number>();
  bands.flat().forEach((x, k) => bandOrder.set(x.i, k));
  const ordered = [...model.links].sort(
    (a, b) => bandOrder.get(a.source)! - bandOrder.get(b.source)! || bandOrder.get(a.target)! - bandOrder.get(b.target)!,
  );
  /* Target-side stacking must follow source order per target, so run a
     second pass keyed by target. */
  const byTarget = [...model.links].sort(
    (a, b) => bandOrder.get(a.target)! - bandOrder.get(b.target)! || bandOrder.get(a.source)! - bandOrder.get(b.source)!,
  );
  const tOffset = new Map<string, number>();
  const tKey = (l: { source: number; target: number }) => `${l.source}|${l.target}`;
  byTarget.forEach(l => {
    const prev = tAcc.get(l.target) ?? 0;
    tOffset.set(tKey(l), prev);
    tAcc.set(l.target, prev + endThickness(l.target, l.value) + RIBBON_GAP);
  });

  const ribbons: GRibbon[] = [];
  ordered.forEach(l => {
    const sPrev = sAcc.get(l.source) ?? 0;
    const st = endThickness(l.source, l.value);
    sAcc.set(l.source, sPrev + st + RIBBON_GAP);
    const tt = endThickness(l.target, l.value);
    const sy0 = yTop.get(l.source)! + sPrev;
    const ty0 = yTop.get(l.target)! + tOffset.get(tKey(l))!;
    const srcBand = model.nodes[l.source].band;
    const sx = (srcBand === 'source' ? SRC_BAR_X : MID_X) + BAR_W;
    const tx = model.nodes[l.target].band === 'path' ? MID_X : DEST_BAR_X;
    const c1 = sx + (tx - sx) * 0.45;
    const c2 = sx + (tx - sx) * 0.55;
    ribbons.push({
      key: tKey(l),
      label: `${model.nodes[l.source].name} → ${model.nodes[l.target].name} · ${r1(l.value)} Gbps`,
      fill: l.pathKind === 'private' ? HEX.cobalt : HEX.slate,
      d: `M ${sx} ${sy0} C ${c1} ${sy0} ${c2} ${ty0} ${tx} ${ty0} L ${tx} ${ty0 + tt} C ${c2} ${ty0 + tt} ${c1} ${sy0 + st} ${sx} ${sy0 + st} Z`,
    });
  });

  return {
    w: VIEW_W,
    h,
    nodes,
    ribbons,
    privateGbps: r1(privateIdx?.value ?? 0),
    publicGbps: r1(publicIdx?.value ?? 0),
  };
}

function NodeLabel({ n }: { n: GNode }) {
  const mid = n.y + n.h / 2;
  const value = `${n.value} Gbps`;
  if (n.band === 'source') {
    return (
      <text x={SRC_BAR_X - 8} y={mid} dy="0.35em" textAnchor="end" fontSize={11}>
        <tspan fill={HEX.ink} fontWeight={600}>{n.name}</tspan>
        <tspan fill={HEX.inkSoft}>{` · ${value}`}</tspan>
      </text>
    );
  }
  if (n.band === 'dest') {
    return (
      <text x={DEST_BAR_X + BAR_W + 8} y={mid} dy="0.35em" fontSize={11}>
        <tspan fill={HEX.ink} fontWeight={600}>{n.name}</tspan>
        <tspan fill={HEX.inkSoft}>{` · ${value}`}</tspan>
      </text>
    );
  }
  /* Path node: the label rides above the bar in a white halo so it stays
     legible over the ribbons on either side. */
  return (
    <text
      x={MID_X + BAR_W / 2}
      y={n.y - 7}
      textAnchor="middle"
      fontSize={11.5}
      fontWeight={700}
      fill={n.pathKind === 'private' ? HEX.cobalt : HEX.inkSoft}
      stroke="#ffffff"
      strokeWidth={3.5}
      paintOrder="stroke"
    >
      {`${n.name} · ${n.value} Gbps`}
    </text>
  );
}

export function SankeyPanel({ model }: { model: SankeyModel }) {
  const g = computeSankeyGeometry(model);
  const total = r1(g.privateGbps + g.publicGbps);
  return (
    <div data-testid="sankey-panel">
      {/* The takeaway, stated before it is drawn. */}
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <p className="text-figma-sm text-fw-heading">
          <span className="font-semibold">{g.publicGbps} of {total} Gbps</span> still rides the public
          internet · <span className="font-semibold" style={{ color: HEX.cobalt }}>{g.privateGbps} Gbps</span> under
          AT&amp;T control
        </p>
        <span className="flex items-center gap-3 text-[11px] text-fw-bodyLight">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: HEX.cobalt }} /> AT&amp;T fabric
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: HEX.slate }} /> public internet
          </span>
        </span>
      </div>

      <svg
        viewBox={`0 0 ${g.w} ${g.h}`}
        className="w-full"
        role="img"
        aria-label="Traffic flow: sources, the path each flow rides, and its destination"
      >
        {g.ribbons.map(r => (
          <path key={r.key} d={r.d} fill={r.fill} className="opacity-30 transition-opacity hover:opacity-60">
            <title>{r.label}</title>
          </path>
        ))}
        {g.nodes.map(n => (
          <g key={`${n.band}-${n.name}`}>
            <rect x={n.x} y={n.y} width={BAR_W} height={n.h} rx={3} fill={n.fill} />
            <NodeLabel n={n} />
          </g>
        ))}
      </svg>

      {/* Screen-reader restatement of every ribbon; the records table below
          is the full data view. */}
      <ul data-testid="sankey-links" className="sr-only">
        {model.links.map((l, i) => {
          const source = model.nodes[l.source]?.name ?? '';
          const target = model.nodes[l.target]?.name ?? '';
          return (
            <li key={i}>
              {source} → {target} · {r1(l.value)} Gbps
            </li>
          );
        })}
      </ul>
    </div>
  );
}
