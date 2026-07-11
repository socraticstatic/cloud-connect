import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import { MainNav } from './MainNav';
import { NAV_ITEMS } from './navItems';
import { attIcons } from '../icons/att-icons';
import { AuthProvider } from '../../contexts/AuthContext';

describe('MainNav curated Cloud Connect nav', () => {
  test('nav shows the six curated Cloud Connect sections', () => {
    render(<MemoryRouter><AuthProvider><MainNav /></AuthProvider></MemoryRouter>);
    ['Discover', 'Connect', 'Govern', 'Observe', 'AI Fabric', 'NetOps for AI']
      .forEach(l => expect(screen.getByText(l)).toBeInTheDocument());
    expect(screen.queryByText('Marketplace')).toBeNull();
    expect(screen.queryByText('Create')).toBeNull();
    expect(screen.queryByText('Manage')).toBeNull();
    expect(screen.queryByText('Monitor')).toBeNull();
    expect(screen.queryByText('Configure')).toBeNull();
  });

  test('every curated nav icon name is a valid key in the attIcons registry', () => {
    NAV_ITEMS.forEach(item => {
      expect(attIcons).toHaveProperty(item.icon);
    });
  });
});
