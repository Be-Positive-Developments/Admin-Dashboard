import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'app-theme';

const ThemeContext = createContext({
  theme: 'system',
  setTheme: () => null,
});

/**
 * ThemeProvider manages the app's color scheme (light / dark / system).
 * - "system" follows the browser's prefers-color-scheme.
 * - Persists the user's choice in localStorage.
 * - Applies the .dark class on <html> so Tailwind's dark: variant kicks in.
 */
export function ThemeProvider({ children, defaultTheme = 'system' }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  // Apply the correct class to <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(systemDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Listen for OS-level theme changes when in "system" mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // localStorage might be blocked
    }
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
