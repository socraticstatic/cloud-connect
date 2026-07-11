import { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { MobileMenu } from './MobileMenu';

// Mock framer-motion. The nav item list only renders once the panel's
// onAnimationComplete callback fires, so the mocked motion.div calls it on
// mount (via useEffect) to keep tests deterministic without real animation.
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

// Mock navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate
  };
});

function renderMobileMenu(props: Partial<React.ComponentProps<typeof MobileMenu>> = {}) {
  const defaultProps = {
    isOpen: true,
    onClose: () => {},
    userInfo: {
      name: 'Test User',
      role: 'Admin',
      account: 'Test Account',
      email: 'test@example.com'
    },
    notifications: 3
  };

  return render(
    <BrowserRouter>
      <AuthProvider>
        <MobileMenu {...defaultProps} {...props} />
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('MobileMenu', () => {
  it('renders when isOpen is true', () => {
    renderMobileMenu();

    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    renderMobileMenu({ isOpen: false });

    expect(screen.queryByText('Menu')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    renderMobileMenu({ onClose: onCloseMock });

    const closeButton = screen.getByLabelText('Close menu');
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('navigates when a navigation item is clicked', () => {
    vi.useFakeTimers();
    try {
      renderMobileMenu();

      // Curated Cloud Connect nav (NAV_ITEMS) — 'Discover' replaces the old 'Create'.
      const discoverButton = screen.getByText('Discover');
      fireEvent.click(discoverButton);

      // handleNavigation defers navigation by 100ms after onClose.
      vi.advanceTimersByTime(150);

      expect(mockNavigate).toHaveBeenCalledWith('/discover');
    } finally {
      vi.useRealTimers();
    }
  });

  it('displays notification count', () => {
    renderMobileMenu({ notifications: 5 });

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays search input', () => {
    renderMobileMenu();

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });
});
