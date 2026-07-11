import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, BarChart2, PlusCircle, Sliders, User, Bell, HelpCircle, LogOut, Search, ChevronRight, PenTool as Tool } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

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
      // Do nothing for disabled items
      return;
    }
    onClose(); // Close first for smooth transition
    setTimeout(() => {
      navigate(path);
    }, 100); // Small delay allows the menu to start closing animation
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
            className="fixed top-0 right-0 bottom-0 w-full max-w-[320px] bg-white shadow-xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={onClose}
                  className="p-2 -ml-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
                <h2 className="ml-2 text-lg font-semibold text-gray-900">Menu</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  onClick={() => handleNavigation('/notifications')}
                >
                  <div className="relative">
                    <Bell className="h-6 w-6" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 text-xs flex items-center justify-center bg-red-600 text-white rounded-full">
                        {notifications}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  onClick={() => handleNavigation('/support')}
                >
                  <HelpCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {userInfo.avatar ? (
                    <img
                      src={userInfo.avatar}
                      alt={userInfo.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-brand-blue flex items-center justify-center text-white text-lg font-semibold">
                      {userInfo.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-900">{userInfo.name}</p>
                  <p className="text-sm text-gray-500">{userInfo.role}</p>
                  <p className="text-xs text-gray-400">{userInfo.account}</p>
                </div>
                <button
                  className="ml-auto p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
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
                            w-full flex items-center px-4 py-3 text-base rounded-xl transition-colors
                            ${location.pathname === item.href && !item.disabled
                              ? 'bg-brand-lightBlue text-brand-blue font-medium'
                              : item.disabled
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-100'
                            }
                          `}
                          disabled={item.disabled}
                        >
                          <item.icon className={`h-6 w-6 mr-3 ${
                            location.pathname === item.href && !item.disabled 
                              ? 'text-brand-blue' 
                              : item.disabled
                                ? 'text-gray-300'
                                : 'text-gray-500'
                          }`} />
                          <div className="text-left">
                            <div>{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  // Handle logout
                  window.addToast({
                    type: 'info',
                    title: 'Logging out',
                    message: 'This is a demo feature',
                    duration: 3000
                  });
                  onClose();
                }}
                className="w-full flex items-center justify-center px-4 py-3 text-base text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
              <div className="mt-4 text-center text-xs text-gray-500">
                <p className="font-semibold">AT&T NetBond® Advanced • v2.0.1</p>
                <p className="mt-1">© 2025 AT&T Intellectual Property. All rights reserved.</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}