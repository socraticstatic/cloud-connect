import { render, screen } from '@testing-library/react';
import { CC } from '../../engine';
import { PathTable } from './PathTable';

it('every flow row carries a $/GB CostChip', () => {
  render(<PathTable />);
  const flows = CC.routeFlows();
  const chips = screen.getAllByText(/\$\d+\.\d{2}\/GB/);
  expect(chips.length).toBeGreaterThanOrEqual(flows.length);
});
