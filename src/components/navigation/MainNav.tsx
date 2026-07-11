import { useState, useEffect, useRef, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PlusCircle, SlidersHorizontal, Users, Menu, Bell, HelpCircle } from 'lucide-react';
import { Settings, BarChart2 } from '../../utils/iconImports';
import { AttIcon } from '../icons/AttIcon';
import { SearchBar } from './SearchBar';
import { NotificationsButton } from './NotificationsButton';
import { HelpButton } from './HelpButton';
import { UserMenu } from './UserMenu';
import { MobileMenu } from './MobileMenu';
import { AdaptiveNavigation } from './AdaptiveNavigation';
import { TenantSelector } from './TenantSelector';
import { TabItem } from '../../types/navigation';
import { Button } from '../common/Button';
import { useStore } from '../../store/useStore';
import { usePermissions } from '../../hooks/usePermission';

interface NavItem {
  label: string;
  icon: typeof PlusCircle | ((props: { className?: string }) => ReactNode);
  href: string;
  description: string;
  active?: boolean;
}

interface MainNavProps {
  items?: NavItem[];
  onSearch?: (query: string) => void;
}

export function MainNav({ items = [], onSearch }: MainNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const tenantBranding = useStore(state => state.tenantBranding);
  const activeTenantId = useStore(state => state.activeTenantId);
  const isATT = activeTenantId === 'TNT-001';
  const { canCreate, canEdit } = usePermissions();
  const [notifications] = useState(3);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isVerticalNav, setIsVerticalNav] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsMenuOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [userInfo] = useState({
    name: 'Emilio',
    role: 'Admin',
    account: 'AT&T',
    email: 'emilio.estevez@att.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  });

  const defaultItems: NavItem[] = [
    {
      label: 'Create',
      icon: ({ className }: { className?: string }) => <AttIcon name="plus" className={className} />,
      href: '/create',
      description: 'Create a New Connection Here'
    },
    {
      label: 'Manage',
      icon: ({ className }: { className?: string }) => <AttIcon name="grid" className={className} />,
      href: '/manage',
      description: 'Manage Your Individual Connections Here'
    },
    {
      label: 'Monitor',
      icon: ({ className }: { className?: string }) => <AttIcon name="high-meter" className={className} />,
      href: '/monitor',
      description: 'Monitor and Report on Your Connections Here'
    },
    {
      label: 'Configure',
      icon: ({ className }: { className?: string }) => <AttIcon name="gear" className={className} />,
      href: '/configure',
      description: 'Configure your Global Settings Here'
    }
  ];

  const navItems = items.length ? items : defaultItems;

  // Check if a nav item is disabled by role
  // User role: can only View. No Create, no Configure.
  // Admin: full access except Platform admin.
  // Super-admin: everything.
  const isNavDisabled = (href: string) => {
    if (href === '/create' && !canCreate) return true;
    if (href === '/configure' && !canEdit) return true;
    return false;
  };

  // Transform NavItem[] to navigation sections for AdaptiveNavigation
  const navSections = [
    {
      id: 'main',
      title: 'Main Navigation',
      icon: <Menu className="h-5 w-5" />,
      items: navItems.map(item => {
        const Icon = item.icon;
        return {
          id: item.href.substring(1) || 'manage',
          label: item.label,
          icon: <Icon className="h-5 w-5" />,
        } as TabItem;
      }),
      defaultOpen: true
    },
    {
      id: 'user',
      title: 'User',
      icon: <HelpCircle className="h-5 w-5" />,
      items: [
        {
          id: 'profile',
          label: 'Profile',
          icon: <Settings className="h-5 w-5" />,
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: <Bell className="h-5 w-5" />,
        },
        {
          id: 'support',
          label: 'Help & Resources',
          icon: <HelpCircle className="h-5 w-5" />,
        }
      ] as TabItem[],
      defaultOpen: false
    }
  ];

  const handleLogoClick = () => {
    navigate('/manage');
    if (location.pathname === '/manage') {
      window.dispatchEvent(new CustomEvent('setActiveTab', { detail: 'connections' }));
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav
      className="sticky top-0 z-50 bg-fw-wash/80 backdrop-blur-md border-b border-fw-secondary"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Side: Logo and Navigation */}
          <div className="flex items-center min-w-0">
            {/* Hamburger Menu Button - Now next to the logo */}
            <button
              onClick={() => setIsVerticalNav(!isVerticalNav)}
              className="lg:hidden flex items-center justify-center h-9 w-9 rounded-full text-fw-bodyLight hover:text-fw-body hover:bg-fw-wash"
              data-nav-toggle="true"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer ml-2 lg:ml-0"
              onClick={handleLogoClick}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center">
                {tenantBranding.productName === 'NetBond\u00AE Advanced' ? (
                  <>
                    <span className="text-base font-bold text-brand-accent tracking-[-0.03em]">AT&T</span>
                    <span className="ml-2 text-base font-bold text-black tracking-[-0.03em]">NetBond<sup className="text-[10px]">®</sup> Advanced</span>
                  </>
                ) : (
                  <span
                    className="text-base font-bold tracking-[-0.03em]"
                    style={{ color: tenantBranding.primaryColor }}
                  >
                    {tenantBranding.productName}
                  </span>
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:ml-6 lg:flex lg:items-center lg:h-full lg:gap-4 xl:gap-8 2xl:gap-[61px]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const disabled = isNavDisabled(item.href);
                // Special handling: /groups routes should be considered part of /manage
                const isActive = !disabled && (item.href === '/manage'
                  ? (location.pathname.startsWith('/manage') || location.pathname.startsWith('/groups'))
                  : location.pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    to={disabled ? '#' : item.href}
                    onClick={disabled ? (e: React.MouseEvent) => e.preventDefault() : undefined}
                    onMouseEnter={() => !disabled && setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`
                      group relative inline-flex items-center px-1 py-4 border-b-2 text-figma-base font-medium no-rounded
                      transition-all duration-200 h-full tracking-[-0.03em] whitespace-nowrap
                      ${disabled
                        ? 'border-transparent text-fw-disabled cursor-not-allowed opacity-50'
                        : isActive
                          ? 'border-fw-active text-fw-link'
                          : 'border-transparent text-fw-heading hover:border-fw-secondary hover:text-fw-body'
                      }
                    `}
                  >
                    <Icon className={`
                      h-5 w-5 lg:h-6 lg:w-6 mr-1.5 lg:mr-2 transition-transform duration-200 flex-shrink-0
                      ${!disabled && hoveredItem === item.href ? 'scale-110' : ''}
                      ${disabled ? 'text-fw-disabled' : isActive ? 'text-fw-link' : 'text-fw-heading'}
                    `}
                    />
                    <span className={`
                      transition-all duration-200 tracking-[-0.03em]
                      ${!disabled && hoveredItem === item.href ? 'transform translate-y-[-1px]' : ''}
                    `}>
                      {item.label}
                    </span>

                    {/* Enhanced Tooltip */}
                    {hoveredItem === item.href && (
                      <div
                        className="absolute top-full mt-4 p-4 bg-fw-base rounded-lg shadow-lg border border-fw-secondary w-64" style={{ zIndex: 50 }}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-figma-base font-medium text-fw-heading">{item.label}</span>
                            <Icon className="h-4 w-4 text-fw-bodyLight" />
                          </div>
                          <p className="whitespace-normal text-figma-sm text-fw-bodyLight">{item.description}</p>
                        </div>
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                          <div className="border-x-4 border-x-transparent border-b-4 border-b-fw-base"></div>
                        </div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0 pr-2">
            {!isMenuOpen && !isMobile && (
              <>
                <SearchBar onSearch={onSearch} />
                <div className="h-5 w-px bg-fw-secondary hidden xl:block" />
                <HelpButton />
                <div className="h-5 w-px bg-fw-secondary hidden xl:block" />
                <NotificationsButton count={notifications} />
                <div className="h-5 w-px bg-fw-secondary hidden xl:block" />
                <TenantSelector onProfileClick={() => navigate('/profile')} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Adaptive Navigation - Only render when isVertical is true */}
      <AdaptiveNavigation
        isVertical={isVerticalNav}
        onToggleMode={() => setIsVerticalNav(!isVerticalNav)}
        sections={navSections}
        onTabChange={(tabId) => navigate(`/${tabId}`)}
        className=""
      />

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        userInfo={userInfo}
        notifications={notifications}
      />
    </nav>
  );
}