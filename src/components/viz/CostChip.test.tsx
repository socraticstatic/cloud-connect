import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CostChip } from './CostChip';

describe('CostChip', () => {
  it('formats per-GB cost and applies tone', () => {
    render(<CostChip perGb={0.02} tone="controlled" />);
    const chip = screen.getByText('$0.02/GB');
    expect(chip).toHaveClass('text-[#0057b8]');
  });

  it('public tone renders amber', () => {
    render(<CostChip perGb={0.09} tone="public" />);
    expect(screen.getByText('$0.09/GB')).toHaveClass('text-[#b45309]');
  });

  it('saving tone renders green', () => {
    render(<CostChip perGb={0.01} tone="saving" />);
    expect(screen.getByText('$0.01/GB')).toHaveClass('text-[#00a862]');
  });
});
