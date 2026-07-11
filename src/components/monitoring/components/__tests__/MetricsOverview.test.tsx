import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricsOverview } from '../MetricsOverview';

describe('MetricsOverview', () => {
  const mockMetrics = {
    latency: '10ms',
    packetLoss: '0.1%',
    jitter: '2ms',
    uptime: '99.99%',
    bandwidth: '10 Gbps',
    tunnelStatus: 'Active'
  };

  it('renders all metrics correctly', () => {
    render(<MetricsOverview metrics={mockMetrics} />);
    
    // Check if all metric values are displayed
    expect(screen.getByText('10ms')).toBeInTheDocument();
    expect(screen.getByText('0.1%')).toBeInTheDocument();
    expect(screen.getByText('2ms')).toBeInTheDocument();
    expect(screen.getByText('99.99%')).toBeInTheDocument();
    expect(screen.getByText('10 Gbps')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays correct metric labels', () => {
    render(<MetricsOverview metrics={mockMetrics} />);
    
    expect(screen.getByText('Network Latency')).toBeInTheDocument();
    expect(screen.getByText('Packet Loss')).toBeInTheDocument();
    expect(screen.getByText('Jitter')).toBeInTheDocument();
    expect(screen.getByText('Uptime')).toBeInTheDocument();
    expect(screen.getByText('Bandwidth')).toBeInTheDocument();
    expect(screen.getByText('Tunnel Status')).toBeInTheDocument();
  });

  it('renders the performance summary title', () => {
    render(<MetricsOverview metrics={mockMetrics} />);
    expect(screen.getByText('Performance Summary')).toBeInTheDocument();
  });
});