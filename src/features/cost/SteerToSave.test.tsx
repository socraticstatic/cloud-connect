import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { CC } from '../../engine';
import { SteerToSave } from './SteerToSave';

/**
 * "Captured this session" must equal the ACTUAL realized bill delta the engine
 * produces — the drop in egress().total — not a divergent re-normalized
 * estimate. Fresh window.CC per file; revert steers after each test.
 */
const steered = new Set<string>();
afterEach(() => {
  steered.forEach(id => CC.clearSteer(id));
  steered.clear();
});

describe('SteerToSave', () => {
  it('captured equals the realized drop in egress().total from the steer', async () => {
    const rec = CC.routeAdvisor().recommendations.find(r => r.action === 'steer');
    if (!rec) return; // seed already fully steered
    steered.add(rec.flowId);

    const beforeTotal = CC.egress().total;
    render(<SteerToSave />);
    fireEvent.click(screen.getAllByRole('button', { name: /steer to save/i })[0]);

    const realized = beforeTotal - CC.egress().total;
    expect(realized).toBeGreaterThan(0);
    await waitFor(() =>
      expect(screen.getByText(/captured this session/i)).toBeInTheDocument());
    // The headline shows exactly the realized delta (rounded, with thousands separators).
    expect(
      screen.getByText(new RegExp(`\\$${Math.round(realized).toLocaleString()}/mo captured`, 'i')),
    ).toBeInTheDocument();
  });

  it('never captures more than the public exposure it was carved from', () => {
    const publicBefore = CC.egress().pub;
    let captured = 0;
    for (let i = 0; i < 20; i++) {
      const rec = CC.routeAdvisor().recommendations.find(r => r.action === 'steer');
      if (!rec || steered.has(rec.flowId)) break;
      const before = CC.egress().total;
      CC.steerFlow(rec.flowId, rec.pathId);
      captured += before - CC.egress().total;
      steered.add(rec.flowId);
    }
    expect(captured).toBeLessThanOrEqual(publicBefore);
  });
});
