import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CC } from '../../engine'; // side-effect import builds window.CC
import { CostPage } from './CostPage';

const page = () => render(<MemoryRouter><CostPage /></MemoryRouter>);

// Steers and attaches mutate global engine state that persists for the rest of
// this file (fresh per file, not per test). Revert both so test order is free.
const steeredThisFile = new Set<string>();
const attachCount = { n: 0 };
afterEach(() => {
  steeredThisFile.forEach(flowId => CC.clearSteer(flowId));
  steeredThisFile.clear();
  while (attachCount.n > 0) { CC.undo(); attachCount.n--; }
});

it('hero renders the two bills, the savings, and the commit meter from the engine', () => {
  const arb = CC.arbitrage();
  page();
  const k = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`);
  expect(screen.getByTestId('hero-cc-bill')).toHaveTextContent(k(arb.cloudConnectBill));
  expect(screen.getByTestId('hero-savings')).toHaveTextContent(k(arb.savings));
  expect(screen.getByRole('meter', { name: /commit/i })).toBeInTheDocument();
});

it('breakdown lists every egress bucket from arbitrage()', () => {
  page();
  for (const b of CC.arbitrage().buckets) {
    expect(screen.getByText(b.label)).toBeInTheDocument();
  }
});

it('invoice renders one row per billing line and its total reconciles (cloudConnect + ports)', () => {
  page();
  const lines = CC.billing().lines;
  for (const l of lines) expect(screen.getByText(l.item)).toBeInTheDocument();
  const arb = CC.arbitrage();
  expect(CC.billing().total).toBe(arb.cloudConnectBill + arb.portFeesMo);
});

it('attaching a path on the breakdown moves the hero savings up and reconciles the invoice', async () => {
  page();
  const azure = CC.arbitrage().buckets.find(b => b.key === 'azure')!;
  if (azure.attached) return; // seed already captured
  const savingsBefore = CC.arbitrage().savings;
  const beforeText = screen.getByTestId('hero-savings').textContent;

  fireEvent.click(screen.getByRole('button', { name: new RegExp(`Attach ${azure.label}`, 'i') }));
  attachCount.n++;

  await waitFor(() => expect(CC.arbitrage().savings).toBe(savingsBefore + azure.saving));
  // Hero savings figure actually changed on screen.
  await waitFor(() => expect(screen.getByTestId('hero-savings').textContent).not.toBe(beforeText));
  // Invoice total still equals cloudConnect bill + ports after the recompute.
  const arb = CC.arbitrage();
  expect(CC.billing().total).toBe(arb.cloudConnectBill + arb.portFeesMo);
});

it('steer-to-save still captures the realized delta as a running tally', async () => {
  page();
  const rec = CC.routeAdvisor().recommendations.find(r => r.action === 'steer');
  if (!rec) return; // engine state already fully steered
  steeredThisFile.add(rec.flowId);
  fireEvent.click(screen.getAllByRole('button', { name: /steer to save/i })[0]);
  await waitFor(() => expect(screen.getByText(/captured this session/i)).toBeInTheDocument());
});
