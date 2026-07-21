import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TokenPolicies } from './TokenPolicies';
import { CC } from '../../engine';

/* The group-scoped token policy row must render the SAME resolves-to idiom
   Govern's Groups tab established: the group label leads, the stored id sits
   under it in mono, and a resolution line reports what the group means right
   now. Every count is computed independently from the engine at assert time
   — agreement with CC.resolveGroup, never a pinned number.

   The engine is a shared singleton within this file: mutations last. */
describe('TokenPolicies · group-scoped rows', () => {
  const liveCount = () => (CC.resolveGroup('west-workloads') as { count: number }).count;

  it('renders the group label with a resolution count that agrees with the engine', () => {
    render(<TokenPolicies />);
    const row = screen.getByText('West workloads').closest('tr') as HTMLTableRowElement;
    expect(row).toBeTruthy();
    const n = liveCount();
    expect(n).toBeGreaterThan(0);
    expect(row).toHaveTextContent(`resolves to ${n} object${n === 1 ? '' : 's'} right now`);
    // The stored id is visible too — it is what the policy actually keys on.
    expect(row).toHaveTextContent('west-workloads');
  });

  it('keeps the tag-scoped rows exactly as before — no resolution line', () => {
    render(<TokenPolicies />);
    const row = screen.getByText('rd-helion').closest('tr') as HTMLTableRowElement;
    expect(row.textContent).not.toContain('resolves to');
  });

  // Mutations from here down.
  it('re-renders the count when the estate changes underneath it', () => {
    render(<TokenPolicies />);
    const before = liveCount();
    // The gcp rescan surfaces vpc-ml-suite, which carries Region:west — so
    // west-workloads genuinely grows, through the engine, not a prop.
    act(() => {
      CC.rescanAccount('gcp');
    });
    const after = liveCount();
    expect(after).toBe(before + 1);
    const row = screen.getByText('West workloads').closest('tr') as HTMLTableRowElement;
    expect(row).toHaveTextContent(`resolves to ${after} objects right now`);
  });

  it('falls back to the raw key with no resolution line when the group is gone', () => {
    act(() => {
      CC.addGroup({ id: 'tmp-ui-grp', label: 'Temp UI group', kind: 'workload', members: [], predicates: [] });
      CC.setTokenPolicy('tmp-ui-grp', { group: 'tmp-ui-grp', scope: 'private-only', budget: 500000 });
      CC.removeGroup('tmp-ui-grp');
    });
    render(<TokenPolicies />);
    const row = screen.getByText('tmp-ui-grp').closest('tr') as HTMLTableRowElement;
    expect(row).toBeTruthy();
    expect(row.textContent).not.toContain('resolves to');
    expect(row.textContent).not.toContain('undefined');
  });
});
