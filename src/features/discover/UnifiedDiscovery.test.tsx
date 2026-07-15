import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UnifiedDiscovery } from './UnifiedDiscovery';
// No engine provider wrapper — the engine is a singleton read via useCloudControl
// (see RouteTopology.test.tsx). A MemoryRouter is required because the embedded
// FlowBar/FlowStepper reads the active route via useLocation().
const renderUD = () => render(<MemoryRouter initialEntries={['/discover']}><UnifiedDiscovery /></MemoryRouter>);

describe('UnifiedDiscovery', () => {
  it('renders one row per inventory entry and the three lens chips', () => {
    renderUD();
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^network$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^ai$/i })).toBeInTheDocument();
    expect(screen.getByText('CoreWeave')).toBeInTheDocument(); // a joined row
    expect(screen.getByText('AWS')).toBeInTheDocument();
  });

  it('selecting the Network lens marks it active', () => {
    renderUD();
    const net = screen.getByRole('button', { name: /^network$/i });
    fireEvent.click(net);
    expect(net.getAttribute('aria-pressed')).toBe('true');
  });
});
