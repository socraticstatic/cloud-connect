import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { MainNav } from './MainNav';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// MainNav always mounts MobileMenu (even when closed), which calls useAuth() —
// so every render needs an AuthProvider ancestor, same as MainNav.curated.test.tsx.
describe('MainNav', () => {
  it('renders the logo', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <MainNav />
        </AuthProvider>
      </BrowserRouter>
    );

    // Rebrand: default tenant branding is "Cloud Connect" (was "NetBond").
    expect(screen.getByText('AT&T')).toBeInTheDocument();
    expect(screen.getByText('Cloud Connect')).toBeInTheDocument();
  });

  // "renders navigation items" (old Create/Manage/Monitor/Configure nav) was
  // removed: the curated six-item nav is already covered by
  // MainNav.curated.test.tsx. The hamburger-opens-MobileMenu integration tests
  // were also removed: the mobile hamburger now toggles AdaptiveNavigation
  // (vertical nav) rather than MobileMenu — MobileMenu's own render/close
  // behavior is covered directly in MobileMenu.test.tsx.

  it('renders custom navigation items when provided', () => {
    const customItems = [
      {
        label: 'Custom',
        icon: vi.fn() as any,
        href: '/custom',
        description: 'Custom Item'
      }
    ];

    render(
      <BrowserRouter>
        <AuthProvider>
          <MainNav items={customItems} />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Custom')).toBeInTheDocument();
  });
});
