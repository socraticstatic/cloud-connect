import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CC } from '../../engine';
import { RouteTopology } from './RouteTopology';

describe('RouteTopology', () => {
  it('renders one svg node per sceneGraph node, positioned deterministically', () => {
    const { container } = render(<RouteTopology />);
    const g = CC.sceneGraph();
    expect(container.querySelectorAll('[data-node]').length).toBe(g.nodes.length);

    // deterministic: two renders produce identical node coordinates
    const first = [...container.querySelectorAll('[data-node]')].map(n => n.getAttribute('transform'));
    const { container: c2 } = render(<RouteTopology />);
    expect([...c2.querySelectorAll('[data-node]')].map(n => n.getAttribute('transform'))).toEqual(first);
  });

  it('renders an edge path for every sceneGraph edge with a resolvable endpoint', () => {
    const { container } = render(<RouteTopology />);
    const g = CC.sceneGraph();
    const nodeIds = new Set(g.nodes.map((n: { id: string }) => n.id));
    const resolvable = g.edges.filter(
      (e: { from: string; to: string }) => nodeIds.has(e.from) && nodeIds.has(e.to)
    );
    expect(container.querySelectorAll('[data-edge]').length).toBe(resolvable.length);
  });
});
