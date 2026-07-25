import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, afterEach } from 'vitest';
import { RuleBuilder } from './RuleBuilder';
import { CC } from '../../engine';

afterEach(() => { while (CC.canUndo()) CC.undo(); });

describe('RuleBuilder live preview', () => {
  test('recomputes as fields change instead of clearing', async () => {
    render(<RuleBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /new rule/i }));
    await screen.findByRole('dialog');
    fireEvent.change(screen.getByLabelText(/rule name/i), { target: { value: 'live preview rule' } });
    // A preview exists without ever pressing a Dry run button.
    const preview = await screen.findByTestId('rule-preview');
    const firstText = preview.textContent;
    fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'dns-exfil' } });
    await waitFor(() => {
      expect(screen.getByTestId('rule-preview').textContent).not.toBe(firstText);
    });
  });

  test('names the rule that shadows, not just how many', async () => {
    render(<RuleBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /new rule/i }));
    await screen.findByRole('dialog');
    // Author a spec the seeded system rules already cover.
    fireEvent.change(screen.getByLabelText(/rule name/i), { target: { value: 'shadowed rule' } });
    fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'dns-exfil' } });
    const preview = await screen.findByTestId('rule-preview');
    const dry = CC.dryRun({
      name: 'shadowed rule', src: { tag: 'any', cloud: 'any' },
      dst: 'dns-exfil', ports: 'any', action: 'deny', chain: [],
    }) as { shadowed: { by: string }[] };
    if (dry.shadowed.length) {
      expect(preview.textContent).toContain(dry.shadowed[0].by);
    }
  });
});
