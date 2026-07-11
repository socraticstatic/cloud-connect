import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PlusCircle, Settings, BarChart2, Sliders, Bell, User, HelpCircle } from 'lucide-react';

interface NavigationSection {
  id: string;
  title: string;
  icon: ReactNode;
  items: Array<{
    id: string;
    label: string;
    icon: ReactNode;
    path: string;
    disabled?: boolean;
  }>;
}

interface NavigationContextType {
  isVerticalNav: boolean;
  toggleNavMode: () => void;
  expandedSections: Record<string, boolean>;
  toggleSection: (sectionId: string) => void;
  navigationSections: NavigationSection[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [isVerticalNav, setIsVerticalNav] = useState(() => {
    const saved = localStorage.getItem('isVerticalNav');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('expandedNavSections');
    return saved ? JSON.parse(saved) : {
      main: true,
      settings: false,
      help: false,
    };
  });

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('isVerticalNav', JSON.stringify(isVerticalNav));
  }, [isVerticalNav]);

  useEffect(() => {
    localStorage.setItem('expandedNavSections', JSON.stringify(expandedSections));
  }, [expandedSections]);

  const toggleNavMode = () => {
    setIsVerticalNav(prev => !prev);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Define navigation sections with their items
  const navigationSections: NavigationSection[] = [
    {
      id: 'main',
      title: 'Main Navigation',
      icon: <Settings className="h-5 w-5" />,
      items: [
        { 
          id: 'create', 
          label: 'Create', 
          icon: <PlusCircle className="h-5 w-5" />, 
          path: '/create' 
        },
        { 
          id: 'manage', 
          label: 'Manage', 
          icon: <Settings className="h-5 w-5" />, 
          path: '/manage' 
        },
        { 
          id: 'monitor', 
          label: 'Monitor', 
          icon: <BarChart2 className="h-5 w-5" />, 
          path: '/monitor' 
        },
        { 
          id: 'configure', 
          label: 'Configure', 
          icon: <Sliders className="h-5 w-5" />, 
          path: '/configure' 
        }
      ]
    },
    {
      id: 'settings',
      title: 'User Settings',
      icon: <User className="h-5 w-5" />,
      items: [
        { 
          id: 'profile', 
          label: 'Profile', 
          icon: <User className="h-5 w-5" />, 
          path: '/profile' 
        },
        { 
          id: 'notifications', 
          label: 'Notifications', 
          icon: <Bell className="h-5 w-5" />, 
          path: '/notifications' 
        }
      ]
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: <HelpCircle className="h-5 w-5" />,
      items: [
        { 
          id: 'support', 
          label: 'Help & Resources', 
          icon: <HelpCircle className="h-5 w-5" />, 
          path: '/support' 
        }
      ]
    }
  ];

  return (
    <NavigationContext.Provider
      value={{
        isVerticalNav,
        toggleNavMode,
        expandedSections,
        toggleSection,
        navigationSections
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}