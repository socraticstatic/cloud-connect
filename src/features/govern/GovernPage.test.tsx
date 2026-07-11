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
    fireEvent.click(screen.getAllByRole('button', { name: /enforce/i })[0]);
    expect(CC.ruleList().filter(r => CC.ruleEnforced(r)).length).toBeGreaterThan(before);
  }
});
