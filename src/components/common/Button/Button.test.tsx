/**
 * PharmSync Button Component Tests
 * Unit tests using React Testing Library
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button Component', () => {
  // =========================================
  // BASIC RENDERING
  // =========================================

  describe('Rendering', () => {
    it('renders with text content', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(<Button className="custom-class">Button</Button>);
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('renders with aria-label', () => {
      render(<Button ariaLabel="Custom Label">Button</Button>);
      expect(screen.getByRole('button', { name: /custom label/i })).toBeInTheDocument();
    });

    it('renders as button type by default', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('renders with custom type', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  // =========================================
  // VARIANTS
  // =========================================

  describe('Variants', () => {
    it('renders primary variant by default', () => {
      const { container } = render(<Button>Primary</Button>);
      expect(container.querySelector('.button--primary')).toBeInTheDocument();
    });

    it('renders secondary variant', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>);
      expect(container.querySelector('.button--secondary')).toBeInTheDocument();
    });

    it('renders outlined variant', () => {
      const { container } = render(<Button variant="outlined">Outlined</Button>);
      expect(container.querySelector('.button--outlined')).toBeInTheDocument();
    });

    it('renders text variant', () => {
      const { container } = render(<Button variant="text">Text</Button>);
      expect(container.querySelector('.button--text')).toBeInTheDocument();
    });

    it('renders error variant', () => {
      const { container } = render(<Button variant="error">Delete</Button>);
      expect(container.querySelector('.button--error')).toBeInTheDocument();
    });
  });

  // =========================================
  // SIZES
  // =========================================

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      const { container } = render(<Button>Medium</Button>);
      expect(container.querySelector('.button--medium')).toBeInTheDocument();
    });

    it('renders small size', () => {
      const { container } = render(<Button size="small">Small</Button>);
      expect(container.querySelector('.button--small')).toBeInTheDocument();
    });

    it('renders large size', () => {
      const { container } = render(<Button size="large">Large</Button>);
      expect(container.querySelector('.button--large')).toBeInTheDocument();
    });
  });

  // =========================================
  // STATES
  // =========================================

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('prevents click when disabled', () => {
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles loading state', () => {
      const { container } = render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');

      expect(container.querySelector('.button--loading')).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toBeDisabled();
    });

    it('prevents click when loading', () => {
      const handleClick = jest.fn();
      render(<Button loading onClick={handleClick}>Loading</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('shows loading spinner when loading', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
    });
  });

  // =========================================
  // FULL WIDTH
  // =========================================

  describe('Full Width', () => {
    it('renders full width button', () => {
      const { container } = render(<Button fullWidth>Full Width</Button>);
      expect(container.querySelector('.button--full-width')).toBeInTheDocument();
    });
  });

  // =========================================
  // ICON SUPPORT
  // =========================================

  describe('Icons', () => {
    const TestIcon = () => (
      <svg data-testid="test-icon">
        <path d="M0 0" />
      </svg>
    );

    it('renders with left icon by default', () => {
      const { container } = render(
        <Button icon={<TestIcon />}>With Icon</Button>
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(container.querySelector('.button__icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      render(
        <Button icon={<TestIcon />} iconPosition="right">
          With Icon
        </Button>
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders icon-only button', () => {
      const { container } = render(<Button icon={<TestIcon />} ariaLabel="Icon only" />);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(container.querySelector('.button--icon-only')).toBeInTheDocument();
    });

    it('hides icon when loading', () => {
      const { container } = render(
        <Button icon={<TestIcon />} loading>
          Loading
        </Button>
      );

      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
      expect(container.querySelector('.button__spinner')).toBeInTheDocument();
    });
  });

  // =========================================
  // INTERACTIONS
  // =========================================

  describe('Interactions', () => {
    it('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick with event object', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('supports keyboard navigation (Enter)', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Press Enter</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard navigation (Space)', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Press Space</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================
  // REF FORWARDING
  // =========================================

  describe('Ref Forwarding', () => {
    it('forwards ref to button element', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.tagName).toBe('BUTTON');
    });

    it('allows calling focus on ref', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);

      ref.current?.focus();
      expect(document.activeElement).toBe(ref.current);
    });
  });

  // =========================================
  // ACCESSIBILITY
  // =========================================

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Button>Accessible</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('type', 'button');
      expect(button).not.toHaveAttribute('aria-disabled');
      expect(button).not.toHaveAttribute('aria-busy');
    });

    it('sets aria-disabled when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('sets aria-busy when loading', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('has accessible loading indicator', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
    });

    it('uses aria-label when provided', () => {
      render(<Button ariaLabel="Save changes">Save</Button>);
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });
  });

  // =========================================
  // EDGE CASES
  // =========================================

  describe('Edge Cases', () => {
    it('renders without children', () => {
      const { container } = render(<Button />);
      expect(container.querySelector('.button')).toBeInTheDocument();
    });

    it('handles multiple class names', () => {
      const { container } = render(
        <Button variant="primary" size="large" fullWidth className="custom">
          Button
        </Button>
      );

      const button = container.querySelector('.button');
      expect(button).toHaveClass('button--primary');
      expect(button).toHaveClass('button--large');
      expect(button).toHaveClass('button--full-width');
      expect(button).toHaveClass('custom');
    });

    it('passes through additional HTML attributes', () => {
      render(
        <Button data-testid="custom-button" id="my-button">
          Button
        </Button>
      );

      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('id', 'my-button');
    });
  });
});
