import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MainNav } from './MainNav';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock the MobileMenu component
vi.mock('./MobileMenu', () => ({
  MobileMenu: ({ isOpen, onClose }: any) => 
    isOpen ? (
      <div data-testid="mobile-menu">
        <button onClick={onClose} data-testid="close-mobile-menu">Close</button>
      </div>
    ) : null
}));

describe('MainNav', () => {
  it('renders the logo', () => {
    render(
      <BrowserRouter>
        <MainNav />
      </BrowserRouter>
    );
    
    expect(screen.getByText('AT&T')).toBeInTheDocument();
    expect(screen.getByText('NetBond')).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    render(
      <BrowserRouter>
        <MainNav />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Manage')).toBeInTheDocument();
    expect(screen.getByText('Monitor')).toBeInTheDocument();
    expect(screen.getByText('Configure')).toBeInTheDocument();
  });

  it('shows mobile menu when hamburger is clicked', () => {
    render(
      <BrowserRouter>
        <MainNav />
      </BrowserRouter>
    );
    
    // Find and click the hamburger button
    const hamburgerButton = screen.getByLabelText('Open main menu');
    fireEvent.click(hamburgerButton);
    
    // Check if mobile menu is shown
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
  });

  it('closes mobile menu when close button is clicked', () => {
    render(
      <BrowserRouter>
        <MainNav />
      </BrowserRouter>
    );
    
    // Open the mobile menu
    const hamburgerButton = screen.getByLabelText('Open main menu');
    fireEvent.click(hamburgerButton);
    
    // Find and click the close button
    const closeButton = screen.getByTestId('close-mobile-menu');
    fireEvent.click(closeButton);
    
    // Check if mobile menu is closed
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
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
        <MainNav items={customItems} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });
});