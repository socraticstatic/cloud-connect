import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyAlertState } from '../EmptyAlertState';

describe('EmptyAlertState', () => {
  it('renders empty state message', () => {
    render(<EmptyAlertState />);
    
    expect(screen.getByText('No active alerts for the selected connection')).toBeInTheDocument();
  });

  it('includes an icon', () => {
    const { container } = render(<EmptyAlertState />);
    
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});