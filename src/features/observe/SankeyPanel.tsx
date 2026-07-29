import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import type { NodeProps, LinkProps } from 'recharts/types/chart/Sankey';
import type { SankeyModel, SankeyNode } from './sankeyModel';

// Node fill by band — no amber, no brand color; slate/cobalt scale only.
const NODE_FILL: Record<SankeyNode['band'], string> = {
  source: '#475569',
  path: '#0057b8', // overridden per-node below for public path
  dest: '#64748b',
};

const PATH_PUBLIC_FILL = '#94a3b8';

function nodeFill(node: SankeyNode): string {
  if (node.band === 'path') {
    return node.name === 'Public internet' ? PATH_PUBLIC_FILL : NODE_FILL.path;
  }
  return NODE_FILL[node.band];
}

function linkStroke(pathKind: 'private' | 'public'): string {
  return pathKind === 'private' ? '#0057b8' : '#94a3b8';
}

function SankeyNodeShape(props: NodeProps) {
  const { x, y, width, height, payload } = props;
  const fill = nodeFill(payload as unknown as SankeyNode);
  const gbps = Math.round((payload.value ?? 0) * 10) / 10;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={2} />
      <text
        x={x + width + 6}
        y={y + height / 2}
        dy="0.35em"
        className="text-[10px] fill-fw-body"
        textAnchor="start"
      >
        {payload.name} · {gbps} Gbps
      </text>
    </g>
  );
}

function SankeyLinkShape(props: LinkProps) {
  const {
    sourceX,
    targetX,
    sourceY,
    targetY,
    sourceControlX,
    targetControlX,
    linkWidth,
    payload,
  } = props;
  const pathKind = (payload as unknown as { pathKind: 'private' | 'public' }).pathKind;
  const d = `M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`;
  return (
    <path
      d={d}
      fill="none"
      stroke={linkStroke(pathKind)}
      strokeOpacity={0.25}
      strokeWidth={Math.max(linkWidth, 1)}
    />
  );
}

export function SankeyPanel({ model }: { model: SankeyModel }) {
  return (
    <div data-testid="sankey-panel">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={model}
            node={SankeyNodeShape}
            link={SankeyLinkShape}
            nodePadding={24}
            margin={{ top: 8, right: 140, bottom: 8, left: 8 }}
          >
            <Tooltip />
          </Sankey>
        </ResponsiveContainer>
      </div>
      {/* Accessible fallback — recharts' ResponsiveContainer measures 0×0 in
          jsdom (and the chart is decorative for screen readers), so the
          paths it draws are restated here as a plain, always-rendered list. */}
      <ul data-testid="sankey-links" className="mt-3 space-y-1 text-figma-xs text-fw-body">
        {model.links.map((l, i) => {
          const source = model.nodes[l.source]?.name ?? '';
          const target = model.nodes[l.target]?.name ?? '';
          const value = Math.round(l.value * 10) / 10;
          return (
            <li key={i}>
              {source} → {target} · {value} Gbps
            </li>
          );
        })}
      </ul>
    </div>
  );
}
