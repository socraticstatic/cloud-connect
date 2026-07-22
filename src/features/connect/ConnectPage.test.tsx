import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CC } from '../../engine';
import { ConnectPage } from './ConnectPage';

describe('ConnectPage (Cloud Fabric)', () => {
  it('renders the fabric hero with a node per region', () => {
    render(
      <MemoryRouter>
        <ConnectPage />
      </MemoryRouter>
    );
    const model = CC.fabricModel();
    model.regions.forEach(r => {
      expect(screen.getByTestId(`fabric-node-region-${r.regionId}`)).toBeInTheDocument();
    });
    // the unified fabric is itself a node
    expect(screen.getByTestId('fabric-node-fabric')).toBeInTheDocument();
  });

  it('selecting a region opens its panel', () => {
    render(
      <MemoryRouter>
        <ConnectPage />
      </MemoryRouter>
    );
    // pick an unattached region (us-west-2)
    fireEvent.click(screen.getByTestId('fabric-node-region-usw2'));
    // the region panel shows a Provision action for it
    expect(screen.getByTestId('open-provision-wizard')).toBeInTheDocument();
  });

  it('walking the wizard provisions the region onto the fabric', () => {
    render(
      <MemoryRouter>
        <ConnectPage />
      </MemoryRouter>
    );
    expect(CC.fabricModel().regions.find(r => r.regionId === 'usw2')!.path).toBe('public');

    fireEvent.click(screen.getByTestId('fabric-node-region-usw2'));
    fireEvent.click(screen.getByTestId('open-provision-wizard'));

    const dialog = screen.getByRole('dialog');
    // Next x3 → Confirm
    for (let i = 0; i < 3; i++) {
      fireEvent.click(within(dialog).getByRole('button', { name: /^Next$/i }));
    }
    fireEvent.click(within(dialog).getByTestId('provision-confirm'));

    expect(CC.fabricModel().regions.find(r => r.regionId === 'usw2')!.path).toBe('private');
    expect(CC.fabricModel().regions.find(r => r.regionId === 'usw2')!.attached).toBe(true);
  });

  it('shows the "from Discover" intent banner only when arriving via ?from=discover', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/connect?from=discover']}>
        <ConnectPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/attaching the workloads flagged on discover/i)).toBeInTheDocument();
    unmount();

    render(
      <MemoryRouter initialEntries={['/naas/connect']}>
        <ConnectPage />
      </MemoryRouter>
    );
    expect(screen.queryByText(/attaching the workloads flagged on discover/i)).toBeNull();
  });

  it('renders a forward CTA to Govern', () => {
    render(
      <MemoryRouter initialEntries={['/naas/connect']}>
        <ConnectPage />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /govern these paths/i })).toHaveAttribute('href', '/naas/govern');
  });
});
