import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/utils';
import { ConnectionWizard } from './ConnectionWizard';

describe('ConnectionWizard', () => {
  const mockOnComplete = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the initial step correctly', () => {
    render(
      <ConnectionWizard 
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Check for provider selection
    expect(screen.getByText('Select Cloud Provider')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument();
    expect(screen.getByText('Azure')).toBeInTheDocument();
    expect(screen.getByText('Google Cloud')).toBeInTheDocument();
  });

  it('navigates through steps correctly', async () => {
    render(
      <ConnectionWizard 
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Step 1: Select Provider
    fireEvent.click(screen.getByText('AWS'));
    
    // Step 2: Should show connection types
    await waitFor(() => {
      expect(screen.getByText('AWS Direct Connect')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('AWS Direct Connect'));

    // Step 3: Should show bandwidth and location
    await waitFor(() => {
      expect(screen.getByText('Select Bandwidth')).toBeInTheDocument();
    });

    // Select bandwidth
    fireEvent.click(screen.getByText('10 Gbps'));
    
    // Select location
    fireEvent.click(screen.getByText('US East'));

    // Step 4: Should show advanced settings
    await waitFor(() => {
      expect(screen.getByText('Advanced Settings')).toBeInTheDocument();
    });

    // Move to review
    fireEvent.click(screen.getByText('Continue to Review'));

    // Step 5: Should show review screen
    await waitFor(() => {
      expect(screen.getByText('Review Configuration')).toBeInTheDocument();
    });
  });

  it('validates required fields before proceeding', async () => {
    render(
      <ConnectionWizard 
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Try to proceed without selecting provider
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();

    // Select provider
    fireEvent.click(screen.getByText('AWS'));
    expect(nextButton).not.toBeDisabled();
  });

  it('handles cancellation correctly', () => {
    render(
      <ConnectionWizard 
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('submits the form with correct data', async () => {
    render(
      <ConnectionWizard 
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Complete all steps
    fireEvent.click(screen.getByText('AWS'));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('AWS Direct Connect'));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText('10 Gbps'));
      fireEvent.click(screen.getByText('US East'));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Continue to Review'));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Create Connection'));
    });

    expect(mockOnComplete).toHaveBeenCalledWith({
      provider: 'AWS',
      type: 'AWS Direct Connect',
      bandwidth: '10 Gbps',
      location: 'US East'
    });
  });
});