import { useState, useEffect, useRef, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PlusCircle, Menu } from 'lucide-react';
import { AttIcon } from '../icons/AttIcon';
import { SearchBar } from './SearchBar';
import { NotificationsButton } from './NotificationsButton';
import { UserMenu } from './UserMenu';
import { MobileMenu } from './MobileMenu';
import { TenantSelector } from './TenantSelector';
import { TourLauncher } from '../../features/tour/TourLauncher';
import { CommandPalette } from '../../features/command/CommandPalette';
import { UndoControl } from '../../features/undo/UndoControl';
import { NAV_DISCOVER, NAV_LAYERS, NAV_ITEMS, isNavRouteActive } from './navItems';
import { LayerMenu } from './LayerMenu';
import { CreateMenu } from './CreateMenu';
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

  const toNavItem = (navItem: (typeof NAV_ITEMS)[number]): NavItem => ({
    label: navItem.label,
    icon: ({ className }: { className?: string }) => <AttIcon name={navItem.icon} className={className} />,
    href: navItem.to,
    description: navItem.description
  });

  // A caller-supplied `items` list is still rendered as one flat row — it has
  // no domains to group by. The curated nav renders NAV_LAYERS instead.
  const usingCuratedNav = items.length === 0;
  const navItems = usingCuratedNav ? NAV_ITEMS.map(toNavItem) : items;

  // Check if a nav item is disabled by role
  // User role: can only View. No Create, no Configure.
  // Admin: full access except Platform admin.
  // Super-admin: everything.
  const isNavDisabled = (href: string) => {
    if (href === '/create' && !canCreate) return true;
    if (href === '/configure' && !canEdit) return true;
    return false;
  };

  /* Active-route matching lives in navItems.ts so this bar and the mobile
     drawer cannot drift apart — they are the same navigation at two widths. */
  const isRouteActive = (href: string) => isNavRouteActive(location.pathname, href);

  /** One nav link. `compact` is the in-group form: no icon (the same three
   *  icons repeat across both domains, so they disambiguate nothing there)
   *  and the active underline sits under the label rather than the bar. */
  const renderNavLink = (item: NavItem, compact = false) => {
    const Icon = item.icon;
    const disabled = isNavDisabled(item.href);
    const isActive = !disabled && isRouteActive(item.href);

    return (
      <Link
        key={item.href}
        to={disabled ? '#' : item.href}
        onClick={disabled ? (e: React.MouseEvent) => e.preventDefault() : undefined}
        onMouseEnter={() => !disabled && setHoveredItem(item.href)}
        onMouseLeave={() => setHoveredItem(null)}
        aria-current={isActive ? 'page' : undefined}
        className={`
          group relative inline-flex items-center border-b-2 font-medium no-rounded
          transition-all duration-200 tracking-[-0.03em] whitespace-nowrap
          ${compact ? 'px-0.5 pb-1 text-figma-sm' : 'px-1 py-4 h-full text-figma-base'}
          ${disabled
            ? 'border-transparent text-fw-disabled cursor-not-allowed opacity-50'
            : isActive
              ? 'border-fw-active text-fw-link'
              : 'border-transparent text-fw-heading hover:border-fw-secondary hover:text-fw-body'
          }
        `}
      >
        {!compact && (
          <Icon className={`
            h-5 w-5 mr-1.5 transition-transform duration-200 flex-shrink-0
            ${!disabled && hoveredItem === item.href ? 'scale-110' : ''}
            ${disabled ? 'text-fw-disabled' : isActive ? 'text-fw-link' : 'text-fw-heading'}
          `}
          />
        )}
        <span className={`
          transition-all duration-200 tracking-[-0.03em]
          ${!disabled && hoveredItem === item.href ? 'transform translate-y-[-1px]' : ''}
        `}>
          {item.label}
        </span>

        {/* Enhanced Tooltip — for the in-group verbs this is where the
            difference between the two domains' identically-labelled links
            is spelled out. */}
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
  };

  const handleLogoClick = () => {
    // Home = the first stage of the flow. (Previously routed to the NetBond
    // legacy /manage portal — a fork remnant.)
    navigate('/discover');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
    <nav
      className="sticky top-0 z-50 bg-fw-wash/80 backdrop-blur-md border-b border-fw-secondary"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Side: Logo and Navigation */}
          <div className="flex items-center min-w-0">
            {/* Hamburger Menu Button - Now next to the logo */}
            <button
              onClick={toggleMobileMenu}
              className="min-[1280px]:hidden flex items-center justify-center h-9 w-9 rounded-full text-fw-bodyLight hover:text-fw-body hover:bg-fw-wash"
              data-nav-toggle="true"
              aria-label="Open navigation menu"
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
                {tenantBranding.productName === 'Cloud Connect' ? (
                  <>
                    <span className="text-base font-bold text-brand-accent tracking-[-0.03em]">AT&T</span>
                    <span className="ml-2 text-base font-bold text-black tracking-[-0.03em]">Cloud Connect</span>
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

            {/* Desktop Navigation.

                Curated nav, layer-first: Discover, then one dropdown per
                layer of the stack. The verbs (Connect/Govern/Observe/Cost)
                appear only INSIDE their layer's panel, so no label in the
                bar ever repeats — enter through the layer, act through the
                lifecycle (spec: 2026-07-23-layer-first-ia-design.md). */}
            <div className="hidden min-[1280px]:flex min-[1280px]:items-center min-[1280px]:h-full ml-6">
              {usingCuratedNav ? (
                <div className="flex items-stretch h-full gap-4 min-[1440px]:gap-6">
                  {renderNavLink(toNavItem(NAV_DISCOVER))}
                  <span className="w-px self-center h-8 bg-fw-secondary" aria-hidden="true" />
                  {NAV_LAYERS.map(layer => (
                    <LayerMenu key={layer.key} layer={layer} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center h-full gap-3 min-[1440px]:gap-5 min-[1680px]:gap-7">
                  {navItems.map(item => renderNavLink(item))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Actions.

              TourLauncher sits OUTSIDE the width gate on purpose, and its
              slot in this child list is fixed so React reconciles it to the
              same element instance whichever way `isMobile` flips.

              It used to live inside the `!isMobile` branch, which cost two
              separate things. The launcher button was simply absent below
              1024px — the guided tour, the one artifact built to demo this
              product, could not be started at any width where the drawer is
              the only navigation. And because `isMobile` is state driven by a
              resize listener, narrowing the window MID-TOUR unmounted
              <ProductTour /> with it: `currentStep` lives in ProductTour's own
              useState, so the tour did not pause, it stopped existing —
              spotlight, progress bar and place in the sequence all gone, and
              the next launch began again at step 1.

              Keeping it mounted at every width fixes both. The button is 36px
              and it is the only thing in this cluster below 1024px, so it
              costs nothing the narrow header was using. */}
          <div className="flex items-center gap-1 xl:gap-1.5 flex-shrink-0 pr-2">
            {!isMenuOpen && !isMobile && (
              <>
                {/* Create is the one verb that outranks the layers — as a
                    global action, never an address. Each entry names its
                    layer and lands on that layer's Connect page. */}
                <CreateMenu />
                <SearchBar onSearch={onSearch} />
                <div className="h-5 w-px bg-fw-secondary hidden xl:block mx-0.5" />
                <UndoControl />
              </>
            )}

            <TourLauncher />

            {!isMenuOpen && !isMobile && (
              <>
                <div className="h-5 w-px bg-fw-secondary hidden xl:block mx-0.5" />
                <NotificationsButton count={notifications} />
                <TenantSelector />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ⌘K / Ctrl+K command palette — engine-derived, works from anywhere */}
      <CommandPalette />
    </nav>

    {/* Mobile Menu — kept as a sibling of <nav> here for readability, but
        MobileMenu itself portals to document.body (see MobileMenu.tsx), so
        its actual DOM position doesn't depend on where it's mounted in this
        tree. <nav> has backdrop-blur-md, and CSS backdrop-filter establishes
        a containing block for position:fixed descendants, which would clip
        any fixed-position child to the nav's own 64px-tall box instead of
        the viewport — that's what made the old vertical-nav overlay render
        as an empty sliver pinned to the header. The portal is what actually
        prevents that; staying out of <nav> here is just belt-and-suspenders. */}
    <MobileMenu
      isOpen={isMobileMenuOpen}
      onClose={() => setIsMobileMenuOpen(false)}
      userInfo={userInfo}
      notifications={notifications}
    />
    </>
  );
}