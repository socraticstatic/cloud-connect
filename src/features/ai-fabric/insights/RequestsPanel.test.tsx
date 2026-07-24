import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { CC } from '../../../engine';
import { KpiStrip } from './KpiStrip';
import { RequestsFilterBar } from './RequestsFilterBar';
import { RequestsTable } from './RequestsTable';
import {
  insightKpis,
  requestRows,
  applyFilters,
  EMPTY_FILTERS,
  type RequestFilters,
} from './insightsFigures';

/* The three request-panel pieces, wired the way InsightsPage wires them:
   filter state above, derivation between, table below. The engine is driven
   (promptTrace) rather than mocked - these are the rows a user would see. */

function Harness() {
  const [filters, setFilters] = useState<RequestFilters>(EMPTY_FILTERS);
  const rows = requestRows(CC);
  const visible = applyFilters(rows, filters);
  return (
    <div>
      <RequestsFilterBar rows={rows} filters={filters} onChange={setFilters} />
      <RequestsTable rows={visible} />
    </div>
  );
}

describe('KpiStrip', () => {
  it('renders the five engine KPIs', () => {
    render(<KpiStrip kpis={insightKpis(CC)} />);
    ['tokens', 'cost', 'ttft', 'requests', 'blocked'].forEach(key => {
      expect(screen.getByTestId(`kpi-${key}`)).toBeInTheDocument();
    });
    expect(screen.getByTestId('kpi-ttft')).toHaveTextContent('ms');
  });
});

describe('Requests panel', () => {
  it('a driven allowed trace renders 200 with green savings; a denial renders 403 with its reason', () => {
    CC.promptTrace!('rd-helion', 'helion-70b', 'requests panel test');
    CC.promptTrace!('classified-helion', 'gpt-class', 'requests panel test');
    render(<Harness />);
    const table = screen.getByTestId('requests-table');
    const denied = within(table).getAllByText('403');
    expect(denied.length).toBeGreaterThan(0);
    expect(within(table).getAllByText('200').length).toBeGreaterThan(0);
    expect(within(table).getAllByText(/no external models/i).length).toBeGreaterThan(0);
    // The allowed helion row carries a green savings cell with a percent line.
    const row = within(table).getAllByTestId(/^req-row-/).find(r =>
      r.textContent?.includes('rd-helion'),
    )!;
    expect(within(row).getByText(/%$/)).toBeInTheDocument();
  });

  it('search narrows, chips appear and clear, Clear all restores', () => {
    render(<Harness />);
    const countBefore = screen.getAllByTestId(/^req-row-/).length;
    expect(countBefore).toBeGreaterThanOrEqual(2);

    fireEvent.change(screen.getByTestId('req-search'), { target: { value: 'helion-70b' } });
    const narrowed = screen.getAllByTestId(/^req-row-/);
    expect(narrowed.length).toBeLessThan(countBefore);
    expect(screen.getByTestId('req-chip-q')).toHaveTextContent('helion-70b');

    fireEvent.change(screen.getByTestId('req-filter-status'), { target: { value: '403' } });
    expect(screen.getByTestId('req-chip-status')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('req-clear-all'));
    expect(screen.queryByTestId('req-chip-q')).toBeNull();
    expect(screen.getAllByTestId(/^req-row-/).length).toBe(countBefore);
  });

  it('a single chip × clears only its own key', () => {
    render(<Harness />);
    fireEvent.change(screen.getByTestId('req-filter-identity'), { target: { value: 'rd-helion' } });
    fireEvent.change(screen.getByTestId('req-search'), { target: { value: 'helion' } });
    expect(screen.getByTestId('req-chip-identity')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Clear Identity filter'));
    expect(screen.queryByTestId('req-chip-identity')).toBeNull();
    expect(screen.getByTestId('req-chip-q')).toBeInTheDocument();
  });
});
