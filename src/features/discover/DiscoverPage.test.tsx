import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DiscoverPage } from './DiscoverPage';

describe('DiscoverPage', () => {
  it('mounts the drill-down estate view with the cloud tree and fabric rail', () => {
    render(
      <MemoryRouter initialEntries={['/discover']}>
        <DiscoverPage />
      </MemoryRouter>
    );
    // estate header + top-level cloud rows both label a 'Workloads' tile now
    expect(screen.getAllByText('Workloads').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'AWS' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CoreWeave' })).toBeInTheDocument();
    // fabric rail
    expect(screen.getByRole('complementary', { name: /at&t fabric on-ramps/i })).toBeInTheDocument();
  });
});
