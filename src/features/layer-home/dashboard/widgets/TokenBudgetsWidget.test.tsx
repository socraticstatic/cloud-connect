import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, afterEach, vi } from 'vitest';
import { TokenBudgetsWidget } from './TokenBudgetsWidget';
import { CC } from '../../../../engine';

/* Navigation is asserted by destination, not by router internals — same
   pattern IntentThreads.tsx's own tests use. */
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...(actual as object), useNavigate: () => mockNavigate };
});

afterEach(() => { mockNavigate.mockClear(); });

const renderWidget = () => render(<MemoryRouter><TokenBudgetsWidget /></MemoryRouter>);

describe('TokenBudgetsWidget', () => {
  test('renders one row per token policy with its tag', () => {
    renderWidget();
    const policies = CC.tokenPolicyList();
    expect(policies.length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('token-policy-row')).toHaveLength(policies.length);
    expect(screen.getByText(policies[0].tag)).toBeInTheDocument();
  });

  test('Enforce stages the policy patch into the review tray, without mutating the estate', () => {
    const draft = CC.tokenPolicyList().find(p => !p.enforced);
    expect(draft).toBeTruthy();
    const tag = draft!.tag;

    renderWidget();
    const row = screen.getByText(tag).closest('li')!;
    const button = within(row).getByTestId('token-enforce');

    fireEvent.click(button);

    // Fails against a no-op onClick: an unwired handler never calls navigate.
    expect(mockNavigate).toHaveBeenCalledWith(`/discover?draft=policy-${tag}`);

    // Staging is not committing: the policy's enforced flag must be untouched.
    expect(CC.tokenPolicyList().find(p => p.tag === tag)?.enforced).toBe(false);
  });
});
