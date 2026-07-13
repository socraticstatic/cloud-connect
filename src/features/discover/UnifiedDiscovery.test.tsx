import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UnifiedDiscovery } from './UnifiedDiscovery';
// No provider wrapper — the engine is a singleton read via useCloudControl (see RouteTopology.test.tsx).

describe('UnifiedDiscovery', () => {
  it('renders one row per inventory entry and the three lens chips', () => {
    render(<UnifiedDiscovery />);
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^network$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^ai$/i })).toBeInTheDocument();
    expect(screen.getByText('CoreWeave')).toBeInTheDocument(); // a joined row
    expect(screen.getByText('AWS')).toBeInTheDocument();
  });

  it('selecting the Network lens marks it active', () => {
    render(<UnifiedDiscovery />);
    const net = screen.getByRole('button', { name: /^network$/i });
    fireEvent.click(net);
    expect(net.getAttribute('aria-pressed')).toBe('true');
  });
});
