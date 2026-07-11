import { useMemo } from 'react';
import { useCloudControl } from '../../engine/react/useCloudControl';
import { AttIcon } from '../../components/icons/AttIcon';
import type { AttIconName } from '../../components/icons/AttIcon';

/** Grid -> pixel scaling. `gx` runs 0 (edge) .. 8.5 (cloud); `gy` is row index. */
const SCALE_X = 90;
const SCALE_Y = 46;
const PAD = 24;
/** Left gutter so left-column labels (rendered to the LEFT of their node) fit. */
const LEFT_MARGIN = 104;
/** Node circle radius; edges are trimmed to the perimeter so lines never run
 * under the icon, and labels are placed clear of the edge direction. */
const R = 12;

/**
 * Flywheel design-token hex values, applied as literal SVG `fill`/`stroke`
 * attributes rather than Tailwind `fill-fw-*`/`stroke-fw-*` classes (this
 * project's tailwind.config extends only text/bg/border with `fw-*`, so
 * `fill-fw-*`/`stroke-fw-*` compile to no CSS). Hex keeps the exact Flywheel
 * greens/blues instead of an approximation.
 */
const FW_HEX = {
  active: '#0057b8', // fw-active (Cobalt 600)
  success: '#2d7e24', // fw-success (AT&T green)
  bodyLight: '#686e74', // fw-bodyLight (Gray 600)
  secondary: '#dcdfe3', // fw-secondary (Gray 300 border)
  wash: '#f8fafb', // fw-wash (Gray 100)
  heading: '#1d2329', // fw-heading (Gray 800)
} as const;

interface SceneNode {
  id: string;
  gx: number;
  gy: number;
  kind?: string;
  label?: string;
  [key: string]: unknown;
}

interface SceneEdge {
  id: string;
  flowId?: string;
  from: string;
  to: string;
  via?: string | null;
  cls: 'controlled' | 'overlay' | 'public';
  gbps?: number;
  label?: string;
  latencyMs?: number;
}

type Pt = { x: number; y: number };

/** Picks a Flywheel-styled mark for a node by its engine `kind`. */
function markFor(kind?: string): AttIconName {
  if (kind === 'cloud') return 'cloud';
  if (kind === 'pop') return 'ethernet';
  return 'router';
}

/** AT&T-green for anything on the controlled fabric (direct or overlay),
 * muted gray for public-internet paths. */
function strokeColorFor(cls: SceneEdge['cls']): string {
  return cls === 'public' ? FW_HEX.bodyLight : FW_HEX.success;
}

/** Move point `p` toward `toward` by `dist` (so an edge starts/ends on the
 * node's circle perimeter, not its center). */
function trim(p: Pt, toward: Pt, dist: number): Pt {
  const dx = toward.x - p.x;
  const dy = toward.y - p.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: p.x + (dx / len) * dist, y: p.y + (dy / len) * dist };
}

/**
 * 2D SVG route topology — a pure function of `CC.sceneGraph()`. No RNG, no
 * clocks, no layout randomness: identical scene graph in ⇒ identical geometry
 * out. Replaces the removed isometric routing canvas.
 *
 * Labels are placed by COLUMN so edges never cross them: left-column (on-prem)
 * labels sit to the LEFT, middle-column (AT&T PoP) labels sit BELOW, and
 * right-column (cloud) labels sit to the RIGHT — plus a white halo behind text.
 */
