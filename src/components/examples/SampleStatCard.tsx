/**
 * PharmSync Sample Stat Card Component
 * Demonstrates the Shoppers Drug Mart design system implementation
 * Material Design 3 with SCSS tokens
 */

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    direction: 'positive' | 'negative' | 'neutral';
  };
  icon?: React.ReactNode;
  compact?: boolean;
  onClick?: () => void;
}

/**
 * Stat Card Component
 * Used for displaying key metrics on the dashboard
 *
 * @example
 * <StatCard
 *   label="Total Items"
 *   value="1,247"
 *   trend={{ value: '+12%', direction: 'positive' }}
 * />
 */
export function StatCard({
  label,
  value,
  trend,
  icon,
  compact = false,
  onClick
}: StatCardProps) {
  return (
    <div
      className={`stat-card ${compact ? 'stat-card--compact' : ''} ${onClick ? 'card--interactive' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon && (
        <div className="stat-card__icon">
          {icon}
        </div>
      )}

      <div className="stat-card__label">
        {label}
      </div>

      <div className="stat-card__value">
        {value}
      </div>

      {trend && (
        <div className={`stat-card__trend stat-card__trend--${trend.direction}`}>
          <span>
            {trend.direction === 'positive' && '↑'}
            {trend.direction === 'negative' && '↓'}
            {trend.direction === 'neutral' && '→'}
          </span>
          {trend.value}
        </div>
      )}
    </div>
  );
}

// Status Badge Example Component
interface StatusBadgeProps {
  status: 'fresh' | 'moderate' | 'aging' | 'old' | 'obsolete';
  label?: string;
  size?: 'small' | 'default' | 'large';
  solid?: boolean;
}

export function StatusBadge({
  status,
  label,
  size = 'default',
  solid = false
}: StatusBadgeProps) {
  const getLabel = () => {
    if (label) return label;

    switch (status) {
      case 'fresh': return 'Fresh (0-30d)';
      case 'moderate': return 'Moderate (31-90d)';
      case 'aging': return 'Aging (91-180d)';
      case 'old': return 'Old (180+ days)';
      case 'obsolete': return 'Obsolete';
      default: return status;
    }
  };

  return (
    <span
      className={`status-badge status-badge--${status} ${size !== 'default' ? `status-badge--${size}` : ''} ${solid ? 'status-badge--solid' : ''}`}
      role="status"
      aria-label={`Inventory status: ${getLabel()}`}
    >
      <span className="status-badge__icon">●</span>
      {getLabel()}
    </span>
  );
}

// Button Examples
export function ButtonExamples() {
  return (
    <div className="section">
      <h2 className="typescale-headline-small" style={{ marginBottom: '24px' }}>
        Button Examples
      </h2>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <button className="button-primary">
          Primary Action
        </button>

        <button className="button-secondary">
          Secondary Action
        </button>

        <button className="button-outlined">
          Outlined Button
        </button>

        <button className="button-text">
          Text Button
        </button>

        <button className="button-error">
          Delete Item
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button className="button-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <button className="fab">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Complete Dashboard Example
export function DashboardExample() {
  return (
    <div className="page-container">
      <header style={{ marginBottom: '32px' }}>
        <h1 className="typescale-headline-large">Inventory Dashboard</h1>
        <p className="typescale-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: '8px' }}>
          PharmSync - Shoppers Drug Mart Design System
        </p>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <StatCard
          label="Total Items"
          value="1,247"
          trend={{ value: '+12%', direction: 'positive' }}
        />
        <StatCard
          label="Low Stock Items"
          value="23"
          trend={{ value: '+5', direction: 'negative' }}
        />
        <StatCard
          label="Items Expiring Soon"
          value="8"
          trend={{ value: '→ Same', direction: 'neutral' }}
        />
        <StatCard
          label="Total Value"
          value="$42,150"
          trend={{ value: '+8%', direction: 'positive' }}
        />
      </div>

      {/* Status Badges Example */}
      <div className="section">
        <h2 className="typescale-title-large" style={{ marginBottom: '16px' }}>
          Inventory Status
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <StatusBadge status="fresh" />
          <StatusBadge status="moderate" />
          <StatusBadge status="aging" />
          <StatusBadge status="old" />
          <StatusBadge status="obsolete" />
        </div>
      </div>

      {/* Card Example */}
      <div className="section" style={{ marginTop: '32px' }}>
        <div className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Recent Activity</h3>
              <p className="card__subtitle">Last 24 hours</p>
            </div>
            <StatusBadge status="fresh" size="small" />
          </div>

          <div className="card__content">
            <p>Sample card content demonstrating the Shoppers Drug Mart design system with Material Design 3 tokens.</p>
          </div>

          <div className="card__footer">
            <button className="button-text">View Details</button>
            <button className="button-primary">Take Action</button>
          </div>
        </div>
      </div>

      {/* Button Examples */}
      <ButtonExamples />
    </div>
  );
}

export default DashboardExample;
