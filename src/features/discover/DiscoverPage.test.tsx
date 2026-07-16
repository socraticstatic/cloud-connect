import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DiscoverPage } from './DiscoverPage';

describe('DiscoverPage', () => {
  it('mounts the drill-down estate view with the cloud tree and connect action', () => {
    render(
      <MemoryRouter initialEntries={['/discover']}>
        <DiscoverPage />
      </MemoryRouter>
    );
    // estate header + top-level cloud rows both label a 'Workloads' tile now
    expect(screen.getAllByText('Workloads').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'AWS' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CoreWeave' })).toBeInTheDocument();
    // Pure Discovery: a "+ Connect a cloud" action, no fabric on-ramp rail
    expect(screen.getByRole('button', { name: /connect a cloud/i })).toBeInTheDocument();
    expect(screen.queryByRole('complementary', { name: /at&t fabric on-ramps/i })).not.toBeInTheDocument();
  });
});
