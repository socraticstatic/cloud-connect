import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UnifiedDiscovery } from './UnifiedDiscovery';
// No engine provider wrapper — the engine is a singleton read via useCloudControl.
// A MemoryRouter is required because the embedded FlowBar reads the active route.
const renderUD = () => render(<MemoryRouter initialEntries={['/discover']}><UnifiedDiscovery /></MemoryRouter>);

describe('UnifiedDiscovery drill-down tree', () => {
  it('renders the estate header and a top-level row per cloud', () => {
    renderUD();
    // estate tiles
    expect(screen.getByText('VPC · VNet')).toBeInTheDocument();
    expect(screen.getByText('Gateways')).toBeInTheDocument();
    // cloud rows (buttons carry aria-label = cloud name)
    expect(screen.getByRole('button', { name: 'AWS' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CoreWeave' })).toBeInTheDocument();
  });

  it('AWS starts expanded and reveals its regions', () => {
    renderUD();
    expect(screen.getByRole('button', { name: 'us-east-1' })).toBeInTheDocument();
  });

  it('drills cloud → region → VPC → resource map', () => {
    renderUD();
    fireEvent.click(screen.getByRole('button', { name: 'us-east-1' }));
    const vpcBtn = screen.getByRole('button', { name: 'vpc-prod-01' });
    expect(vpcBtn).toBeInTheDocument();
    fireEvent.click(vpcBtn);
    // level-4 map columns appear
    expect(screen.getByText('Subnets · by availability zone')).toBeInTheDocument();
    expect(screen.getByText(/Gateways & connections/)).toBeInTheDocument();
  });

  it('Expand all opens every region; Collapse all closes the tree', () => {
    renderUD();
    fireEvent.click(screen.getByRole('button', { name: /expand all/i }));
    expect(screen.getByRole('button', { name: 'us-west-2' })).toBeInTheDocument(); // a non-default region
    fireEvent.click(screen.getByRole('button', { name: /collapse all/i }));
    expect(screen.queryByRole('button', { name: 'us-east-1' })).not.toBeInTheDocument();
  });

  it('the AT&T fabric rail lists the on-ramps', () => {
    renderUD();
    const rail = screen.getByRole('complementary', { name: /at&t fabric on-ramps/i });
    expect(within(rail).getByText(/NetBond · PE-IAD-02/)).toBeInTheDocument();
  });
});
