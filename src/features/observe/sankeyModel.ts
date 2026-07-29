import type { CloudControl } from '../../engine/types';

// Shape of a routeFlows() row (src/engine/state-routing.ts) — untyped at the
// source (// @ts-nocheck), so we mirror the fields this binding consumes.
// c2c rows use '↔' (state-routing.ts:120) — their label format is
// "${A.cloud.name} ${A.r.name} ↔ ${B.cloud.name} ${B.r.name}" — the source
// for Sankey is the left side (region name before ↔).
interface RouteFlowRow {
  id: string;
  kind?: 'app' | 'c2c';
  label: string;
  gbps: number;
  dst?: string; // present on app rows only (kind: 'app')
  current: { attControlled: boolean };
}

export interface SankeyNode {
  name: string;
  band: 'source' | 'path' | 'dest';
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
  pathKind: 'private' | 'public';
}

export interface SankeyModel {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export const PATH_NODES = {
  private: 'AT&T fabric',
  public: 'Public internet',
};

export function buildSankey(cc: CloudControl): SankeyModel {
  const rows = cc.routeFlows() as RouteFlowRow[];

  // Collect all sources and destinations
  const sourcesSet = new Set<string>();
  const destsSet = new Set<string>();

  for (const row of rows) {
    let source: string;
    let dest: string;

    // c2c rows use '↔'; app rows use '→'
    if (row.kind === 'c2c') {
      // c2c source: left side of '↔' (e.g. "AWS us-east-1")
      source = row.label.split('↔')[0].trim();
      dest = 'Inter-cloud';
    } else {
      // app rows: split on '→'
      source = row.label.split('→')[0].trim();
      // Relabel destination when `row.dst === 'internet'`
      if (row.dst === 'internet') {
        dest = 'SaaS / internet egress';
      } else {
        dest = row.label.split('→')[1]?.trim() || '';
      }
    }

    sourcesSet.add(source);
    destsSet.add(dest);
  }

  // Build node arrays
  const sourceNodes: SankeyNode[] = Array.from(sourcesSet).sort().map(name => ({
    name,
    band: 'source' as const,
  }));

  const pathNodes: SankeyNode[] = [
    { name: PATH_NODES.private, band: 'path' },
    { name: PATH_NODES.public, band: 'path' },
  ];

  const destNodes: SankeyNode[] = Array.from(destsSet).sort().map(name => ({
    name,
    band: 'dest' as const,
  }));

  const nodes = [...sourceNodes, ...pathNodes, ...destNodes];

  // Create a map for quick index lookups
  const nodeIndex = new Map<string, number>();
  nodes.forEach((node, i) => {
    nodeIndex.set(`${node.band}:${node.name}`, i);
  });

  // Build links: aggregate by source->path and path->dest pairs
  const sourceToPaths = new Map<string, number>(); // key: "sourceIdx:pathIdx" -> value
  const pathToDests = new Map<string, number>(); // key: "pathIdx:destIdx" -> value

  for (const row of rows) {
    let source: string;
    let dest: string;

    // c2c rows use '↔'; app rows use '→'
    if (row.kind === 'c2c') {
      // c2c source: left side of '↔'
      source = row.label.split('↔')[0].trim();
      dest = 'Inter-cloud';
    } else {
      // app rows: split on '→'
      source = row.label.split('→')[0].trim();
      // Relabel destination when `row.dst === 'internet'`
      if (row.dst === 'internet') {
        dest = 'SaaS / internet egress';
      } else {
        dest = row.label.split('→')[1]?.trim() || '';
      }
    }

    const sourceIdx = nodeIndex.get(`source:${source}`)!;

    // Determine path
    const pathKind = row.current.attControlled ? 'private' : 'public';
    const pathName = pathKind === 'private' ? PATH_NODES.private : PATH_NODES.public;
    const pathIdx = nodeIndex.get(`path:${pathName}`)!;

    const destIdx = nodeIndex.get(`dest:${dest}`)!;

    // Aggregate source->path link
    const sourcePathKey = `${sourceIdx}:${pathIdx}`;
    sourceToPaths.set(sourcePathKey, (sourceToPaths.get(sourcePathKey) ?? 0) + row.gbps);

    // Aggregate path->dest link
    const pathDestKey = `${pathIdx}:${destIdx}`;
    pathToDests.set(pathDestKey, (pathToDests.get(pathDestKey) ?? 0) + row.gbps);
  }

  // Convert aggregated links to array format
  const links: SankeyLink[] = [];

  // Add source->path links
  for (const [key, value] of sourceToPaths) {
    const [sourceIdx, pathIdx] = key.split(':').map(Number);
    const pathNode = nodes[pathIdx];
    const pathKind = pathNode.name === PATH_NODES.private ? 'private' : 'public';
    links.push({
      source: sourceIdx,
      target: pathIdx,
      value,
      pathKind,
    });
  }

  // Add path->dest links
  for (const [key, value] of pathToDests) {
    const [pathIdx, destIdx] = key.split(':').map(Number);
    const pathNode = nodes[pathIdx];
    const pathKind = pathNode.name === PATH_NODES.private ? 'private' : 'public';
    links.push({
      source: pathIdx,
      target: destIdx,
      value,
      pathKind,
    });
  }

  return { nodes, links };
}
