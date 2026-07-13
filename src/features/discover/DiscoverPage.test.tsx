import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DiscoverPage } from './DiscoverPage';

describe('DiscoverPage', () => {
  it('mounts the unified discovery view with lens chips and joined inventory rows', () => {
    render(
      <MemoryRouter>
        <DiscoverPage />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^network$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^ai$/i })).toBeInTheDocument();
    expect(screen.getByText('CoreWeave')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument();
  });
});
