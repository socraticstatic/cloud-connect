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
});
