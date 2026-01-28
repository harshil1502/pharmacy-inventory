/**
 * PharmSync Button Component
 * Material Design 3 Implementation
 * Shoppers Drug Mart Design System
 */

import React from 'react';
import './Button.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'text' | 'error';
export type ButtonSize = 'small' | 'medium' | 'large';
export type IconPosition = 'left' | 'right';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @default 'medium'
   */
  size?: ButtonSize;

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Loading state with spinner
   * @default false
   */
  loading?: boolean;

  /**
   * Icon element to display
   */
  icon?: React.ReactNode;

  /**
   * Icon position relative to text
   * @default 'left'
   */
  iconPosition?: IconPosition;

  /**
   * Button content (text/children)
   */
  children?: React.ReactNode;

  /**
   * Accessible label (overrides children for screen readers)
   */
  ariaLabel?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Click handler
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Loading Spinner Component
 */
const LoadingSpinner: React.FC<{ size: ButtonSize }> = ({ size }) => {
  const spinnerSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;

  return (
    <svg
      className="button__spinner"
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
    >
      <circle
        className="button__spinner-circle"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        strokeWidth="3"
      />
    </svg>
  );
};

/**
 * Button Component
 *
 * @example
 * // Primary button
 * <Button variant="primary" onClick={handleClick}>
 *   Save Changes
 * </Button>
 *
 * @example
 * // Button with icon
 * <Button variant="secondary" icon={<PlusIcon />}>
 *   Add Item
 * </Button>
 *
 * @example
 * // Loading state
 * <Button variant="primary" loading>
 *   Submitting...
 * </Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      fullWidth = false,
      disabled = false,
      loading = false,
      icon,
      iconPosition = 'left',
      children,
      ariaLabel,
      className = '',
      onClick,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    // Build class names
    const classNames = [
      'button',
      `button--${variant}`,
      `button--${size}`,
      fullWidth && 'button--full-width',
      loading && 'button--loading',
      icon && !children && 'button--icon-only',
      className
    ]
      .filter(Boolean)
      .join(' ');

    // Disable button if disabled or loading
    const isDisabled = disabled || loading;

    // Handle click with loading/disabled check
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    // Render icon with position
    const renderIcon = () => {
      if (loading) {
        return <LoadingSpinner size={size} />;
      }
      if (icon) {
        return <span className="button__icon">{icon}</span>;
      }
      return null;
    };

    return (
      <button
        ref={ref}
        type={type}
        className={classNames}
        disabled={isDisabled}
        onClick={handleClick}
        aria-label={ariaLabel}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...rest}
      >
        {icon && iconPosition === 'left' && renderIcon()}
        {children && <span className="button__text">{children}</span>}
        {icon && iconPosition === 'right' && renderIcon()}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
