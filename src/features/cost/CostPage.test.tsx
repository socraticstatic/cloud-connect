import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CC } from '../../engine'; // side-effect import builds window.CC
import { CostPage } from './CostPage';

const page = () => render(<MemoryRouter><CostPage /></MemoryRouter>);

// The steer test mutates routing state, which persists for the rest of this
// test file (fresh per file, not per test). Revert anything steered so test
// order doesn't matter.
const steeredThisFile = new Set<string>();

afterEach(() => {
  steeredThisFile.forEach(flowId => CC.clearSteer(flowId));
  steeredThisFile.clear();
});

it('hero band renders savings, monthly total, public exposure, and commit meter from the engine', () => {
  page();
  expect(screen.getByText('Savings identified')).toBeInTheDocument();
  expect(screen.getByText('This month')).toBeInTheDocument();
  expect(screen.getByText('Public exposure')).toBeInTheDocument();
  expect(screen.getByRole('meter', { name: /commit/i })).toBeInTheDocument();
});

it('identified savings stay coherent with the invoice (never exceed total + public spend)', () => {
  page();
  // Read the rendered hero figure (StatTile puts the value right after the label).
  const valueText = screen.getByText('Savings identified').nextElementSibling?.textContent ?? '';
  const identified = Number(valueText.replace(/[^0-9]/g, ''));
  expect(identified).toBeGreaterThan(0);
  expect(identified).toBeLessThan(CC.billing().total + CC.egress().pub);
});

it('invoice renders one row per billing line', () => {
  page();
  const lines = CC.billing().lines;
  for (const l of lines) expect(screen.getByText(l.item)).toBeInTheDocument();
});

it('steering from a recommendation removes it and narrates the capture', async () => {
  page();
  const recs = CC.routeAdvisor().recommendations.filter(r => r.action === 'steer');
  if (recs.length === 0) return; // engine state already fully steered
  // routeAdvisor caps at 5 recommendations, so a fixed backlog of "diversify"
  // recs can backfill a just-steered flow's vacated slot with the *next*
  // eligible steer candidate — the overall filtered count doesn't reliably
  // drop. Assert on the specific recommendation's identity instead, which is
  // what "steering removes it" actually means.
  const target = recs[0];
  steeredThisFile.add(target.flowId);
  const btn = screen.getAllByRole('button', { name: /steer to save/i })[0];
  fireEvent.click(btn);
  await waitFor(() =>
    expect(CC.routeAdvisor().recommendations.some(r => r.id === target.id)).toBe(false));
  expect(screen.getByText(/captured/i)).toBeInTheDocument();
});
