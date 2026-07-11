import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { applyTheme } from '../utils/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({ children, defaultMode = 'light' }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Try to get the mode from localStorage
    const savedMode = localStorage.getItem('theme-mode');
    return (savedMode as ThemeMode) || defaultMode;
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  // Effect to handle system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (mode === 'system') {
        setIsDark(mediaQuery.matches);
      }
    };
    
    // Set initial value
    handleChange();
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [mode]);

  // Effect to update theme when mode changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('theme-mode', mode);
    
    // Determine if dark mode should be applied
    const shouldApplyDark = 
      mode === 'dark' || 
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDark(shouldApplyDark);
    
    // Apply theme
    if (shouldApplyDark) {
      document.documentElement.classList.add('dark');
      // Here you would apply dark theme tokens if needed
      // applyTheme(darkThemeTokens);
    } else {
      document.documentElement.classList.remove('dark');
      // Here you would apply light theme tokens if needed
      // applyTheme(lightThemeTokens);
    }
    
    // Dispatch event for other components to react to theme change
    window.dispatchEvent(new CustomEvent('themechange', { detail: { isDark: shouldApplyDark } }));
  }, [mode]);

  const value = {
    mode,
    setMode,
    isDark
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}