/**
 * PharmSync Theme Toggle Component
 * Material Design 3 theme switcher
 */

import React from 'react';
import { useTheme } from '../utils/theme';

export function ThemeToggle() {
  const { effectiveTheme, toggle } = useTheme();

  return (
    <button
      className="button-icon"
      onClick={toggle}
      aria-label={`Switch to ${effectiveTheme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${effectiveTheme === 'light' ? 'dark' : 'light'} theme`}
    >
      {effectiveTheme === 'light' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      )}
    </button>
  );
}

// Compact variant for navigation bars
export function ThemeToggleCompact() {
  const { effectiveTheme, toggle } = useTheme();

  return (
    <button
      className="button-icon button-icon--small"
      onClick={toggle}
      aria-label="Toggle theme"
      title={`Current: ${effectiveTheme} theme`}
    >
      {effectiveTheme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

// Extended variant with label
interface ThemeToggleExtendedProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggleExtended({
  showLabel = true,
  className = ''
}: ThemeToggleExtendedProps) {
  const { theme, effectiveTheme, setTheme } = useTheme();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <span className="typescale-label-large" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
          Theme
        </span>
      )}

      <div className="button-group button-group--attached">
        <button
          className={`button-outlined ${effectiveTheme === 'light' ? 'button-outlined--active' : ''}`}
          onClick={() => setTheme('light')}
          aria-pressed={effectiveTheme === 'light'}
        >
          Light
        </button>
        <button
          className={`button-outlined ${effectiveTheme === 'dark' ? 'button-outlined--active' : ''}`}
          onClick={() => setTheme('dark')}
          aria-pressed={effectiveTheme === 'dark'}
        >
          Dark
        </button>
        <button
          className={`button-outlined ${theme === 'system' ? 'button-outlined--active' : ''}`}
          onClick={() => setTheme('system')}
          aria-pressed={theme === 'system'}
        >
          Auto
        </button>
      </div>
    </div>
  );
}

// Add active state styling for the extended toggle
const styles = `
.button-outlined--active {
  background-color: var(--md-sys-color-primary-container);
  border-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-primary);
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
