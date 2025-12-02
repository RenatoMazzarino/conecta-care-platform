'use client';

import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
  Theme,
} from '@fluentui/react-components';
import { ReactNode, createContext, useContext, useState, useCallback, useSyncExternalStore } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within FluentProviderWrapper');
  }
  return context;
}

interface FluentProviderWrapperProps {
  children: ReactNode;
}

// Custom hook to detect dark mode preference using useSyncExternalStore
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((callback: () => void) => {
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
  }, [query]);

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => {
    return false; // Default to light mode on server
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function FluentProviderWrapper({ children }: FluentProviderWrapperProps) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [manualDarkMode, setManualDarkMode] = useState<boolean | null>(null);
  
  const isDarkMode = manualDarkMode ?? prefersDark;

  const toggleTheme = useCallback(() => {
    setManualDarkMode(prev => prev === null ? !prefersDark : !prev);
  }, [prefersDark]);
  
  const theme = isDarkMode ? webDarkTheme : webLightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      <FluentProvider theme={theme} style={{ minHeight: '100vh' }}>
        {children}
      </FluentProvider>
    </ThemeContext.Provider>
  );
}
