import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RuleBuilder } from './RuleBuilder';
import { CC } from '../../engine';

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// The default form spec RuleBuilder starts with (matches INITIAL_FORM in
// RuleBuilder.tsx) - kept here so the dry-run test can ask the real engine
// what it thinks that spec does, rather than hardcoding the answer.
const DEFAULT_SPEC = {
  name: '',
  src: { tag: 'any', cloud: 'any' },
  dst: 'any',
  ports: 'any',
  action: 'deny',
  chain: [] as string[],
};

describe('RuleBuilder', () => {
  it('renders a dry-run preview that matches what CC.dryRun actually returns for the current spec', () => {
    render(<RuleBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /new rule/i }));
    fireEvent.click(screen.getByRole('button', { name: /dry run/i }));

    // Ask the real engine, independently of the component, what the
    // on-screen (default) form spec should produce.
    const expected = CC.dryRun(DEFAULT_SPEC) as {
      matched: unknown[];
      gbps: number;
      blocked: number;
      shadowed: unknown[];
    };

    const noun = `flow${expected.matched.length === 1 ? '' : 's'}`;
    const summary = `${expected.matched.length} ${noun} matched · ${expected.gbps} Gbps · ${expected.blocked} blocked`;
    expect(screen.getByText(new RegExp(escapeRegExp(summary)))).toBeInTheDocument();

    if (expected.shadowed.length > 0) {
      expect(
        screen.getByText(new RegExp(`${expected.shadowed.length} shadowed by a higher-priority rule`))
      ).toBeInTheDocument();
    }
  });

  it('changing a field after a dry run clears the now-stale preview', () => {
    render(<RuleBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /new rule/i }));
    fireEvent.click(screen.getByRole('button', { name: /dry run/i }));
    expect(screen.getByText(/matched/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/action/i), { target: { value: 'allow' } });
    expect(screen.queryByText(/matched/i)).not.toBeInTheDocument();
  });

  it('Cancel resets the form to its initial state, including the preview', () => {
    render(<RuleBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /new rule/i }));

    fireEvent.change(screen.getByLabelText(/rule name/i), { target: { value: 'half-typed-name' } });
    fireEvent.change(screen.getByLabelText(/action/i), { target: { value: 'inspect' } });
    fireEvent.click(screen.getByRole('button', { name: /dry run/i }));
    expect(screen.getByText(/matched/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Reopen and confirm none of the previous session's state survived.
    fireEvent.click(screen.getByRole('button', { name: /new rule/i }));
    expect(screen.getByLabelText(/rule name/i)).toHaveValue('');
    expect(screen.getByLabelText(/action/i)).toHaveValue('deny');
    expect(screen.queryByText(/matched/i)).not.toBeInTheDocument();
  });

  it('does not offer intra-group / not-intra-group as destinations (no src.group control exists yet)', () => {
    render(<RuleBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /new rule/i }));
    const dstSelect = screen.getByLabelText(/destination/i) as HTMLSelectElement;
    const values = Array.from(dstSelect.options).map(o => o.value);
    expect(values).not.toContain('intra-group');
    expect(values).not.toContain('not-intra-group');
  });

  it('adds a rule to the engine when submitted', () => {
    const before = (CC.ruleList() as unknown[]).length;
    render(<RuleBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /new rule/i }));
    fireEvent.change(screen.getByLabelText(/rule name/i), {
      target: { value: 'test-rule-task1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^add rule$/i }));
    const after = CC.ruleList() as { name: string }[];
    expect(after.length).toBe(before + 1);
    expect(after.map(r => r.name)).toContain('test-rule-task1');
  });
});