export function RouteTopology() {
  const { nodes, edges } = useCloudControl(cc => cc.sceneGraph()) as {
    nodes: SceneNode[];
    edges: SceneEdge[];
  };

  const byId = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  // Column classification by gx: leftmost = source sites, rightmost = clouds.
  const { minGx, maxGx } = useMemo(() => {
    let mn = Infinity;
    let mx = -Infinity;
    for (const n of nodes) {
      mn = Math.min(mn, n.gx);
      mx = Math.max(mx, n.gx);
    }
    return { minGx: mn === Infinity ? 0 : mn, maxGx: mx === -Infinity ? 0 : mx };
  }, [nodes]);

  const pointFor = (node: SceneNode | undefined): Pt | null =>
    node ? { x: node.gx * SCALE_X + PAD + LEFT_MARGIN, y: node.gy * SCALE_Y + PAD } : null;

  const extents = useMemo(() => {
    const maxGy = nodes.reduce((m, n) => Math.max(m, n.gy), 0);
    return {
      width: maxGx * SCALE_X + PAD * 2 + LEFT_MARGIN + 150, // + room for cloud labels
      height: maxGy * SCALE_Y + PAD * 2 + 28, // + room for the below-labels row
    };
  }, [nodes, maxGx]);

  return (
    <div className="rounded-2xl border border-fw-secondary bg-fw-base overflow-x-auto">
      <svg
        viewBox={`0 0 ${extents.width} ${extents.height}`}
        width="100%"
        role="img"
        aria-label="Route topology: on-prem sites to AT&T fabric to cloud"
        className="min-w-[620px]"
      >
        <g data-edges>
          {edges.map(edge => {
            const from = pointFor(byId.get(edge.from));
            const via = edge.via ? pointFor(byId.get(edge.via)) : null;
            const to = pointFor(byId.get(edge.to));
            // Defensive: skip edges whose endpoints don't resolve rather than crash.
            if (!from || !to) return null;

            // Trim the first/last segment to the circle perimeter so lines
            // begin and end at the node edge, never under the icon.
            const startTowards = via ?? to;
            const endTowards = via ?? from;
            const start = trim(from, startTowards, R + 1);
            const end = trim(to, endTowards, R + 1);

            const points = via ? [start, via, end] : [start, end];
            const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

            return (
              <path
                key={edge.id}
                data-edge
                data-edge-cls={edge.cls}
                d={d}
                fill="none"
                stroke={strokeColorFor(edge.cls)}
                strokeWidth={edge.cls === 'public' ? 1.5 : 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={edge.cls === 'public' ? '4 4' : undefined}
                className={edge.cls !== 'public' ? 'route-flow' : ''}
              >
                <title>
                  {edge.label ?? edge.id}
                  {edge.gbps ? ` · ${edge.gbps} Gbps` : ''}
                  {edge.latencyMs ? ` · ${edge.latencyMs}ms` : ''}
                </title>
              </path>
            );
          })}
        </g>

        <g data-nodes>
          {nodes.map(node => {
            const isLeft = node.gx === minGx;
            const isRight = node.gx === maxGx;
            // Label position by column, clear of the edge direction.
            const label = isLeft
              ? { x: -(R + 6), y: 4, anchor: 'end' as const }
              : isRight
              ? { x: R + 6, y: 4, anchor: 'start' as const }
              : { x: 0, y: R + 16, anchor: 'middle' as const }; // middle -> below
            return (
              <g
                key={node.id}
                data-node
                transform={`translate(${node.gx * SCALE_X + PAD + LEFT_MARGIN}, ${node.gy * SCALE_Y + PAD})`}
              >
                <circle
                  r={R}
                  fill={FW_HEX.wash}
                  stroke={
                    node.kind === 'cloud'
                      ? FW_HEX.active
                      : node.kind === 'pop'
                      ? FW_HEX.success
                      : FW_HEX.secondary
                  }
                  strokeWidth={2}
                />
                <foreignObject x={-8} y={-8} width={16} height={16}>
                  <AttIcon name={markFor(node.kind)} className="w-4 h-4 text-fw-heading" />
                </foreignObject>
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor={label.anchor}
                  fill={FW_HEX.heading}
                  stroke={FW_HEX.wash}
                  strokeWidth={3}
                  paintOrder="stroke"
                  className="text-[11px] font-medium"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Dash-flow animation on controlled/overlay edges only — CSS opacity/
          dash-offset, never touches DOM geometry (transform/d stay static). */}
      <style>{`
        .route-flow { stroke-dasharray: 6 4; animation: route-flow-dash 1.2s linear infinite; }
        @keyframes route-flow-dash { to { stroke-dashoffset: -20; } }
        @media (prefers-reduced-motion: reduce) {
          .route-flow { animation: none; }
        }
      `}</style>
    </div>
  );
}
