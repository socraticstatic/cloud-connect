import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UnifiedDiscovery } from './UnifiedDiscovery';
import { CC } from '../../engine';

afterEach(cleanup);

const renderUD = () =>
  render(<MemoryRouter initialEntries={['/discover']}><UnifiedDiscovery /></MemoryRouter>);

describe('UnifiedDiscovery view toggle', () => {
  it('defaults to the tree, with the toggle stating both views', () => {
    renderUD();
    expect(screen.getByRole('button', { name: 'Tree view', pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Map view', pressed: false })).toBeInTheDocument();
    expect(screen.queryByTestId('attachment-map')).not.toBeInTheDocument();
  });

  it('Map swaps the tree for the attachment map, and back', () => {
    renderUD();
    fireEvent.click(screen.getByRole('button', { name: 'Map view' }));
    expect(screen.getByTestId('attachment-map')).toBeInTheDocument();
    // the tree's cloud rows are gone while the map is up
    expect(screen.queryByRole('button', { name: 'CoreWeave' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tree view' }));
    expect(screen.queryByTestId('attachment-map')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CoreWeave' })).toBeInTheDocument();
  });

  it('the tree/map view leads the page - toggle renders before the Network section', () => {
    renderUD();
    const toggle = screen.getByRole('button', { name: 'Tree view' });
    // Scoped to the heading role: the estate filter chips now render a
    // "Network" domain chip too, and an unscoped text query would find both.
    const network = screen.getByRole('heading', { name: 'Network' });
    expect(toggle.compareDocumentPosition(network) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe('UnifiedDiscovery estate filter chips', () => {
  it('the tree starts with every cloud rolled up — collapsed rollups, not AWS pre-opened', () => {
    renderUD();
    for (const c of CC.clouds as { id: string; name: string }[]) {
      expect(screen.getByRole('button', { name: c.name })).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('Public internet narrows the tree to groups holding a public region, and marks the chip pressed', () => {
    renderUD();
    const chips = screen.getByTestId('estate-filter-chips');
    const publicChip = within(chips).getByRole('button', { name: 'Public internet' });
    fireEvent.click(publicChip);
    expect(publicChip).toHaveAttribute('aria-pressed', 'true');

    const fabricModel = CC.fabricModel();
    for (const c of CC.clouds as { id: string; name: string }[]) {
      const cloudRegions = fabricModel.regions.filter(r => r.cloudId === c.id);
      // A cloud with no fabric-shaped regions has nothing to filter against
      // and stays visible; otherwise it needs at least one public region.
      const expectVisible = cloudRegions.length === 0 || cloudRegions.some(r => r.path === 'public');
      const row = screen.queryByRole('button', { name: c.name });
      if (expectVisible) {
        expect(row, `${c.name} should stay visible under Public internet`).toBeInTheDocument();
      } else {
        expect(row, `${c.name} should be filtered out under Public internet`).not.toBeInTheDocument();
      }
    }
  });

  it('Clear filters restores every group after Public internet narrowed the tree', () => {
    renderUD();
    const chips = screen.getByTestId('estate-filter-chips');
    fireEvent.click(within(chips).getByRole('button', { name: 'Public internet' }));
    fireEvent.click(within(chips).getByRole('button', { name: /clear filters/i }));

    expect(within(chips).getByRole('button', { name: 'Public internet' })).toHaveAttribute('aria-pressed', 'false');
    expect(within(chips).queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();
    for (const c of CC.clouds as { id: string; name: string }[]) {
      expect(screen.getByRole('button', { name: c.name })).toBeInTheDocument();
    }
  });
});
