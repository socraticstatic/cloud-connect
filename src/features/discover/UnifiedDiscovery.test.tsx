import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UnifiedDiscovery } from './UnifiedDiscovery';
import { CC } from '../../engine';
import { ID_RENAME_WARNING } from '../govern/groupLanguage';
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

  it('has no AT&T fabric on-ramp rail (Pure Discovery — rail relocated to Connect)', () => {
    renderUD();
    expect(screen.queryByRole('complementary', { name: /at&t fabric on-ramps/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/NetBond · PE-IAD-02/)).not.toBeInTheDocument();
  });

  it('shows a connection-state indicator on cloud rows (fabric vs public)', () => {
    renderUD();
    // AWS is reached over the fabric in the seed; the label abstracts the product.
    expect(screen.getAllByText('via the AT&T fabric').length).toBeGreaterThan(0);
    // Unattached clouds read as public internet.
    expect(screen.getAllByText('public internet').length).toBeGreaterThan(0);
  });

  it('"+ Connect a cloud" opens the discovery wizard', () => {
    renderUD();
    fireEvent.click(screen.getByRole('button', { name: /connect a cloud/i }));
    const dialog = screen.getByRole('dialog', { name: /connect a cloud/i });
    expect(dialog).toBeInTheDocument();
    // provider picker is present (visible option label, scoped to the wizard)
    expect(within(dialog).getByText('Oracle Cloud')).toBeInTheDocument();
  });
});

/* Task E — the stakeholder note: "show the list of discovered objects, and
   allow the user to GROUP these together." Branches were seeded, used by the
   policy engine, and rendered nowhere; the note's own example (group San
   Jose, San Francisco and Berkeley) was unreachable. */
describe('Discover selection → group', () => {
  const selectBranch = (name: string) =>
    fireEvent.click(screen.getByRole('checkbox', { name: `Select ${name}` }));

  it('lists the customer sites, outside the cloud tree', () => {
    renderUD();
    const sites = screen.getByTestId('discover-sites');
    expect(within(sites).getByText('San Jose campus')).toBeInTheDocument();
    expect(within(sites).getByText('Berkeley lab')).toBeInTheDocument();
    // every seeded site, counted off the engine — never a hardcoded 6
    expect(within(sites).getAllByRole('checkbox').length).toBe(CC.branches.length);
  });

  it('selecting is not expanding — picking a site does not open anything', () => {
    renderUD();
    selectBranch('San Jose campus');
    expect(screen.getByRole('checkbox', { name: 'Select San Jose campus' })).toBeChecked();
    expect(screen.getByText('collapsed view')).toBeInTheDocument();
  });

  it('the selection bar counts what is selected and clears it', () => {
    renderUD();
    expect(screen.queryByTestId('discover-selection')).not.toBeInTheDocument();
    selectBranch('San Jose campus');
    selectBranch('San Francisco office');
    const bar = screen.getByTestId('discover-selection');
    expect(within(bar).getByText(/2 selected/)).toBeInTheDocument();
    fireEvent.click(within(bar).getByRole('button', { name: /clear selection/i }));
    expect(screen.queryByTestId('discover-selection')).not.toBeInTheDocument();
  });

  it('a mixed selection of a site and a VPC says it will cover both estates', () => {
    renderUD();
    selectBranch('San Jose campus');
    fireEvent.click(screen.getByRole('button', { name: 'us-east-1' })); // drill to a VPC
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select vpc-prod-01' }));
    const bar = screen.getByTestId('discover-selection');
    expect(within(bar).getByText(/2 selected/)).toBeInTheDocument();
    expect(within(bar).getByTestId('selection-kind')).toHaveTextContent('Both');
  });

  it('Group these shows the id a policy will store, and the rename warning', () => {
    renderUD();
    selectBranch('Dallas HQ');
    fireEvent.click(screen.getByRole('button', { name: /group these/i }));
    fireEvent.change(screen.getByLabelText('Group name'), { target: { value: 'Central sites E' } });
    expect(screen.getByTestId('discover-group-id')).toHaveTextContent('central-sites-e');
    expect(screen.getByTestId('discover-group-warning')).toHaveTextContent(ID_RENAME_WARNING);
  });

  it('does not offer to change the estate — Discover reads, it does not mutate', () => {
    renderUD();
    selectBranch('Dallas HQ');
    const bar = screen.getByTestId('discover-selection');
    expect(within(bar).queryByRole('button', { name: /attach|fix|provision|connect/i })).toBeNull();
  });

  // --- MUTATING: creates a group in the shared engine. Ordered last. ---
  it('creates a group holding exactly the picked sites', () => {
    renderUD();
    selectBranch('San Jose campus');
    selectBranch('San Francisco office');
    selectBranch('Berkeley lab');
    fireEvent.click(screen.getByRole('button', { name: /group these/i }));
    fireEvent.change(screen.getByLabelText('Group name'), { target: { value: 'Bay sites' } });
    fireEvent.click(screen.getByRole('button', { name: /^Create group$/i }));

    const created = CC.groupList().find((g: { id: string }) => g.id === 'bay-sites');
    expect(created).toBeTruthy();
    expect(created.kind).toBe('site');
    // expectation stated from the seed, not read back off the UI
    const r = CC.resolveGroup('bay-sites');
    expect(r.branchIds.slice().sort()).toEqual(['br-bkl', 'br-sfo', 'br-sjc']);
    expect(r.vpcIds).toEqual([]);
    // the selection is spent
    expect(screen.queryByTestId('discover-selection')).not.toBeInTheDocument();
  });
});
