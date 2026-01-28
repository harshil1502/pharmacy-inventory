/**
 * PharmSync Theme Utility
 * Handles theme switching between light and dark modes
 */

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'pharmsync-theme';

/**
 * Get the current theme from localStorage or system preference
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }

  return 'system';
}

/**
 * Get the effective theme (resolves 'system' to 'light' or 'dark')
 */
export function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme;

  if (typeof window === 'undefined') return 'dark';

  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

/**
 * Apply theme to the document
 */
export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;

  const effectiveTheme = getEffectiveTheme(theme);
  const root = document.documentElement;

  // Remove existing theme attribute
  root.removeAttribute('data-theme');

  // Apply new theme if it's light (dark is default)
  if (effectiveTheme === 'light') {
    root.setAttribute('data-theme', 'light');
  }

  // Store theme preference
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme(): Theme {
  const current = getStoredTheme();
  const effective = getEffectiveTheme(current);
  const next = effective === 'light' ? 'dark' : 'light';

  applyTheme(next);
  return next;
}

/**
 * Initialize theme on app load
 */
export function initTheme(): void {
  if (typeof window === 'undefined') return;

  const theme = getStoredTheme();
  applyTheme(theme);

  // Listen for system theme changes if user chose 'system'
  if (theme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

    const handleChange = () => {
      if (getStoredTheme() === 'system') {
        applyTheme('system');
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleChange);
    }
  }
}

/**
 * React hook for theme management
 */
export function useTheme() {
  const [theme, setThemeState] = React.useState<Theme>(getStoredTheme);

  const setTheme = React.useCallback((newTheme: Theme) => {
    applyTheme(newTheme);
    setThemeState(newTheme);
  }, []);

  const toggle = React.useCallback(() => {
    const next = toggleTheme();
    setThemeState(next);
  }, []);

  React.useEffect(() => {
    initTheme();
  }, []);

  return {
    theme,
    effectiveTheme: getEffectiveTheme(theme),
    setTheme,
    toggle,
  };
}

// For environments without React
import * as React from 'react';
