/**
 * PharmSync InventoryStatCard Demo Page
 * Showcase of the stat card component with all variants
 */

'use client';

import React from 'react';
import { InventoryStatCard } from '@/components/common/InventoryStatCard';
import {
  DashboardOverviewExample,
  InteractiveCardsExample,
  StatusCardsExample,
  LoadingStatesExample,
  FormattedNumbersExample,
  TransferRequestsExample,
  StoreComparisonExample,
  MinimalCardsExample,
  MixedFormatsExample,
  SingleRowExample
} from '@/components/common/InventoryStatCard/InventoryStatCard.examples';

// Icons
const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function StatCardsDemoPage() {
  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <header style={{ marginBottom: '48px' }}>
        <h1 className="typescale-headline-large" style={{ marginBottom: '8px' }}>
          InventoryStatCard Component
        </h1>
        <p className="typescale-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
          Material Design 3 stat cards for dashboard metrics
        </p>
      </header>

      {/* Basic Examples */}
      <section style={{ marginBottom: '64px' }}>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '24px' }}>
          Basic Examples
        </h2>
        <div className="stat-cards-grid">
          <InventoryStatCard
            title="Simple Card"
            value={1247}
          />

          <InventoryStatCard
            title="With Trend"
            value={1247}
            trend={{ value: 12, direction: 'up' }}
          />

          <InventoryStatCard
            title="With Status"
            value={23}
            status="old"
          />

          <InventoryStatCard
            title="With Icon"
            value={8}
            icon={<PackageIcon />}
          />
        </div>
      </section>

      {/* Dashboard Overview */}
      <section style={{ marginBottom: '64px' }}>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '24px' }}>
          Dashboard Overview
        </h2>
        <DashboardOverviewExample />
      </section>

      {/* Trend Indicators */}
      <section style={{ marginBottom: '64px' }}>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '24px' }}>
          Trend Indicators
        </h2>
        <div className="stat-cards-grid">
          <InventoryStatCard
            title="Upward Trend"
            value={1000}
            trend={{ value: 12, direction: 'up' }}
            subtitle="Positive change"
          />

          <InventoryStatCard
            title="Downward Trend"
            value={500}
            trend={{ value: -8, direction: 'down' }}
            subtitle="Negative change"
          />

          <InventoryStatCard
            title="Large Increase"
            value={2500}
            trend={{ value: 45, direction: 'up' }}
            subtitle="Significant growth"
          />

          <InventoryStatCard
            title="Small Decrease"
            value={300}
            trend={{ value: -2, direction: 'down' }}
            subtitle="Minor decline"
          />
        </div>
      </section>

      {/* Status Badges */}
      <section style={{ marginBottom: '64px' }}>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '24px' }}>
          Status Badges
        </h2>
        <StatusCardsExample />
      </section>

      {/* With Icons */}
      <section style={{ marginBottom: '64px' }}>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '24px' }}>
          With Icons & Subtitles
        </h2>
        <div className="stat-cards-grid">
          <InventoryStatCard
            title="Total Items"
            value={1247}
            icon={<PackageIcon />}
            subtitle="All medications"
            trend={{ value: 12, direction: 'up' }}
          />

          <InventoryStatCard
            title="Low Stock"
            value={23}
            icon={<AlertIcon />}
            subtitle="Requires attention"
            status="old"
          />

          <InventoryStatCard
            title="Expiring Soon"
            value={8}
            icon={<ClockIcon />}
            subtitle="Next 30 days"
            status="aging"
          />

          <InventoryStatCard
            title="Total Value"
            value="$42,150"
            icon={<DollarIcon />}
            subtitle="Current inventory"
            trend={{ value: 8, direction: 'up' }}
          />
        </div>
      </section>

      {/* Interactive Cards */}
      <section style={{ marginBottom: '64px' }}>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '24px' }}>
          Interactive Cards
        </h2>
        <p className="typescale-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '16px' }}>
          Click cards to trigger actions
        </p>
        <InteractiveCardsExample />
      </section>

      {/* Number Formatting */}
      <section style={{ marginBottom: '64px' }}>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '24px' }}>
          Number Formatting
        </h2>
        <FormattedNumbersExample />
      </section>

      {/* Loading States */}
      <section style={{ marginBottom: '64px' }}>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '24px' }}>
          Loading States
        </h2>
        <LoadingStatesExample />
      </section>

      {/* Different Layouts */}
      <section style={{ marginBottom: '64px' }}>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '32px' }}>
          Different Layouts
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          <div>
            <h3 className="typescale-title-large" style={{ marginBottom: '16px' }}>
              3-Column Grid
            </h3>
            <TransferRequestsExample />
          </div>

          <div>
            <h3 className="typescale-title-large" style={{ marginBottom: '16px' }}>
              Minimal Cards
            </h3>
            <MinimalCardsExample />
          </div>

          <div>
            <h3 className="typescale-title-large" style={{ marginBottom: '16px' }}>
              Mixed Formats
            </h3>
            <MixedFormatsExample />
          </div>
        </div>
      </section>

      {/* Store Comparison */}
      <section style={{ marginBottom: '64px' }}>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '24px' }}>
          Store Comparison
        </h2>
        <StoreComparisonExample />
      </section>

      {/* Usage Code */}
      <section>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '24px' }}>
          Usage
        </h2>
        <div style={{ backgroundColor: 'var(--md-sys-color-surface-container-low)', padding: '24px', borderRadius: '8px', fontFamily: 'var(--md-sys-typescale-font-family-mono)', fontSize: '14px' }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
{`import { InventoryStatCard } from '@/components/common/InventoryStatCard';

// Basic usage
<InventoryStatCard
  title="Total Items"
  value={1247}
/>

// With all features
<InventoryStatCard
  title="Low Stock Items"
  value={23}
  trend={{ value: 5, direction: 'up' }}
  status="old"
  icon={<AlertIcon />}
  subtitle="Requires attention"
  onClick={() => navigate('/low-stock')}
/>

// Responsive grid
<div className="stat-cards-grid">
  <InventoryStatCard title="Total" value={1247} />
  <InventoryStatCard title="Low Stock" value={23} />
  <InventoryStatCard title="Expiring" value={8} />
  <InventoryStatCard title="Value" value="$42,150" />
</div>`}
          </pre>
        </div>
      </section>
    </div>
  );
}
