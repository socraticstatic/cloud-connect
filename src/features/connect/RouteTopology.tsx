import { useMemo } from 'react';
import { useCloudControl } from '../../engine/react/useCloudControl';
import { AttIcon } from '../../components/icons/AttIcon';
import type { AttIconName } from '../../components/icons/AttIcon';

/** Grid -> pixel scaling. `gx` runs 0 (edge) .. 8.5 (cloud); `gy` is row index. */
const SCALE_X = 90;
const SCALE_Y = 46;
const PAD = 24;

/**
 * Flywheel design-token hex values, applied as literal SVG `fill`/`stroke`
 * attributes rather than Tailwind `fill-fw-*`/`stroke-fw-*` classes.
 *
 * This project's tailwind.config.js only extends `textColor`/`backgroundColor`/
 * `borderColor`/`ringColor` with the `fw-*` palette — it does NOT extend the
 * shared `colors` theme that the `fill`/`stroke` core plugins read from, so
 * `fill-fw-*`/`stroke-fw-*` compile to no CSS at all (confirmed: `grep
 * stroke-fw dist/assets/*.css` is empty after a production build; the
 * codebase's own ResiliencyMap.tsx works around the same gap by falling back
 * to plain Tailwind `stroke-blue-500`/`stroke-amber-400`). Using hex literals
 * here keeps the exact Flywheel greens/blues instead of an approximation.
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

/** Picks a Flywheel-styled mark for a node by its engine `kind`. */
function markFor(kind?: string): AttIconName {
  if (kind === 'cloud') return 'cloud';
  if (kind === 'pop') return 'ethernet';
  return 'router';
}

/** Edge color: AT&T-green for anything riding the controlled fabric
 * (direct or overlay), muted gray for public-internet paths. */
function strokeColorFor(cls: SceneEdge['cls']): string {
  return cls === 'public' ? FW_HEX.bodyLight : FW_HEX.success;
}

function pointFor(node: SceneNode | undefined): { x: number; y: number } | null {
  if (!node) return null;
  return { x: node.gx * SCALE_X + PAD, y: node.gy * SCALE_Y + PAD };
}

/**
 * 2D SVG route topology — a pure function of `CC.sceneGraph()`. No RNG, no
 * clocks, no layout randomness: identical scene graph in ⇒ identical node
 * `transform`s out. Replaces the removed isometric routing canvas.
 */
export function RouteTopology() {
  const { nodes, edges } = useCloudControl(cc => cc.sceneGraph()) as {
    nodes: SceneNode[];
    edges: SceneEdge[];
  };

  const byId = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  const extents = useMemo(() => {
    const maxGx = nodes.reduce((m, n) => Math.max(m, n.gx), 0);
    const maxGy = nodes.reduce((m, n) => Math.max(m, n.gy), 0);
    return {
      width: maxGx * SCALE_X + PAD * 2 + 140, // room for node labels to the right
      height: maxGy * SCALE_Y + PAD * 2 + 20,
    };
  }, [nodes]);

  return (
    <div className="rounded-2xl border border-fw-secondary bg-fw-base overflow-x-auto">
      <svg
        viewBox={`0 0 ${extents.width} ${extents.height}`}
        width="100%"
        role="img"
        aria-label="Route topology: edge to AT&T fabric to cloud"
        className="min-w-[560px]"
      >
        <g data-edges>
          {edges.map(edge => {
            const from = pointFor(byId.get(edge.from));
            const via = edge.via ? pointFor(byId.get(edge.via)) : null;
            const to = pointFor(byId.get(edge.to));
            // Defensive: skip edges whose endpoints don't resolve rather than crash.
            if (!from || !to) return null;

            const points = via ? [from, via, to] : [from, to];
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
          {nodes.map(node => (
            <g key={node.id} data-node transform={`translate(${node.gx * SCALE_X + PAD}, ${node.gy * SCALE_Y + PAD})`}>
              <circle
                r={12}
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
              <text x={18} y={4} fill={FW_HEX.heading} className="text-[11px] font-medium">
                {node.label}
              </text>
            </g>
          ))}
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
