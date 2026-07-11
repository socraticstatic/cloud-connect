import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MobileMenu } from './MobileMenu';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
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

describe('MobileMenu', () => {
  const mockUserInfo = {
    name: 'Test User',
    role: 'Admin',
    account: 'Test Account',
    email: 'test@example.com'
  };

  it('renders when isOpen is true', () => {
    render(
      <BrowserRouter>
        <MobileMenu 
          isOpen={true} 
          onClose={() => {}} 
          userInfo={mockUserInfo}
          notifications={3}
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <BrowserRouter>
        <MobileMenu 
          isOpen={false} 
          onClose={() => {}} 
          userInfo={mockUserInfo}
          notifications={3}
        />
      </BrowserRouter>
    );
    
    expect(screen.queryByText('Menu')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <BrowserRouter>
        <MobileMenu 
          isOpen={true} 
          onClose={onCloseMock} 
          userInfo={mockUserInfo}
          notifications={3}
        />
      </BrowserRouter>
    );
    
    const closeButton = screen.getByLabelText('Close menu');
    fireEvent.click(closeButton);
    
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('navigates when a navigation item is clicked', () => {
    render(
      <BrowserRouter>
        <MobileMenu 
          isOpen={true} 
          onClose={() => {}} 
          userInfo={mockUserInfo}
          notifications={3}
        />
      </BrowserRouter>
    );
    
    // Find and click a navigation item
    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/create');
  });

  it('displays notification count', () => {
    render(
      <BrowserRouter>
        <MobileMenu 
          isOpen={true} 
          onClose={() => {}} 
          userInfo={mockUserInfo}
          notifications={5}
        />
      </BrowserRouter>
    );
    
    // Check if notification count is displayed
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays search input', () => {
    render(
      <BrowserRouter>
        <MobileMenu 
          isOpen={true} 
          onClose={() => {}} 
          userInfo={mockUserInfo}
          notifications={3}
        />
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });
});