import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, HelpCircle, Search } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { AttIcon } from '../icons/AttIcon';
import { NAV_ITEMS } from './navItems';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: {
    name: string;
    role: string;
    account: string;
    email: string;
    avatar?: string;
  };
  notifications: number;
}

export function MobileMenu({ isOpen, onClose, userInfo, notifications }: MobileMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useFocusTrap(isOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);

  // Define navigation items with enabled/disabled state.
  // (A trailing "Utilities" item pointing at /profile used to live here —
  // removed because /profile is a Navigate to /discover, i.e. a no-op that
  // only closed the menu. See handleNavigation's /profile call below, which
  // was the same dead end from a second entry point.)
  const navItems = NAV_ITEMS.map(navItem => ({
    label: navItem.label,
    icon: ({ className }: { className?: string }) => <AttIcon name={navItem.icon} className={className} />,
    href: navItem.to,
    description: navItem.description,
    disabled: false
  }));

  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavigation = (path: string, disabled: boolean = false) => {
    if (disabled) {
      return;
    }
    onClose();
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  // Portalled straight to document.body (same pattern OverflowMenu uses).
  // `fixed` descendants resolve against the nearest ancestor that
  // establishes a containing block — transform, filter, backdrop-filter,
  // perspective, contain:paint, or will-change on that property all
  // qualify. <nav> already has backdrop-blur-md for the sticky header, and
  // rendering this drawer as a plain sibling in the React tree isn't
  // enough insurance: any future ancestor between here and <body> that
  // picks up one of those properties would silently clip the drawer to
  // its own box again, exactly like the header did. Portalling to
  // document.body sidesteps the whole ancestor chain — the panel and
  // backdrop always resolve against the real viewport, no matter where in
  // the React tree <MobileMenu /> gets mounted.
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            ref={menuRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
              duration: 0.3
            }}
            onAnimationComplete={() => setAnimationComplete(true)}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[320px] bg-fw-base shadow-xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-fw-secondary flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={onClose}
                  className="p-2 -ml-2 text-fw-bodyLight hover:text-fw-body rounded-full hover:bg-fw-neutral"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
                <h2 className="ml-2 text-figma-lg font-bold text-fw-heading tracking-[-0.03em]">Menu</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 text-fw-bodyLight hover:text-fw-body rounded-full hover:bg-fw-neutral"
                  onClick={() => handleNavigation('/notifications')}
                >
                  <div className="relative">
                    <Bell className="h-6 w-6" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 text-figma-sm flex items-center justify-center bg-fw-error text-white rounded-full">
                        {notifications}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  className="p-2 text-fw-bodyLight hover:text-fw-body rounded-full hover:bg-fw-neutral"
                  onClick={() => handleNavigation('/support')}
                >
                  <HelpCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-fw-secondary">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fw-bodyLight h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 h-10 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                />
              </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-b border-fw-secondary bg-fw-wash">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {userInfo.avatar ? (
                    <img
                      src={userInfo.avatar}
                      alt={userInfo.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-fw-base shadow-sm"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-fw-cobalt-600 flex items-center justify-center text-white text-figma-lg font-semibold">
                      {userInfo.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-figma-base font-medium text-fw-heading">{userInfo.name}</p>
                  <p className="text-figma-sm font-medium text-fw-bodyLight">{userInfo.role}</p>
                  <p className="text-figma-sm text-fw-bodyLight">{userInfo.account}</p>
                </div>
                {/* A chevron here used to navigate to /profile, which is a
                    Navigate to /discover — a no-op that only closed the
                    menu. Removed rather than pointing it somewhere real,
                    since there is no profile screen in this app. */}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-2">
              <AnimatePresence>
                {animationComplete && (
                  <div className="space-y-1 px-2">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: index * 0.05,
                          duration: 0.2
                        }}
                      >
                        <button
                          onClick={() => handleNavigation(item.href, item.disabled)}
                          className={`
                            w-full flex items-center px-4 py-3 text-figma-base rounded-2xl transition-colors
                            ${location.pathname === item.href && !item.disabled
                              ? 'bg-fw-accent text-fw-link font-medium'
                              : item.disabled
                                ? 'text-fw-bodyLight cursor-not-allowed'
                                : 'text-fw-body hover:bg-fw-neutral'
                            }
                          `}
                          disabled={item.disabled}
                        >
                          <item.icon className={`h-6 w-6 mr-3 ${
                            location.pathname === item.href && !item.disabled
                              ? 'text-fw-link'
                              : item.disabled
                                ? 'text-fw-bodyLight'
                                : 'text-fw-bodyLight'
                          }`} />
                          <div className="text-left">
                            <div>{item.label}</div>
                            <div className="text-figma-sm text-fw-bodyLight">{item.description}</div>
                          </div>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {/* Sign Out used to live here. Authentication was removed from
                this app — there is no login screen to return to, so
                signOut() just wiped a stray localStorage key before
                navigating to /login, which itself redirects to /discover.
                Removed as a dead affordance rather than left pointing at a
                feature that no longer exists. */}
            <div className="p-4 border-t border-fw-secondary">
              <div className="text-center text-figma-sm text-fw-bodyLight">
                <p className="font-semibold text-fw-heading">AT&T Cloud Connect • v2.0.1</p>
                <p className="mt-1">© 2025 AT&T Intellectual Property. All rights reserved.</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
