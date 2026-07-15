import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatTile } from './StatTile';

describe('StatTile', () => {
  it('renders label, value, and a good delta', () => {
    render(<StatTile label="Savings identified" value="$4,700/mo" delta={{ text: '+$310 this session', tone: 'good' }} />);
    expect(screen.getByText('Savings identified')).toBeInTheDocument();
    expect(screen.getByText('$4,700/mo')).toBeInTheDocument();
    expect(screen.getByText('+$310 this session')).toHaveClass('text-[#00a862]');
  });

  it('renders a meter when provided', () => {
    render(<StatTile label="Commit draw" value="$27,400" meter={{ pct: 91, label: '91% of $30,000 commit' }} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '91');
  });
});
