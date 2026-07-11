import { ReactNode, useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TabItem } from '../../types/navigation';

interface NavigationSection {
  id: string;
  title: string;
  icon: ReactNode;
  items: TabItem[];
  defaultOpen?: boolean;
}

interface AdaptiveNavigationProps {
  isVertical: boolean;
  onToggleMode: () => void;
  sections: NavigationSection[];
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export function AdaptiveNavigation({
  isVertical,
  onToggleMode,
  sections,
  onTabChange,
  className = ''
}: AdaptiveNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<string>('');
  const verticalNavRef = useRef<HTMLDivElement>(null);
  
  // Initialize expanded sections based on default prop
  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    sections.forEach(section => {
      initialState[section.id] = section.defaultOpen ?? false;
    });
    setExpandedSections(initialState);
  }, [sections]);
  
  // Determine active tab based on current route
  useEffect(() => {
    const path = location.pathname.split('/')[1];
    if (path) {
      setActiveTab(path);
      
      // Auto-expand section that contains active tab when in vertical mode
      if (isVertical) {
        sections.forEach(section => {
          if (section.items.some(item => item.id === path)) {
            setExpandedSections(prev => ({ ...prev, [section.id]: true }));
          }
        });
      }
    }
  }, [location, sections, isVertical]);

  // Handle click outside to close vertical nav
  useEffect(() => {
    if (!isVertical) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        verticalNavRef.current &&
        !verticalNavRef.current.contains(event.target as Node)
      ) {
        // Don't close if clicking the toggle button
        const target = event.target as HTMLElement;
        if (target.closest('[data-nav-toggle]')) return;
        
        onToggleMode();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVertical, onToggleMode]);

  // Add escape key to close vertical nav
  useEffect(() => {
    if (!isVertical) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onToggleMode();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVertical, onToggleMode]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
    
    navigate(`/${tabId}`);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Only render vertical navigation as overlay when active
  return (
    <AnimatePresence>
      {isVertical && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onToggleMode}
          />
          
          {/* Vertical Navigation Panel - Now positioned on the left side */}
          <motion.div
            ref={verticalNavRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 shadow-xl overflow-y-auto"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center">
                <span className="text-xl font-bold text-gray-900">AT&T</span>
                <span className="ml-3 text-xl font-bold text-brand-blue">NetBond® Advanced</span>
              </div>
              <button
                onClick={onToggleMode}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Close navigation menu"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              {sections.map((section) => (
                <div key={section.id} className="mb-6">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-3 py-3 text-sm font-medium text-gray-900 rounded-lg hover:bg-gray-50"
                    aria-expanded={!!expandedSections[section.id]}
                  >
                    <div className="flex items-center">
                      {section.icon}
                      <span className="ml-3">{section.title}</span>
                    </div>
                    {expandedSections[section.id] ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections[section.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pl-6 pr-2 space-y-1 py-2">
                          {section.items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleTabClick(item.id)}
                              disabled={item.disabled}
                              className={`
                                w-full flex items-center px-4 py-2 text-sm rounded-lg
                                transition-all duration-200
                                ${activeTab === item.id
                                  ? 'bg-brand-lightBlue text-brand-blue font-medium'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }
                                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                              aria-current={activeTab === item.id ? 'page' : undefined}
                            >
                              {item.icon && <span className="mr-3">{item.icon}</span>}
                              <span>{item.label}</span>
                              {item.count !== undefined && (
                                <span className={`ml-auto px-2.5 py-0.5 text-xs font-medium rounded-full ${
                                  activeTab === item.id 
                                    ? 'bg-brand-blue/20 text-brand-blue' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {item.count}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            
            <div className="px-4 py-6 border-t border-gray-200 mt-auto">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="User" 
                    className="h-8 w-8 rounded-full"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Emilio Estevez</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}