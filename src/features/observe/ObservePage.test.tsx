import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CC } from '../../engine';
import { ObservePage } from './ObservePage';

test('renders telemetry-derived content from the engine', () => {
  render(<MemoryRouter><ObservePage /></MemoryRouter>);
  const t = CC.telemetry(56);
  expect(t.regions.length).toBeGreaterThan(0);
  // a region name from the engine appears in the rendered dashboard
  expect(screen.getByText(new RegExp(t.regions[0].name, 'i'))).toBeInTheDocument();
});
