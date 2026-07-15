import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ObservabilityShell } from './ObservabilityShell';
import type { ObservabilityBinding } from './ObservabilityBinding';

const fake: ObservabilityBinding = {
  layer: 'network', title: 'Network Observability', columns: ['Flow', 'Gbps', 'Path'],
  kpis: () => [
    { key: 'a', label: 'Throughput', value: '48', unit: 'Gbps' }, { key: 'b', label: 'P95', value: '31', unit: 'ms' },
    { key: 'c', label: 'Egress', value: '$46.5k' }, { key: 'd', label: 'Under control', value: '78', unit: '%' },
    { key: 'e', label: 'Savings', value: '$1.7k' },
  ],
  flowTabs: () => [{ id: 'flow', label: 'Flow' }, { id: 'trend', label: 'Trend' }],
  flowSeries: (tab) => tab === 'flow' ? [{ t: 't0', v: 1 }, { t: 't1', v: 2 }] : [{ t: 't0', v: 9 }],
  groupByOptions: () => [{ id: 'none', label: 'None' }, { id: 'path', label: 'Path' }],
  records: (g) => g === 'path'
    ? [{ id: 'r1', label: 'Private', cells: ['Private', '30', 'private'] }]
    : [{ id: 'r1', label: 'rd-helion', cells: ['rd-helion', '12', 'private'] }, { id: 'r2', label: 'shared', cells: ['shared', '8', 'public'] }],
  briefing: () => ({ narrative: [{ text: '78% flows private', emphasis: 'strong' }], actions: [{ id: 'x', label: 'Show public flows' }], followups: ['Which teams use the Internet path?'] }),
};

describe('ObservabilityShell', () => {
  it('renders 5 KPI tiles, flow tabs, a records row per records(), and the briefing rail', () => {
    render(<ObservabilityShell binding={fake} />);
    expect(screen.getByText('Throughput')).toBeInTheDocument();
    expect(screen.getAllByTestId('kpi-tile')).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Flow' })).toBeInTheDocument();
    expect(screen.getAllByTestId('record-row')).toHaveLength(2);      // default group 'none'
    expect(screen.getByText(/78% flows private/)).toBeInTheDocument(); // briefing
    expect(screen.getByText('Show public flows')).toBeInTheDocument();
  });

  it('changing group-by re-groups the records table', () => {
    render(<ObservabilityShell binding={fake} />);
    fireEvent.change(screen.getByTestId('groupby-select'), { target: { value: 'path' } });
    expect(screen.getAllByTestId('record-row')).toHaveLength(1);
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('switching the flow tab swaps the series', () => {
    render(<ObservabilityShell binding={fake} />);
    fireEvent.click(screen.getByRole('button', { name: 'Trend' }));
    expect(screen.getByTestId('flow-panel').getAttribute('data-tab')).toBe('trend');
  });

  it('renders a neutral (slate, no amber) left-border tone indicator for a row with tone: bad', () => {
    const toneBinding: ObservabilityBinding = {
      ...fake,
      records: () => [{ id: 'r1', label: 'bad-flow', cells: ['bad-flow', '5', 'public'], tone: 'bad' }],
    };
    render(<ObservabilityShell binding={toneBinding} />);
    const row = screen.getByTestId('record-row');
    // De-amber: attention tone now carries a slate left-border, never fw-warn.
    expect(row.className).toContain('border-l-[#94a3b8]');
    expect(row.className).not.toContain('fw-warn');
  });

  it('shows emptyHint in the flow panel when the series is all-zero', () => {
    const empty: ObservabilityBinding = { ...fake, emptyHint: 'No token flow yet', flowSeries: () => [{ t: 't0', v: 0 }, { t: 't1', v: 0 }] };
    render(<ObservabilityShell binding={empty} />);
    expect(screen.getByTestId('flow-empty')).toHaveTextContent('No token flow yet');
  });

});
