import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

  it('offers intra-group / not-intra-group as destinations now that a source-group control exists', () => {
    render(<RuleBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /new rule/i }));
    const dstSelect = screen.getByLabelText(/destination/i) as HTMLSelectElement;
    const values = Array.from(dstSelect.options).map(o => o.value);
    expect(values).toContain('intra-group');
    expect(values).toContain('not-intra-group');
  });

  it('offers every live group as a source', () => {
    render(<RuleBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /new rule/i }));
    const srcGroup = screen.getByLabelText(/source group/i) as HTMLSelectElement;
    const values = Array.from(srcGroup.options).map(o => o.value);
    (CC.groupList() as { id: string }[]).forEach(g => expect(values).toContain(g.id));
  });

  it('offers every live group as a destination', () => {
    render(<RuleBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /new rule/i }));
    const dstSelect = screen.getByLabelText(/destination/i) as HTMLSelectElement;
    const values = Array.from(dstSelect.options).map(o => o.value);
    (CC.groupList() as { id: string }[]).forEach(g => expect(values).toContain(`group:${g.id}`));
  });

  /* The whole point of the feature: west-branches → west-workloads must be
     expressible in the form AND must dry-run to a non-empty match set. A
     group policy that silently matches nothing is the failure this exists
     to prevent. */
  it('dry-runs a group-to-group rule to the same non-empty result the engine returns', () => {
    render(<RuleBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /new rule/i }));
    fireEvent.change(screen.getByLabelText(/source group/i), { target: { value: 'west-branches' } });
    fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'group:west-workloads' } });
    fireEvent.change(screen.getByLabelText(/action/i), { target: { value: 'allow' } });
    fireEvent.click(screen.getByRole('button', { name: /dry run/i }));

    const expected = CC.dryRun({
      name: '',
      src: { tag: 'any', cloud: 'any', group: 'west-branches' },
      dst: { group: 'west-workloads' },
      ports: 'any',
      action: 'allow',
      chain: [],
    }) as { matched: { flow: { srcName: string } }[]; gbps: number; blocked: number };

    expect(expected.matched.length).toBeGreaterThan(0);
    const summary = `${expected.matched.length} flows matched · ${expected.gbps} Gbps · ${expected.blocked} blocked`;
    expect(screen.getByText(new RegExp(escapeRegExp(summary)))).toBeInTheDocument();

    // and it NAMES what it matched, not just a count
    const firstSrc = expected.matched[0].flow.srcName;
    expect(screen.getAllByText(new RegExp(escapeRegExp(firstSrc))).length).toBeGreaterThan(0);
  });

  it('persists src.group and dst.group onto the rule it adds', () => {
    render(<RuleBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /new rule/i }));
    fireEvent.change(screen.getByLabelText(/rule name/i), { target: { value: 'group-rule-c2' } });
    fireEvent.change(screen.getByLabelText(/source group/i), { target: { value: 'west-branches' } });
    fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'group:west-workloads' } });
    fireEvent.change(screen.getByLabelText(/action/i), { target: { value: 'allow' } });
    fireEvent.click(screen.getByRole('button', { name: /^add rule$/i }));

    const added = (CC.ruleList() as { name: string; src: { group?: string }; dst: unknown }[])
      .find(r => r.name === 'group-rule-c2');
    expect(added).toBeTruthy();
    expect(added!.src.group).toBe('west-branches');
    expect(added!.dst).toEqual({ group: 'west-workloads' });
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

  /* intra-group / not-intra-group are relative to whatever source group the
     rule names. Choosing one without a source group used to be silently
     committable (the warning informed but didn't block) — this rebuilds
     that guarantee as an unreachable-state test, not just an annotation. */
  describe('relative destination without a source group', () => {
    it('warns and disables Add rule, announced to assistive tech and tied to the controls it concerns', () => {
      render(<RuleBuilder />);
      fireEvent.click(screen.getByRole('button', { name: /new rule/i }));
      fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'intra-group' } });

      const warning = screen.getByRole('alert');
      expect(warning).toHaveTextContent(/pick a source group/i);

      const addRuleBtn = screen.getByRole('button', { name: /^add rule$/i });
      expect(addRuleBtn).toBeDisabled();

      const dstSelect = screen.getByLabelText(/destination/i);
      const groupSelect = screen.getByLabelText(/source group/i);
      expect(dstSelect.getAttribute('aria-describedby')).toBe(warning.id);
      expect(groupSelect.getAttribute('aria-describedby')).toBe(warning.id);
    });

    it('clears once a source group is named, and Add rule re-enables', () => {
      render(<RuleBuilder />);
      fireEvent.click(screen.getByRole('button', { name: /new rule/i }));
      fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'not-intra-group' } });
      expect(screen.getByRole('button', { name: /^add rule$/i })).toBeDisabled();

      fireEvent.change(screen.getByLabelText(/source group/i), { target: { value: 'west-branches' } });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^add rule$/i })).not.toBeDisabled();
    });

    it('cannot be committed: clicking a disabled Add rule adds nothing to the engine', () => {
      const before = (CC.ruleList() as unknown[]).length;
      render(<RuleBuilder />);
      fireEvent.click(screen.getByRole('button', { name: /new rule/i }));
      fireEvent.change(screen.getByLabelText(/rule name/i), { target: { value: 'should-never-exist' } });
      fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'intra-group' } });

      fireEvent.click(screen.getByRole('button', { name: /^add rule$/i }));

      const after = CC.ruleList() as { name: string }[];
      expect(after.length).toBe(before);
      expect(after.map(r => r.name)).not.toContain('should-never-exist');
    });
  });

  /* useCloudControlActions() returns the engine handle but does not
     subscribe — groups must be read through the subscribing hook so a group
     added while the builder is open shows up without an unrelated field
     edit forcing a re-render first. */
  it('offers a group added to the engine while the builder is open, without any unrelated field edit', () => {
    render(<RuleBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /new rule/i }));

    act(() => {
      CC.addGroup({ id: 'rb-test-live-group', label: 'RB Test Live Group', kind: 'mixed' });
    });

    const srcGroup = screen.getByLabelText(/source group/i) as HTMLSelectElement;
    const values = Array.from(srcGroup.options).map(o => o.value);
    expect(values).toContain('rb-test-live-group');
  });
});
