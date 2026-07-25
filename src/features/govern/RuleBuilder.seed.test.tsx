import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import { RuleBuilder } from './RuleBuilder';
import { CC } from '../../engine';

describe('RuleBuilder seeded from a proposal', () => {
  test('opens pre-filled from the named rule and says where it came from', async () => {
    const rule = CC.ruleList().find((r: { id: string }) => r.id === 'pol-dns')!;
    render(<MemoryRouter><RuleBuilder seed={{ ruleId: 'pol-dns' }} /></MemoryRouter>);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect((screen.getByLabelText(/rule name/i) as HTMLInputElement).value).toContain(rule.name);
    expect(screen.getByTestId('rule-provenance')).toHaveTextContent(/proposed by andi/i);
  });
});
