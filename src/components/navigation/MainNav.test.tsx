import { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { MainNav } from './MainNav';
import { NAV_ITEMS } from './navItems';

// Mock framer-motion. MobileMenu's nav item list only renders once its
// panel's onAnimationComplete callback fires (see MobileMenu.test.tsx for
// the same pattern), so fire it on mount here too.
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onAnimationComplete, ...props }: any) => {
      useEffect(() => {
        onAnimationComplete?.();
      }, []);
      return <div {...props}>{children}</div>;
    }
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// AuthProvider wraps every render for parity with MainNav.curated.test.tsx
// (kept even though MobileMenu no longer calls useAuth() — see MobileMenu.tsx).
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
  // MainNav.curated.test.tsx. The hamburger now toggles MobileMenu (see
  // "hamburger opens the mobile drawer" below); MobileMenu's own render/close
  // behavior is covered directly in MobileMenu.test.tsx.

  it('hamburger opens the mobile drawer, and it contains every curated nav destination', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <MainNav />
        </AuthProvider>
      </BrowserRouter>
    );

    // The drawer is mounted but closed until the hamburger is clicked.
    expect(screen.queryByLabelText('Close menu')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Open navigation menu'));

    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
    // Every curated nav item (including AI Fabric, which is the one most
    // likely to be hidden by the truncated horizontal bar) must be reachable
    // from the drawer. Matched by role="button" specifically — the desktop
    // bar renders the same labels as <Link> (role="link"), so this proves
    // the drawer itself has the item, not just the always-mounted top bar.
    for (const item of NAV_ITEMS) {
      expect(screen.getByRole('button', { name: new RegExp(`^${item.label}`) })).toBeInTheDocument();
    }
  });

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
