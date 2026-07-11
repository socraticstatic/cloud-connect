import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HubCard } from '../HubCard';
import type { Hub } from '../../../../types/hub';
import type { Connection } from '../../../../types';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

const router: Hub = {
  id: 'router-east',
  name: 'AT&T Core East',
  description: 'Test router',
  status: 'active',
  location: 'Ashburn, VA',
  vendor: 'Cisco',
  connectionIds: ['conn-1', 'conn-2'],
  createdAt: '2024-01-15T10:00:00Z',
  links: [],
  performance: {
    latency: '3.8ms',
    throughput: '8.5 Gbps',
    cpuUsage: 42,
    memoryUsage: 68,
    bgpSessions: { total: 16, active: 14, idle: 2 },
    routingTableSize: 48532,
    packetForwardingRate: 950,
    controlPlaneLoad: 18
  }
};

const connections: Connection[] = [
  {
    id: 'conn-1',
    name: 'Corporate Cloud Hub',
    type: 'Internet to Cloud',
    status: 'Active',
    bandwidth: '10 Gbps',
    location: 'Ashburn, VA',
    provider: 'AWS'
  },
  {
    id: 'conn-2',
    name: 'AWS Interconnect',
    type: 'Internet to Cloud',
    status: 'Pending',
    bandwidth: '1 Gbps',
    location: 'Ashburn, VA',
    provider: 'AWS'
  }
];

describe('HubCard', () => {
  it('renders router name and vendor in full (state 2)', () => {
    render(
      <MemoryRouter>
        <HubCard
          router={router}
          connections={connections}
          isMinimized={false}
          onMinimize={vi.fn()}
          onMaximize={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('AT&T Core East')).toBeDefined();
    expect(screen.getByText('Cisco')).toBeDefined();
  });

  it('renders connection count pill', () => {
    render(
      <MemoryRouter>
        <HubCard
          router={router}
          connections={connections}
          isMinimized={false}
          onMinimize={vi.fn()}
          onMaximize={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('2 connections')).toBeDefined();
  });

  it('connections are hidden by default (state 2)', () => {
    render(
      <MemoryRouter>
        <HubCard
          router={router}
          connections={connections}
          isMinimized={false}
          onMinimize={vi.fn()}
          onMaximize={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(screen.queryByText('Corporate Cloud Hub')).toBeNull();
    expect(screen.getByText('Show connections (2)')).toBeDefined();
  });

  it('reveals connections after clicking expand handle (state 3)', async () => {
    render(
      <MemoryRouter>
        <HubCard
          router={router}
          connections={connections}
          isMinimized={false}
          onMinimize={vi.fn()}
          onMaximize={vi.fn()}
        />
      </MemoryRouter>
    );
    await act(async () => {
      screen.getByText('Show connections (2)').click();
    });
    expect(screen.getByText('Corporate Cloud Hub')).toBeDefined();
    expect(screen.getByText('AWS Interconnect')).toBeDefined();
  });

  it('hides connections after clicking collapse handle', async () => {
    render(
      <MemoryRouter>
        <HubCard
          router={router}
          connections={connections}
          isMinimized={false}
          onMinimize={vi.fn()}
          onMaximize={vi.fn()}
        />
      </MemoryRouter>
    );
    await act(async () => {
      screen.getByText('Show connections (2)').click();
    });
    await act(async () => {
      screen.getByText('Hide connections').click();
    });
    expect(screen.queryByText('Corporate Cloud Hub')).toBeNull();
  });

  it('renders minimized state (state 1)', () => {
    render(
      <MemoryRouter>
        <HubCard
          router={router}
          connections={connections}
          isMinimized={true}
          onMinimize={vi.fn()}
          onMaximize={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('AT&T Core East')).toBeDefined();
    expect(screen.queryByText('BGP Sessions')).toBeNull();
  });

  it('calls onMaximize when expand button is clicked in minimized state', async () => {
    const onMaximize = vi.fn();
    render(
      <MemoryRouter>
        <HubCard
          router={router}
          connections={connections}
          isMinimized={true}
          onMinimize={vi.fn()}
          onMaximize={onMaximize}
        />
      </MemoryRouter>
    );
    screen.getByTitle('Expand').click();
    expect(onMaximize).toHaveBeenCalledOnce();
  });

  it('calls onMinimize when minimize button is clicked', () => {
    const onMinimize = vi.fn();
    render(
      <MemoryRouter>
        <HubCard
          router={router}
          connections={connections}
          isMinimized={false}
          onMinimize={onMinimize}
          onMaximize={vi.fn()}
        />
      </MemoryRouter>
    );
    screen.getByTitle('Minimize').click();
    expect(onMinimize).toHaveBeenCalledOnce();
  });
});
