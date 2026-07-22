import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { CC } from '../../engine';
import { pathEvidence } from './pathEvidence';
import { PathChoice } from './PathChoice';

describe('PathChoice', () => {
  it('renders both paths for a region that has both', () => {
    render(<PathChoice cloudId="aws" regionId="use1" />);
    expect(screen.getByText('Direct cloud connect')).toBeInTheDocument();
    expect(screen.getByText('Dedicated tenant')).toBeInTheDocument();
  });

  it('shows the engine latency on BOTH cards, exactly once each', () => {
    render(<PathChoice cloudId="aws" regionId="euw1" />);
    const rows = pathEvidence(CC as never, 'aws', 'euw1');
    // Same figure on both cards by construction — assert the exact count, so a
    // card that loses its figure cannot pass.
    expect(rows[0].latencyMs).toBe(rows[1].latencyMs);
    expect(screen.getAllByText(`${rows[0].latencyMs} ms`)).toHaveLength(2);
  });

  it('agrees with the panel: the latency shown is fabricModel()\'s, not the raw region seed', () => {
    render(<PathChoice cloudId="azure" regionId="uks" />);
    const model = (CC as never as {
      fabricModel(): { regions: { cloudId: string; regionId: string; latencyMs: number }[] };
    }).fabricModel();
    const shown = model.regions.find(r => r.cloudId === 'azure' && r.regionId === 'uks')!.latencyMs;
    expect(screen.getAllByText(`${shown} ms`)).toHaveLength(2);
  });

  it('marks the unavailable path: the label says so and the card carries the unavailable treatment', () => {
    render(<PathChoice cloudId="azure" regionId="uks" />);
    const rows = pathEvidence(CC as never, 'azure', 'uks');
    const tenanted = rows.find(r => r.pathId === 'tenanted')!;
    expect(tenanted.availability).toBe('none');

    const card = screen.getByTestId('path-tenanted');
    expect(card).toHaveAttribute('data-availability', 'none');
    expect(within(card).getByText('Not available here')).toBeInTheDocument();
    expect(within(card).getByText('None in this region')).toBeInTheDocument();
    expect(within(card).getByText(/No NetBond on-ramp targets this region/i)).toBeInTheDocument();
    // Neutral, not green, and visibly de-emphasised.
    expect(card.className).toContain('bg-fw-neutral');
    expect(card.className).toContain('opacity-70');
    expect(card.className).not.toContain('fw-successLight');
  });

  it('does not badge an unprovisioned path green: it reads provisionable, in cobalt', () => {
    render(<PathChoice cloudId="azure" regionId="uks" />);
    const card = screen.getByTestId('path-managed-direct');
    expect(card).toHaveAttribute('data-availability', 'provisionable');
    const badge = within(card).getByText('Provisionable here');
    expect(badge.className).toContain('#0057b8');
    expect(badge.className).not.toContain('fw-successLight');
  });

  it('badges "Live here" only where an active on-ramp carries the region', () => {
    render(<PathChoice cloudId="aws" regionId="use1" />);
    const tenanted = screen.getByTestId('path-tenanted');
    expect(tenanted).toHaveAttribute('data-availability', 'live');
    expect(within(tenanted).getByText('Live here')).toBeInTheDocument();
    // The direct path has no on-ramp here at all — it must say so, not "Available".
    const direct = screen.getByTestId('path-managed-direct');
    expect(direct).toHaveAttribute('data-availability', 'none');
    expect(within(direct).getByText('Not available here')).toBeInTheDocument();
  });

  it('shows the hand-off site and the on-ramp\'s own capacity/state text as evidence', () => {
    render(<PathChoice cloudId="cw" regionId="cwe" />);
    const rows = pathEvidence(CC as never, 'cw', 'cwe');
    const tenanted = rows.find(r => r.pathId === 'tenanted')!;
    const card = screen.getByTestId('path-tenanted');
    expect(within(card).getByText(tenanted.handoffSite!)).toBeInTheDocument();
    expect(within(card).getByText(tenanted.capacityNote!)).toBeInTheDocument();
  });

  it('makes no partner-fabric or L3 claim on a neocloud region', () => {
    const { container } = render(<PathChoice cloudId="cw" regionId="cwe" />);
    expect(container.textContent).not.toMatch(/Equinix Fabric/i);
    expect(container.textContent).not.toMatch(/\bL3\b/);
  });

  it('renders nothing for an unknown region', () => {
    const { container } = render(<PathChoice cloudId="aws" regionId="nope" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for an unknown cloud', () => {
    const { container } = render(<PathChoice cloudId="nope" regionId="use1" />);
    expect(container).toBeEmptyDOMElement();
  });

  /* The engine is a shared singleton — this mutation persists for the rest of
     the file, so it runs last. */
  it('re-derives after a mutation: activating the on-ramp flips the card to Live here', () => {
    const first = render(<PathChoice cloudId="aws" regionId="usw2" />);
    expect(screen.getByTestId('path-managed-direct')).toHaveAttribute('data-availability', 'provisionable');
    first.unmount();

    (CC as never as { activateOnramp(id: string): boolean }).activateOnramp('dx1');

    render(<PathChoice cloudId="aws" regionId="usw2" />);
    const card = screen.getByTestId('path-managed-direct');
    expect(card).toHaveAttribute('data-availability', 'live');
    expect(within(card).getByText('Live here')).toBeInTheDocument();
  });
});
