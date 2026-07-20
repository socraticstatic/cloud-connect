import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RuleBuilder } from './RuleBuilder';
import { CC } from '../../engine';

describe('RuleBuilder', () => {
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
