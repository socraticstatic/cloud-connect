import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiscoveryRow } from './DiscoveryRow';
import type { InventoryRow } from './useUnifiedInventory';

const both: InventoryRow = {
  key: 'cw', name: 'CoreWeave', mark: { color: '#9a7cff', label: 'CW' },
  network: { onrampId: 'nb2', onrampName: 'NetBond Adv · PE-DAL-01', attached: false, workloads: 6, path: 'public' },
  ai: { status: 'connected', provider: 'CoreWeave', models: [{ id: 'helion-70b', name: 'helion-70b', ready: true }], readyCount: 1 },
};

describe('DiscoveryRow', () => {
  it('shows both a Network chip and an AI chip when both facets exist', () => {
    render(<DiscoveryRow row={both} lens="all" />);
    expect(screen.getByText('CoreWeave')).toBeInTheDocument();
    expect(screen.getByText(/network/i)).toBeInTheDocument();
    expect(screen.getByText(/connected/i)).toBeInTheDocument();
  });

  it('expands to reveal both facet panels', () => {
    render(<DiscoveryRow row={both} lens="all" />);
    fireEvent.click(screen.getByRole('button', { name: /coreweave/i }));
    expect(screen.getByText(/helion-70b/i)).toBeInTheDocument();      // AI facet content
    expect(screen.getByText(/PE-DAL-01/i)).toBeInTheDocument();       // network facet content
  });

  it('dims the non-selected facet under a lens', () => {
    const { container } = render(<DiscoveryRow row={both} lens="network" />);
    fireEvent.click(screen.getByRole('button', { name: /coreweave/i }));
    expect(container.querySelector('[data-facet="ai"]')?.className).toMatch(/opacity-40/);
  });
});
