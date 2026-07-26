import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, afterEach, vi } from 'vitest';
import { TokenPolicyBuilder } from './TokenPolicyBuilder';
import { takePendingPolicySpec } from '../discover/stackFigures';
import { CC } from '../../engine';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual<typeof import('react-router-dom')>('react-router-dom')),
  useNavigate: () => navigate,
}));

afterEach(() => { navigate.mockClear(); takePendingPolicySpec(); while (CC.canUndo()) CC.undo(); });

const open = () => render(
  <MemoryRouter><TokenPolicyBuilder open onOpenChange={() => {}} /></MemoryRouter>,
);

describe('TokenPolicyBuilder', () => {
  test('is a dialog that focuses its first field', async () => {
    open();
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText(/identity/i)).toHaveFocus());
  });

  test('previews against the real engine and recomputes as fields change', async () => {
    open();
    const preview = await screen.findByTestId('policy-preview');
    const first = preview.textContent;
    fireEvent.change(screen.getByLabelText(/budget/i), { target: { value: '1' } });
    await waitFor(() => expect(screen.getByTestId('policy-preview').textContent).not.toBe(first));
  });

  test('an untouched form cannot be staged', async () => {
    open();
    await screen.findByRole('dialog');
    expect(screen.getByTestId('policy-stage')).toBeDisabled();
  });

  test('staging hands the spec over and navigates, and never mutates the engine', async () => {
    const before = JSON.stringify(CC.tokenPolicyList());
    open();
    await screen.findByRole('dialog');
    fireEvent.change(screen.getByLabelText(/budget/i), { target: { value: '750000' } });
    fireEvent.click(screen.getByTestId('policy-stage'));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/discover?draft=policy-new'));
    const staged = takePendingPolicySpec()!;
    expect(staged.budget).toBe(750000);
    expect(JSON.stringify(CC.tokenPolicyList())).toBe(before);
  });

  test('edit mode seeds from the existing policy and locks the identity', async () => {
    render(
      <MemoryRouter>
        <TokenPolicyBuilder open onOpenChange={() => {}} editTag="rd-helion" />
      </MemoryRouter>,
    );
    await screen.findByRole('dialog');
    const existing = CC.tokenPolicy('rd-helion') as { budget: number; scope: string };
    expect((screen.getByLabelText(/budget/i) as HTMLInputElement).value).toBe(String(existing.budget));
    expect(screen.getByLabelText(/identity/i)).toBeDisabled();
  });

  // Finding 1: Number('') coerces a cleared Budget field to 0. The engine's
  // meter reads that as "at capacity" the instant it's enforced (a division
  // by zero the meter computes as 100%), and combined with an enforce-mode
  // cap-token-spend intent that denies every request for the identity - with
  // no warning anywhere and Stage still enabled, since 0 differs from the
  // initial 1,000,000 and the `untouched` guard only checks for difference.
  test('a cleared budget cannot be staged and names the problem explicitly', async () => {
    open();
    await screen.findByRole('dialog');
    fireEvent.change(screen.getByLabelText(/budget/i), { target: { value: '' } });
    expect(screen.getByTestId('policy-stage')).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(/budget/i);
    // Defense in depth: submit() must refuse even if the disabled attribute
    // were ever bypassed.
    fireEvent.click(screen.getByTestId('policy-stage'));
    expect(navigate).not.toHaveBeenCalled();
    // The preview must not silently render nothing in this state.
    expect(screen.getByTestId('policy-preview')).toHaveTextContent(/budget/i);
  });

  test('a negative or zero budget is treated the same as a cleared one', async () => {
    open();
    await screen.findByRole('dialog');
    fireEvent.change(screen.getByLabelText(/budget/i), { target: { value: '-5' } });
    expect(screen.getByTestId('policy-stage')).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(/budget/i);
  });

  // Finding 2: softPct has the same Number('') === 0 coercion. It has no
  // masking effect on the preview today, but a percent outside 1-100 is
  // still meaningless and should block Stage the same way.
  test('an Alert-at percent outside 1-100 cannot be staged and names the problem', async () => {
    open();
    await screen.findByRole('dialog');
    fireEvent.change(screen.getByLabelText(/alert at/i), { target: { value: '' } });
    expect(screen.getByTestId('policy-stage')).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(/alert at/i);
  });

  // Finding 3: `untouched` compares against INITIAL_FORM, not the seeded
  // values, so in edit mode Stage is enabled from the first render - the
  // same "accept the seeded draft as-is" idiom RuleBuilder's seed prop
  // documents. Made explicit here rather than left as an untested side
  // effect.
  test('edit mode enables Stage immediately, before any field is touched', async () => {
    render(
      <MemoryRouter>
        <TokenPolicyBuilder open onOpenChange={() => {}} editTag="rd-helion" />
      </MemoryRouter>,
    );
    await screen.findByRole('dialog');
    expect(screen.getByTestId('policy-stage')).not.toBeDisabled();
  });
});
