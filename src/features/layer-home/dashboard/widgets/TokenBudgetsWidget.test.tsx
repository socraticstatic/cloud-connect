import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { TokenBudgetsWidget } from './TokenBudgetsWidget';
import { CC } from '../../../../engine';

describe('TokenBudgetsWidget', () => {
  test('renders one row per token policy with its tag', () => {
    render(<TokenBudgetsWidget />);
    const policies = CC.tokenPolicyList();
    expect(policies.length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('token-policy-row')).toHaveLength(policies.length);
    expect(screen.getByText(policies[0].tag)).toBeInTheDocument();
  });

  test('Enforce mutates the real policy via CC.setTokenPolicy', () => {
    const draft = CC.tokenPolicyList().find(p => !p.enforced);
    expect(draft).toBeTruthy();
    const tag = draft!.tag;

    render(<TokenBudgetsWidget />);
    const buttons = screen.getAllByTestId('token-enforce');
    const row = screen.getByText(tag).closest('li')!;
    const button = Array.from(row.querySelectorAll('[data-testid="token-enforce"]'))[0] as HTMLElement;
    expect(button).toBeTruthy();
    expect(buttons.length).toBeGreaterThan(0);

    act(() => {
      fireEvent.click(button);
    });

    const updated = CC.tokenPolicyList().find(p => p.tag === tag);
    expect(updated?.enforced).toBe(true);

    // Clean up so test order cannot matter for other tests / suites.
    act(() => {
      CC.setTokenPolicy(tag, { enforced: false });
    });
    expect(CC.tokenPolicyList().find(p => p.tag === tag)?.enforced).toBe(false);
  });
});
