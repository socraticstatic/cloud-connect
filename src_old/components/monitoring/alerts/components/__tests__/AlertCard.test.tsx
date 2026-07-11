import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertCard } from '../AlertCard';
import { Activity } from 'lucide-react';

describe('AlertCard', () => {
  const mockAlert = {
    id: '1',
    type: 'critical' as const,
    title: 'Test Alert',
    message: 'Test Message',
    timestamp: '2024-03-10T15:30:00Z',
    connectionId: '1',
    icon: Activity
  };

  const mockDismiss = vi.fn();

  it('renders alert title and message', () => {
    render(<AlertCard alert={mockAlert} />);
    
    expect(screen.getByText('Test Alert')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('formats timestamp correctly', () => {
    render(<AlertCard alert={mockAlert} />);
    
    const formattedTime = new Date(mockAlert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    expect(screen.getByText(formattedTime)).toBeInTheDocument();
  });

  it('applies correct styles based on alert type', () => {
    const { container } = render(<AlertCard alert={mockAlert} />);
    
    // Critical alert should have red styling
    expect(container.firstChild).toHaveClass('bg-red-50', 'border-red-200');
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    render(<AlertCard alert={mockAlert} onDismiss={mockDismiss} />);
    
    // Find and click the dismiss button
    const dismissButton = screen.getByLabelText('Dismiss alert');
    fireEvent.click(dismissButton);
    
    expect(mockDismiss).toHaveBeenCalledWith(mockAlert.id);
  });

  it('renders with warning styles', () => {
    const warningAlert = { ...mockAlert, type: 'warning' as const };
    const { container } = render(<AlertCard alert={warningAlert} />);
    
    expect(container.firstChild).toHaveClass('bg-amber-50', 'border-amber-200');
  });

  it('renders with info styles', () => {
    const infoAlert = { ...mockAlert, type: 'info' as const };
    const { container } = render(<AlertCard alert={infoAlert} />);
    
    expect(container.firstChild).toHaveClass('bg-brand-lightBlue', 'border-brand-blue/20');
  });
});