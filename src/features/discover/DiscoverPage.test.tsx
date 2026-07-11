import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CC } from '../../engine';
import { DiscoverPage } from './DiscoverPage';

describe('DiscoverPage', () => {
  it('renders the estate and attach raises attached count', () => {
    render(
      <MemoryRouter>
        <DiscoverPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/6 clouds/i)).toBeInTheDocument();

    const before = CC.counts().attached;
    fireEvent.click(screen.getAllByRole('button', { name: /attach/i })[0]);
    expect(CC.counts().attached).toBeGreaterThan(before);
  });
});
