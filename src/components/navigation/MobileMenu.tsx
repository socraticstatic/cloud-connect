import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, BarChart2, PlusCircle, Sliders, User, Bell, HelpCircle, LogOut, Search, ChevronRight, PenTool as Tool } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useAuth } from '../../contexts/AuthContext';

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
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);

  // Define navigation items with enabled/disabled state
  const navItems = [
    {
      label: 'Create',
      icon: PlusCircle,
      href: '/create',
      description: 'Create a New Connection',
      disabled: true
    },
    {
      label: 'Manage',
      icon: Settings,
      href: '/manage',
      description: 'Manage Your Connections',
      disabled: true
    },
    {
      label: 'Monitor',
      icon: BarChart2,
      href: '/monitor',
      description: 'Monitor and Report',
      disabled: false
    },
    {
      label: 'Configure',
      icon: Sliders,
      href: '/configure',
      description: 'Configure Settings',
      disabled: true
    },
    {
      label: 'Utilities',
      icon: Tool,
      href: '/profile',
      description: 'Access System Utilities',
      disabled: false
    }
  ];

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

  return (
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
                <button
                  className="ml-auto p-2 text-fw-bodyLight hover:text-fw-body rounded-full hover:bg-fw-neutral"
                  onClick={() => handleNavigation('/profile')}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
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
            <div className="p-4 border-t border-fw-secondary">
              <button
                onClick={async () => {
                  await signOut();
                  onClose();
                  navigate('/login');
                }}
                className="w-full flex items-center justify-center px-4 py-3 text-figma-base text-fw-body bg-fw-neutral rounded-full hover:bg-fw-wash transition-colors"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
              <div className="mt-4 text-center text-figma-sm text-fw-bodyLight">
                <p className="font-semibold text-fw-heading">AT&T NetBond® Advanced • v2.0.1</p>
                <p className="mt-1">© 2025 AT&T Intellectual Property. All rights reserved.</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
