/**
 * PharmSync InventoryStatCard Component
 * Material Design 3 stat card for dashboard metrics
 * Shoppers Drug Mart Design System
 */

import React from 'react';
import './InventoryStatCard.scss';

export type TrendDirection = 'up' | 'down';
export type InventoryStatus = 'fresh' | 'moderate' | 'aging' | 'old' | 'obsolete';

export interface Trend {
  /**
   * Trend value (e.g., 12 for +12%)
   */
  value: number;

  /**
   * Trend direction (up or down)
   */
  direction: TrendDirection;
}

export interface InventoryStatCardProps {
  /**
   * Card title/label
   */
  title: string;

  /**
   * Main stat value (number or formatted string)
   */
  value: number | string;

  /**
   * Optional trend indicator
   */
  trend?: Trend;

  /**
   * Optional inventory status badge
   */
  status?: InventoryStatus;

  /**
   * Optional icon element
   */
  icon?: React.ReactNode;

  /**
   * Optional subtitle/description
   */
  subtitle?: string;

  /**
   * Click handler for interactive cards
   */
  onClick?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Format large numbers with abbreviations (K, M)
   * @default false
   */
  formatValue?: boolean;
}

/**
 * Format large numbers with K/M abbreviations
 */
const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

/**
 * Get status badge label
 */
const getStatusLabel = (status: InventoryStatus): string => {
  const labels: Record<InventoryStatus, string> = {
    fresh: 'Fresh (0-30d)',
    moderate: 'Moderate (31-90d)',
    aging: 'Aging (91-180d)',
    old: 'Old (180+ days)',
    obsolete: 'Obsolete'
  };
  return labels[status];
};

/**
 * Trend Arrow Icon
 */
const TrendArrow: React.FC<{ direction: TrendDirection }> = ({ direction }) => {
  return (
    <svg
      className={`stat-card__trend-icon stat-card__trend-icon--${direction}`}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {direction === 'up' ? (
        <path
          d="M8 3L8 13M8 3L12 7M8 3L4 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M8 13L8 3M8 13L4 9M8 13L12 9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
};

/**
 * Loading Skeleton
 */
const LoadingSkeleton: React.FC = () => {
  return (
    <div className="stat-card stat-card--loading">
      <div className="stat-card__header">
        <div className="skeleton skeleton--text skeleton--title"></div>
      </div>
      <div className="stat-card__content">
        <div className="skeleton skeleton--text skeleton--value"></div>
        <div className="skeleton skeleton--text skeleton--trend"></div>
      </div>
    </div>
  );
};

/**
 * InventoryStatCard Component
 *
 * Display key metrics on the dashboard with optional trend indicators and status badges.
 *
 * @example
 * // Basic usage
 * <InventoryStatCard
 *   title="Total Items"
 *   value={1247}
 *   trend={{ value: 12, direction: 'up' }}
 * />
 *
 * @example
 * // With status and icon
 * <InventoryStatCard
 *   title="Low Stock Items"
 *   value={23}
 *   status="old"
 *   icon={<AlertIcon />}
 * />
 *
 * @example
 * // Interactive card
 * <InventoryStatCard
 *   title="Items Expiring Soon"
 *   value={8}
 *   onClick={() => navigateToExpiring()}
 * />
 */
export const InventoryStatCard = React.forwardRef<HTMLDivElement, InventoryStatCardProps>(
  (
    {
      title,
      value,
      trend,
      status,
      icon,
      subtitle,
      onClick,
      className = '',
      loading = false,
      formatValue = false
    },
    ref
  ) => {
    // Show loading skeleton
    if (loading) {
      return <LoadingSkeleton />;
    }

    // Format value if needed
    const displayValue =
      formatValue && typeof value === 'number' ? formatNumber(value) : value;

    // Build class names
    const classNames = [
      'stat-card',
      onClick && 'stat-card--interactive',
      status && `stat-card--status-${status}`,
      className
    ]
      .filter(Boolean)
      .join(' ');

    // Determine if trend is positive (for semantic color)
    const isTrendPositive = trend?.direction === 'up';

    return (
      <div
        ref={ref}
        className={classNames}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
      >
        {/* Header */}
        <div className="stat-card__header">
          {icon && <div className="stat-card__icon">{icon}</div>}
          <div className="stat-card__title-group">
            <h3 className="stat-card__title">{title}</h3>
            {subtitle && <p className="stat-card__subtitle">{subtitle}</p>}
          </div>
          {status && (
            <span className={`stat-card__badge stat-card__badge--${status}`}>
              <span className="stat-card__badge-dot" aria-hidden="true">
                ●
              </span>
              <span className="stat-card__badge-label">{getStatusLabel(status)}</span>
            </span>
          )}
        </div>

        {/* Content */}
        <div className="stat-card__content">
          <div className="stat-card__value">{displayValue}</div>

          {trend && (
            <div
              className={`stat-card__trend stat-card__trend--${trend.direction}`}
              role="status"
              aria-label={`${isTrendPositive ? 'Increased' : 'Decreased'} by ${Math.abs(
                trend.value
              )}%`}
            >
              <TrendArrow direction={trend.direction} />
              <span className="stat-card__trend-value">
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

InventoryStatCard.displayName = 'InventoryStatCard';

export default InventoryStatCard;
