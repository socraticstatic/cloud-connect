import { describe, it, expect } from 'vitest';
import { CC } from '../../engine';
import { buildSankey, PATH_NODES } from './sankeyModel';

describe('buildSankey', () => {
  it('has exactly two path nodes and no orphans', () => {
    const s = buildSankey(CC);
    const pathNodes = s.nodes.filter(n => n.band === 'path');
    expect(pathNodes.map(n => n.name).sort()).toEqual([PATH_NODES.private, PATH_NODES.public].sort());
    const linked = new Set(s.links.flatMap(l => [l.source, l.target]));
    s.nodes.forEach((_, i) => expect(linked.has(i)).toBe(true));
  });

  it('balances per path node: inflow equals outflow', () => {
    const s = buildSankey(CC);
    for (const [i, n] of s.nodes.entries()) {
      if (n.band !== 'path') continue;
      const inflow = s.links.filter(l => l.target === i).reduce((x, l) => x + l.value, 0);
      const outflow = s.links.filter(l => l.source === i).reduce((x, l) => x + l.value, 0);
      expect(Math.abs(inflow - outflow)).toBeLessThan(0.01);
    }
  });

  it('totals match routeFlows gbps', () => {
    const s = buildSankey(CC);
    const total = (CC.routeFlows() as { gbps: number }[]).reduce((x, r) => x + r.gbps, 0);
    const sourceOut = s.links.filter(l => s.nodes[l.source].band === 'source').reduce((x, l) => x + l.value, 0);
    expect(Math.abs(sourceOut - total)).toBeLessThan(0.5);
  });

  it('every link is directional: source→path or path→dest only', () => {
    const s = buildSankey(CC);
    for (const l of s.links) {
      const a = s.nodes[l.source].band, b = s.nodes[l.target].band;
      expect((a === 'source' && b === 'path') || (a === 'path' && b === 'dest')).toBe(true);
    }
  });

  it('no node name contains the bidirectional arrow (↔ indicates c2c source misparsing)', () => {
    const s = buildSankey(CC);
    for (const node of s.nodes) {
      expect(node.name.includes('↔')).toBe(false);
    }
  });

  it('dest band contains "SaaS / internet egress" and does NOT contain "public internet"', () => {
    const s = buildSankey(CC);
    const destNodes = s.nodes.filter(n => n.band === 'dest');
    const destNames = destNodes.map(n => n.name);
    expect(destNames).toContain('SaaS / internet egress');
    expect(destNames).not.toContain('public internet');
    // Confirm "Public internet" exists only in path band
    const pathNodes = s.nodes.filter(n => n.band === 'path');
    const pathNames = pathNodes.map(n => n.name);
    expect(pathNames).toContain('Public internet');
  });

  it('c2c flows land on the "Inter-cloud" dest node with value > 0', () => {
    const s = buildSankey(CC);
    const intercloudDest = s.nodes.find(n => n.band === 'dest' && n.name === 'Inter-cloud');
    expect(intercloudDest).toBeTruthy();
    const intercloudIdx = s.nodes.indexOf(intercloudDest!);
    const linksToIntercloud = s.links.filter(l => l.target === intercloudIdx);
    expect(linksToIntercloud.length).toBeGreaterThan(0);
    for (const link of linksToIntercloud) {
      expect(link.value).toBeGreaterThan(0);
    }
  });
});
