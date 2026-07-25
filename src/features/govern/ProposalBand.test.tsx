import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, afterEach } from 'vitest';
import { ProposalBand } from './ProposalBand';
import { ruleProposals } from './ruleProposals';
import { CC } from '../../engine';

afterEach(() => { while (CC.canUndo()) CC.undo(); });

const renderBand = () => render(<MemoryRouter><ProposalBand /></MemoryRouter>);

describe('ProposalBand', () => {
  test('renders one row per proposal, stating the engine\'s own evidence and impact', () => {
    renderBand();
    const proposals = ruleProposals(CC);
    const rows = screen.getAllByTestId('proposal-row');
    expect(rows).toHaveLength(proposals.length);
    const first = proposals[0];
    const row = rows[0];
    expect(within(row).getByText(first.title)).toBeInTheDocument();
    expect(within(row).getByText(new RegExp(String(first.impact.gbps)))).toBeInTheDocument();
  });

  test('the primary action stages rather than enforcing', () => {
    renderBand();
    const first = ruleProposals(CC)[0];
    const enforce = screen.getAllByTestId('proposal-enforce')[0];
    expect(enforce.getAttribute('href')).toBe(`/discover?draft=${first.id}`);
  });

  test('renders nothing when every finding is resolved', () => {
    for (const p of ruleProposals(CC)) CC.enforceRule(p.ruleId);
    renderBand();
    expect(screen.queryByTestId('proposal-row')).not.toBeInTheDocument();
    expect(screen.getByTestId('proposal-band-empty')).toBeInTheDocument();
  });
});
