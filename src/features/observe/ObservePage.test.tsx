import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ObservePage } from './ObservePage';

test('renders the network observability shell', () => {
  render(<MemoryRouter><ObservePage /></MemoryRouter>);
  expect(screen.getAllByTestId('kpi-tile')).toHaveLength(5);
  expect(screen.getAllByTestId('record-row').length).toBeGreaterThan(0);
  expect(screen.getByText(/Network briefing/i)).toBeInTheDocument();
});
