import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CC } from '../../engine';
import { FabricHero, computeFabricLayout, onrampShort } from './FabricHero';

describe('computeFabricLayout', () => {
  it('is deterministic — identical model in ⇒ identical geometry out', () => {
    const m = CC.fabricModel();
    expect(computeFabricLayout(m)).toEqual(computeFabricLayout(m));
  });

  it('positions one node per site and per region, plus c2c arcs', () => {
    const m = CC.fabricModel();
    const l = computeFabricLayout(m);
    expect(l.sites).toHaveLength(m.sites.length);
    expect(l.regions).toHaveLength(m.regions.length);
    expect(l.arcs.length).toBeGreaterThan(0);
    // regions carry a private/public-aware edge with an on-ramp product label
    const use1 = l.regions.find(r => r.region.regionId === 'use1')!;
    expect(use1.edge.onrampLabel).toContain('NetBond');
  });
});

describe('onrampShort', () => {
  it('abstracts products to short edge labels', () => {
    expect(onrampShort('Direct Connect')).toBe('DX');
    expect(onrampShort('ExpressRoute')).toBe('ER');
    expect(onrampShort('NetBond Adv')).toBe('NetBond');
  });
});

describe('FabricHero', () => {
  it('renders a button per region node and encodes private/public on the region edge', () => {
    render(
      <MemoryRouter>
        <FabricHero model={CC.fabricModel()} />
      </MemoryRouter>
    );
    // us-east-1 is attached in seed → private edge
    const use1Edge = document.querySelector('[data-fabric-edge][data-region-id="use1"]');
    expect(use1Edge).toHaveAttribute('data-path', 'private');
    // us-west-2 unattached → public edge
    const usw2Edge = document.querySelector('[data-fabric-edge][data-region-id="usw2"]');
    expect(usw2Edge).toHaveAttribute('data-path', 'public');
  });

  it('clicking a node lifts a selection to the parent', () => {
    const onSelect = vi.fn();
    render(
      <MemoryRouter>
        <FabricHero model={CC.fabricModel()} onSelect={onSelect} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId('fabric-node-region-usw2'));
    expect(onSelect).toHaveBeenCalledWith({ kind: 'region', id: 'usw2' });
    fireEvent.click(screen.getByTestId('fabric-node-fabric'));
    expect(onSelect).toHaveBeenCalledWith({ kind: 'fabric' });
  });

  it('renders the tour anchor', () => {
    const { container } = render(
      <MemoryRouter>
        <FabricHero model={CC.fabricModel()} />
      </MemoryRouter>
    );
    expect(container.querySelector('[data-tour="connect-onramp"]')).not.toBeNull();
  });
});
