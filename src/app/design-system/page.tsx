/**
 * PharmSync Design System Demo Page
 * View all components and design tokens
 */

'use client';

import React from 'react';
import { DashboardExample } from '@/components/examples/SampleStatCard';
import { ThemeToggle, ThemeToggleExtended } from '@/components/ThemeToggle';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--md-sys-color-background)' }}>
      {/* Header with theme toggle */}
      <header
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container-low)',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          padding: '16px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1 className="typescale-title-large" style={{ color: 'var(--md-sys-color-primary)' }}>
              PharmSync Design System
            </h1>
            <p
              className="typescale-body-small"
              style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: '4px' }}
            >
              Shoppers Drug Mart Edition - Material Design 3
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

        {/* Color Palette Section */}
        <div className="page-container">
          <section className="section">
            <h2 className="typescale-headline-small" style={{ marginBottom: '24px' }}>
              Color Palette
            </h2>

            <div style={{ display: 'grid', gap: '24px' }}>
              {/* Primary Colors */}
              <div>
                <h3 className="typescale-title-medium" style={{ marginBottom: '16px' }}>
                  Primary (Shoppers Red)
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <ColorSwatch
                    color="var(--md-sys-color-primary)"
                    label="Primary"
                    value="#E12F29"
                  />
                  <ColorSwatch
                    color="var(--md-sys-color-on-primary)"
                    label="On Primary"
                    value="#FFFFFF"
                  />
                  <ColorSwatch
                    color="var(--md-sys-color-primary-container)"
                    label="Primary Container"
                    value="#4A0F0D"
                  />
                </div>
              </div>

              {/* Secondary Colors */}
              <div>
                <h3 className="typescale-title-medium" style={{ marginBottom: '16px' }}>
                  Secondary (Medical Blue)
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <ColorSwatch
                    color="var(--md-sys-color-secondary)"
                    label="Secondary"
                    value="#0066CC"
                  />
                  <ColorSwatch
                    color="var(--md-sys-color-on-secondary)"
                    label="On Secondary"
                    value="#FFFFFF"
                  />
                  <ColorSwatch
                    color="var(--md-sys-color-secondary-container)"
                    label="Secondary Container"
                    value="#001F3F"
                  />
                </div>
              </div>

              {/* Surface Colors */}
              <div>
                <h3 className="typescale-title-medium" style={{ marginBottom: '16px' }}>
                  Surfaces
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <ColorSwatch
                    color="var(--md-sys-color-background)"
                    label="Background"
                    value="#0F0F0F"
                  />
                  <ColorSwatch
                    color="var(--md-sys-color-surface-container-low)"
                    label="Surface Low"
                    value="#1A1A1A"
                  />
                  <ColorSwatch
                    color="var(--md-sys-color-surface-container)"
                    label="Surface"
                    value="#2F2F2F"
                  />
                  <ColorSwatch
                    color="var(--md-sys-color-surface-container-high)"
                    label="Surface High"
                    value="#404040"
                  />
                </div>
              </div>

              {/* Status Colors */}
              <div>
                <h3 className="typescale-title-medium" style={{ marginBottom: '16px' }}>
                  Status (Inventory Aging)
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <ColorSwatch
                    color="var(--md-sys-color-status-fresh)"
                    label="Fresh (0-30d)"
                    value="#10B981"
                  />
                  <ColorSwatch
                    color="var(--md-sys-color-status-moderate)"
                    label="Moderate (31-90d)"
                    value="#F59E0B"
                  />
                  <ColorSwatch
                    color="var(--md-sys-color-status-aging)"
                    label="Aging (91-180d)"
                    value="#F97316"
                  />
                  <ColorSwatch
                    color="var(--md-sys-color-status-old)"
                    label="Old (180+d)"
                    value="#E12F29"
                  />
                  <ColorSwatch
                    color="var(--md-sys-color-status-obsolete)"
                    label="Obsolete"
                    value="#8B5CF6"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container-low)',
          borderTop: '1px solid var(--md-sys-color-outline-variant)',
          padding: '24px',
          marginTop: '48px',
          textAlign: 'center',
        }}
      >
        <p className="typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
          PharmSync Design System - Material Design 3 with Shoppers Drug Mart Branding
        </p>
      </footer>
    </div>
  );
}

// Color Swatch Component
interface ColorSwatchProps {
  color: string;
  label: string;
  value: string;
}

function ColorSwatch({ color, label, value }: ColorSwatchProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        minWidth: '120px',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          backgroundColor: color,
          borderRadius: 'var(--md-sys-shape-corner-medium)',
          border: '1px solid var(--md-sys-color-outline-variant)',
        }}
      />
      <div style={{ textAlign: 'center' }}>
        <div className="typescale-label-small" style={{ color: 'var(--md-sys-color-on-surface)' }}>
          {label}
        </div>
        <div
          className="typescale-body-small"
          style={{
            color: 'var(--md-sys-color-on-surface-variant)',
            fontFamily: 'var(--md-sys-typescale-font-family-mono)',
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
