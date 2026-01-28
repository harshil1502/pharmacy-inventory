/**
 * PharmSync Main App Component
 * Integrates Shoppers Drug Mart Design System
 */

import React, { useEffect } from 'react';
import { initTheme } from './utils/theme';
import { DashboardExample } from './components/examples/SampleStatCard';
import { ThemeToggle, ThemeToggleExtended } from './components/ThemeToggle';
import './styles/main.scss';

function App() {
  // Initialize theme on mount
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--md-sys-color-background)' }}>
      {/* Header with theme toggle */}
      <header
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container-low)',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          padding: '16px 24px'
        }}
      >
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 className="typescale-title-large" style={{ color: 'var(--md-sys-color-primary)' }}>
              PharmSync
            </h1>
            <p className="typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: '4px' }}>
              Shoppers Drug Mart Design System
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <ThemeToggleExtended showLabel={false} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <DashboardExample />
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container-low)',
          borderTop: '1px solid var(--md-sys-color-outline-variant)',
          padding: '24px',
          marginTop: '48px',
          textAlign: 'center'
        }}
      >
        <p className="typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
          PharmSync Design System - Material Design 3 with Shoppers Drug Mart Branding
        </p>
      </footer>
    </div>
  );
}

export default App;
