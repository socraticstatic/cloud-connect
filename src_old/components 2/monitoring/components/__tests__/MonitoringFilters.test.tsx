import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MonitoringFilters } from '../MonitoringFilters';

describe('MonitoringFilters', () => {
  const mockConnections = [
    { id: '1', name: 'Connection 1' },
    { id: '2', name: 'Connection 2' }
  ];

  const defaultProps = {
    selectedConnection: 'all',
    timeRange: '1h',
    connections: mockConnections,
    onConnectionChange: vi.fn(),
    onTimeRangeChange: vi.fn()
  };

  it('renders connection selector with all options', () => {
    render(<MonitoringFilters {...defaultProps} />);
    
    expect(screen.getByText('All Connections (Cumulative)')).toBeInTheDocument();
    expect(screen.getByText('Connection 1')).toBeInTheDocument();
    expect(screen.getByText('Connection 2')).toBeInTheDocument();
  });

  it('renders time range selector with all options', () => {
    render(<MonitoringFilters {...defaultProps} />);
    
    expect(screen.getByText('Last Hour')).toBeInTheDocument();
    expect(screen.getByText('Last 6 Hours')).toBeInTheDocument();
    expect(screen.getByText('Last 24 Hours')).toBeInTheDocument();
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
    expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
  });

  it('calls onConnectionChange when connection selection changes', () => {
    render(<MonitoringFilters {...defaultProps} />);
    
    const select = screen.getByLabelText('View Statistics For');
    fireEvent.change(select, { target: { value: '1' } });
    
    expect(defaultProps.onConnectionChange).toHaveBeenCalledWith('1');
  });

  it('calls onTimeRangeChange when time range selection changes', () => {
    render(<MonitoringFilters {...defaultProps} />);
    
    const select = screen.getByRole('combobox', { name: '' }); // Time range select
    fireEvent.change(select, { target: { value: '24h' } });
    
    expect(defaultProps.onTimeRangeChange).toHaveBeenCalledWith('24h');
  });
});