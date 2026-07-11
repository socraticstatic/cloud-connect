import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PlusCircle, SlidersHorizontal, Users } from 'lucide-react';
import {
  Settings, BarChart2, Menu, Bell, HelpCircle, Search
} from '../../utils/iconImports';
import { SearchBar } from './SearchBar';
import { NotificationsButton } from './NotificationsButton';
import { HelpButton } from './HelpButton';
import { UserMenu } from './UserMenu';
import { MobileMenu } from './MobileMenu';
import { AdaptiveNavigation } from './AdaptiveNavigation';
import { TabItem } from '../../types/navigation';
import { Button } from '../common/Button';

interface NavItem {
  label: string;
  icon: typeof PlusCircle;
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
      icon: PlusCircle,
      href: '/create',
      description: 'Create a New Connection Here'
    },
    {
      label: 'Manage',
      icon: Settings,
      href: '/manage',
      description: 'Manage Your Individual Connections Here'
    },
    {
      label: 'Monitor',
      icon: BarChart2,
      href: '/monitor',
      description: 'Monitor and Report on Your Connections Here'
    },
    {
      label: 'Configure',
      icon: SlidersHorizontal,
      href: '/configure',
      description: 'Configure your Global Settings Here'
    }
  ];

  const navItems = items.length ? items : defaultItems;

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
      className="bg-fw-base border-b border-fw-secondary"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Side: Logo and Navigation */}
          <div className="flex items-center">
            {/* Hamburger Menu Button - Now next to the logo */}
            <button
              onClick={() => setIsVerticalNav(!isVerticalNav)}
              className="p-2 text-fw-bodyLight hover:text-fw-body hover:bg-fw-wash no-rounded"
              data-nav-toggle="true"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer ml-2 lg:ml-0"
              onClick={handleLogoClick}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center">
                <span className="text-xl font-bold text-fw-heading">AT&T</span>
                <span className="ml-3 text-xl font-bold text-fw-link">NetBond® Advanced</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:ml-8 lg:flex lg:space-x-8 lg:items-center lg:h-full">
              {navItems.map((item) => {
                const Icon = item.icon;
                // Special handling: /groups routes should be considered part of /manage
                const isActive = item.href === '/manage'
                  ? (location.pathname.startsWith('/manage') || location.pathname.startsWith('/groups'))
                  : location.pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`
                      group relative inline-flex items-center px-1 py-4 border-b-2 text-sm font-medium no-rounded
                      transition-all duration-200 h-full
                      ${isActive
                        ? 'border-fw-active text-fw-link'
                        : 'border-transparent text-fw-bodyLight hover:border-fw-secondary hover:text-fw-body'
                      }
                    `}
                  >
                    <Icon className={`
                      h-4 w-4 mr-2 transition-transform duration-200
                      ${hoveredItem === item.href ? 'scale-110' : ''}
                      ${isActive ? 'text-fw-link' : 'text-fw-bodyLight'}
                    `} 
                    />
                    <span className={`
                      transition-all duration-200
                      ${hoveredItem === item.href ? 'transform translate-y-[-1px]' : ''}
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
                            <span className="text-sm font-medium text-fw-heading">{item.label}</span>
                            <Icon className="h-4 w-4 text-fw-bodyLight" />
                          </div>
                          <p className="whitespace-normal text-xs text-fw-bodyLight">{item.description}</p>
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
          <div className="flex items-center space-x-4">
            {!isMenuOpen && !isMobile && (
              <>
                <SearchBar onSearch={onSearch} />
                <div className="h-6 w-px bg-fw-secondary" />
                <HelpButton />
                <div className="h-6 w-px bg-fw-secondary" />
                <NotificationsButton count={notifications} />
                <UserMenu
                  name={userInfo.name}
                  role={userInfo.role}
                  account={userInfo.account}
                  avatar={userInfo.avatar}
                  onClick={() => navigate('/profile')}
                />
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