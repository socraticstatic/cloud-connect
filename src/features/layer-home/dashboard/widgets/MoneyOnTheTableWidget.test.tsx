import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { MoneyOnTheTableWidget } from './MoneyOnTheTableWidget';
import { CC } from '../../../../engine';
import { advisorDraft } from '../../../discover/stackFigures';

describe('MoneyOnTheTableWidget', () => {
  test('states available savings and lists the top unattached bucket', () => {
    render(<MoneyOnTheTableWidget />);
    const arb = CC.arbitrage();
    expect(screen.getByText(`$${Math.round(arb.availableSavings).toLocaleString()}/mo`)).toBeInTheDocument();
    const topUnattached = arb.buckets.find(b => !b.attached);
    if (topUnattached) expect(screen.getByText(topUnattached.label)).toBeInTheDocument();
  });

  test('Review commits the advisor draft through the real engine', () => {
    const before = advisorDraft(CC).moves;

    render(<MoneyOnTheTableWidget />);
    const button = screen.getByTestId('money-review');

    if (before.length === 0) {
      // Nothing for the advisor to recommend against this seed: the button
      // must be disabled rather than the test asserting nothing real.
      expect(button).toBeDisabled();
      return;
    }
    expect(button).not.toBeDisabled();

    // steerFlow (unlike provisionRegion's activateOnramp) pushes no undo
    // entry, so `steered` survives CC.undo() entirely. Record which flows
    // this click is about to steer so cleanup can revert them by hand.
    const steerFlowIds = before.filter(m => m.kind === 'steer').map(m => m.flowId);
    const attachedBefore = CC.fabricModel().regions.filter(r => r.attached).length;

    act(() => {
      fireEvent.click(button);
    });

    const after = advisorDraft(CC).moves;
    // This is the assertion that fails against a no-op onClick: an unwired
    // handler leaves the draft, and therefore its length, untouched.
    expect(after.length).toBeLessThan(before.length);

    if (before.some(m => m.kind === 'attach')) {
      const attachedAfter = CC.fabricModel().regions.filter(r => r.attached).length;
      expect(attachedAfter).toBeGreaterThan(attachedBefore);
    }

    // Cleanup: CC is a shared singleton, so leftover mutations could make
    // this test's outcome depend on run order. Restore it in two parts,
    // because CC.undo() alone does not round-trip a commit like this one
    // (observed directly: move count 10 -> 8 after a commit + single undo,
    // because steerFlow's mutation of `steered` is invisible to the undo
    // stack's snapshot/restore). Revert steers explicitly, then unwind every
    // undo entry the attaches pushed by draining the stack completely.
    act(() => {
      steerFlowIds.forEach(flowId => CC.clearSteer(flowId));
      while (CC.canUndo()) CC.undo();
    });

    expect(advisorDraft(CC).moves).toEqual(before);
    expect(CC.fabricModel().regions.filter(r => r.attached).length).toBe(attachedBefore);
  });
});
