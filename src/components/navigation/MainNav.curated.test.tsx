import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import { MainNav } from './MainNav';
import { NAV_LAYERS, NAV_ITEMS } from './navItems';
import { attIcons } from '../icons/att-icons';
import { AuthProvider } from '../../contexts/AuthContext';

describe('MainNav curated Cloud Connect nav', () => {
  test('nav shows Discover once, then both domains\' four verbs, in order', () => {
    render(<MemoryRouter><AuthProvider><MainNav /></AuthProvider></MemoryRouter>);
    const labels = screen.getAllByRole('link').map(a => a.textContent?.trim());
    expect(labels).toEqual([
      'Discover',
      'Connect', 'Govern', 'Observe', 'Cost',
      'Connect', 'Govern', 'Observe', 'Cost',
    ]);
    expect(screen.queryByText('NetOps for AI')).toBeNull();
    expect(screen.queryByText('Marketplace')).toBeNull();
    expect(screen.queryByText('Create')).toBeNull();
    expect(screen.queryByText('Manage')).toBeNull();
    expect(screen.queryByText('Monitor')).toBeNull();
    expect(screen.queryByText('Configure')).toBeNull();
  });

  /* The two domains carry IDENTICAL verb labels, so the group label is the
     only thing telling one "Connect" from the other — that makes it an
     accessibility requirement, not decoration. Each group must be a named
     region, and every link inside it must point into its own domain. */
  test('each domain is a named group whose links stay inside that domain', () => {
    render(<MemoryRouter><AuthProvider><MainNav /></AuthProvider></MemoryRouter>);

    for (const domain of NAV_LAYERS) {
      const group = screen.getByRole('group', { name: domain.label });
      const hrefs = within(group).getAllByRole('link').map(a => a.getAttribute('href'));
      expect(hrefs).toEqual(domain.items.map(i => i.to));
      for (const href of hrefs) {
        expect(href).toMatch(new RegExp(`^/${domain.key}/`));
      }
    }
  });

  test('every curated nav icon name is a valid key in the attIcons registry', () => {
    NAV_ITEMS.forEach(item => {
      expect(attIcons).toHaveProperty(item.icon);
    });
  });
});
