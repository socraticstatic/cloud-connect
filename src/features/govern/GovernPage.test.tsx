import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CC } from '../../engine';
import { GovernPage } from './GovernPage';
test('lists rules and enforcing one changes engine state (violations or enforced count)', () => {
  render(<MemoryRouter><GovernPage /></MemoryRouter>);
  const rules = CC.ruleList();
  expect(rules.length).toBeGreaterThan(0);
  const unenforced = rules.find(r => !CC.ruleEnforced(r));
  if (unenforced) {
    const before = CC.ruleList().filter(r => CC.ruleEnforced(r)).length;
    // Row actions live behind an overflow menu, so walk the real path:
    // open the row's menu, then choose Enforce.
    fireEvent.click(screen.getAllByRole('button', { name: /more options/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /^enforce$/i }));
    expect(CC.ruleList().filter(r => CC.ruleEnforced(r)).length).toBeGreaterThan(before);
  }
});
