import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CC } from '../../engine';
import { GovernPage } from './GovernPage';

const at = (path: string) => (
  <MemoryRouter initialEntries={[path]}>
    <GovernPage />
  </MemoryRouter>
);

/* The tab is in the URL because Groups is a DESTINATION: the guided tour
   routes straight at it, and Discover's confirmation links to it. A beat
   pointing at the Groups table on a page that always opens on Policies is a
   beat that spotlights nothing. */
test('/govern?tab=groups opens on the Groups table, not on Policies', () => {
  const { container } = render(at('/govern?tab=groups'));
  expect(container.querySelector('[data-tour="govern-groups"]')).not.toBeNull();
  expect(container.querySelector('[data-tour="govern-rules"]')).toBeNull();
});

test('/govern?tab=policies and a bare /govern both open on Policies', () => {
  for (const path of ['/govern?tab=policies', '/govern', '/govern?tab=nonsense']) {
    const { container, unmount } = render(at(path));
    expect(
      container.querySelector('[data-tour="govern-rules"]'),
      `${path} did not open on Policies`,
    ).not.toBeNull();
    unmount();
  }
});

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
