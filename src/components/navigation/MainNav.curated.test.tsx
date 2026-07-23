import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import { MainNav } from './MainNav';
import { NAV_LAYERS, NAV_ITEMS } from './navItems';
import { attIcons } from '../icons/att-icons';
import { AuthProvider } from '../../contexts/AuthContext';

const renderNav = (path = '/discover') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider><MainNav /></AuthProvider>
    </MemoryRouter>,
  );

describe('MainNav curated Cloud Connect nav — layer-first', () => {
  test('the closed bar carries one link per destination and no verb twice', () => {
    renderNav();
    // Discover is the only plain link; each layer is a dropdown trigger.
    const linkLabels = screen.getAllByRole('link').map(a => a.textContent?.trim());
    expect(linkLabels).toEqual(['Discover']);
    for (const layer of NAV_LAYERS) {
      expect(screen.getByRole('button', { name: layer.label })).toHaveAttribute('aria-haspopup', 'menu');
    }
    // The verbs live inside the panels — never in the closed bar.
    for (const verb of ['Connect', 'Govern', 'Observe', 'Cost']) {
      expect(screen.queryByRole('link', { name: verb })).toBeNull();
    }
    expect(screen.queryByText('NetOps for AI')).toBeNull();
    expect(screen.queryByText('Marketplace')).toBeNull();
  });

  test('each layer menu opens to its own four verbs, scoped to its routes', () => {
    renderNav();
    for (const layer of NAV_LAYERS) {
      fireEvent.click(screen.getByRole('button', { name: layer.label }));
      const menu = screen.getByRole('menu', { name: layer.label });
      const items = within(menu).getAllByRole('menuitem');
      expect(items.map(a => a.getAttribute('href'))).toEqual(layer.items.map(i => i.to));
      for (const item of items) {
        expect(item.getAttribute('href')).toMatch(new RegExp(`^/${layer.key}/`));
      }
      // One layer open at a time means one "Connect" visible at a time.
      expect(screen.getAllByText('Connect')).toHaveLength(1);
      fireEvent.click(screen.getByRole('button', { name: layer.label }));
    }
  });

  test('the trigger carries the active state for any route inside its layer', () => {
    renderNav('/ai/cost');
    const ai = screen.getByRole('button', { name: 'AI Fabric' });
    const naas = screen.getByRole('button', { name: 'NaaS' });
    expect(ai.className).toContain('border-fw-active');
    expect(naas.className).not.toContain('border-fw-active');
  });

  test('Create is a global action listing each creatable with its layer', () => {
    renderNav();
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    const menu = screen.getByRole('menu', { name: 'Create' });
    const items = within(menu).getAllByRole('menuitem');
    expect(items.length).toBeGreaterThanOrEqual(2);
    const hrefs = items.map(a => a.getAttribute('href'));
    expect(hrefs).toContain('/naas/connect');
    expect(hrefs).toContain('/ai/connect');
    expect(within(menu).getByText('NaaS')).toBeInTheDocument();
    expect(within(menu).getByText('AI Fabric')).toBeInTheDocument();
  });

  test('every curated nav icon name is a valid key in the attIcons registry', () => {
    NAV_ITEMS.forEach(item => {
      expect(attIcons).toHaveProperty(item.icon);
    });
  });
});
