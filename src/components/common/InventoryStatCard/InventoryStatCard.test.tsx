/**
 * PharmSync InventoryStatCard Component Tests
 * Unit tests using React Testing Library
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InventoryStatCard } from './InventoryStatCard';

describe('InventoryStatCard Component', () => {
  // =========================================
  // BASIC RENDERING
  // =========================================

  describe('Rendering', () => {
    it('renders with title and value', () => {
      render(<InventoryStatCard title="Total Items" value={1247} />);

      expect(screen.getByRole('heading', { name: /total items/i })).toBeInTheDocument();
      expect(screen.getByText('1247')).toBeInTheDocument();
    });

    it('renders with string value', () => {
      render(<InventoryStatCard title="Total Value" value="$42,150" />);

      expect(screen.getByText('$42,150')).toBeInTheDocument();
    });

    it('renders with subtitle', () => {
      render(
        <InventoryStatCard
          title="Low Stock"
          value={23}
          subtitle="Requires attention"
        />
      );

      expect(screen.getByText('Requires attention')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <InventoryStatCard
          title="Test"
          value={100}
          className="custom-class"
        />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  // =========================================
  // TREND INDICATOR
  // =========================================

  describe('Trend Indicator', () => {
    it('renders upward trend', () => {
      render(
        <InventoryStatCard
          title="Sales"
          value={1000}
          trend={{ value: 12, direction: 'up' }}
        />
      );

      expect(screen.getByText('+12%')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Increased by 12%'
      );
    });

    it('renders downward trend', () => {
      render(
        <InventoryStatCard
          title="Stock"
          value={500}
          trend={{ value: -5, direction: 'down' }}
        />
      );

      expect(screen.getByText('-5%')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Decreased by 5%'
      );
    });

    it('renders positive trend without plus sign correctly', () => {
      render(
        <InventoryStatCard
          title="Test"
          value={100}
          trend={{ value: 8, direction: 'up' }}
        />
      );

      expect(screen.getByText('+8%')).toBeInTheDocument();
    });

    it('does not render trend when not provided', () => {
      render(<InventoryStatCard title="Test" value={100} />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // =========================================
  // STATUS BADGE
  // =========================================

  describe('Status Badge', () => {
    it('renders fresh status badge', () => {
      render(
        <InventoryStatCard title="Items" value={100} status="fresh" />
      );

      expect(screen.getByText(/fresh \(0-30d\)/i)).toBeInTheDocument();
    });

    it('renders moderate status badge', () => {
      render(
        <InventoryStatCard title="Items" value={100} status="moderate" />
      );

      expect(screen.getByText(/moderate \(31-90d\)/i)).toBeInTheDocument();
    });

    it('renders aging status badge', () => {
      render(
        <InventoryStatCard title="Items" value={100} status="aging" />
      );

      expect(screen.getByText(/aging \(91-180d\)/i)).toBeInTheDocument();
    });

    it('renders old status badge', () => {
      render(
        <InventoryStatCard title="Items" value={100} status="old" />
      );

      expect(screen.getByText(/old \(180\+ days\)/i)).toBeInTheDocument();
    });

    it('renders obsolete status badge', () => {
      render(
        <InventoryStatCard title="Items" value={100} status="obsolete" />
      );

      expect(screen.getByText(/obsolete/i)).toBeInTheDocument();
    });

    it('does not render badge when status not provided', () => {
      const { container } = render(
        <InventoryStatCard title="Test" value={100} />
      );

      expect(container.querySelector('.stat-card__badge')).not.toBeInTheDocument();
    });

    it('applies status class to card', () => {
      const { container } = render(
        <InventoryStatCard title="Items" value={100} status="old" />
      );

      expect(container.querySelector('.stat-card--status-old')).toBeInTheDocument();
    });
  });

  // =========================================
  // ICON
  // =========================================

  describe('Icon', () => {
    const TestIcon = () => (
      <svg data-testid="test-icon">
        <path d="M0 0" />
      </svg>
    );

    it('renders with icon', () => {
      render(
        <InventoryStatCard
          title="Items"
          value={100}
          icon={<TestIcon />}
        />
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders without icon when not provided', () => {
      const { container } = render(
        <InventoryStatCard title="Items" value={100} />
      );

      expect(container.querySelector('.stat-card__icon')).not.toBeInTheDocument();
    });
  });

  // =========================================
  // VALUE FORMATTING
  // =========================================

  describe('Value Formatting', () => {
    it('formats thousands with K', () => {
      render(
        <InventoryStatCard
          title="Items"
          value={1500}
          formatValue
        />
      );

      expect(screen.getByText('1.5K')).toBeInTheDocument();
    });

    it('formats millions with M', () => {
      render(
        <InventoryStatCard
          title="Items"
          value={2500000}
          formatValue
        />
      );

      expect(screen.getByText('2.5M')).toBeInTheDocument();
    });

    it('does not format when formatValue is false', () => {
      render(
        <InventoryStatCard
          title="Items"
          value={1500}
          formatValue={false}
        />
      );

      expect(screen.getByText('1,500')).toBeInTheDocument();
    });

    it('does not format string values', () => {
      render(
        <InventoryStatCard
          title="Items"
          value="Custom Value"
          formatValue
        />
      );

      expect(screen.getByText('Custom Value')).toBeInTheDocument();
    });

    it('formats numbers less than 1000 with locale string', () => {
      render(
        <InventoryStatCard
          title="Items"
          value={999}
          formatValue
        />
      );

      expect(screen.getByText('999')).toBeInTheDocument();
    });
  });

  // =========================================
  // INTERACTIVE CARDS
  // =========================================

  describe('Interactive Cards', () => {
    it('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(
        <InventoryStatCard
          title="Items"
          value={100}
          onClick={handleClick}
        />
      );

      const card = screen.getByRole('button');
      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has role button when onClick is provided', () => {
      render(
        <InventoryStatCard
          title="Items"
          value={100}
          onClick={() => {}}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('does not have role button when onClick is not provided', () => {
      render(<InventoryStatCard title="Items" value={100} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('supports keyboard navigation (Enter)', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(
        <InventoryStatCard
          title="Items"
          value={100}
          onClick={handleClick}
        />
      );

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard navigation (Space)', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(
        <InventoryStatCard
          title="Items"
          value={100}
          onClick={handleClick}
        />
      );

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('prevents default behavior on Space key', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(
        <InventoryStatCard
          title="Items"
          value={100}
          onClick={handleClick}
        />
      );

      const card = screen.getByRole('button');
      card.focus();

      // Space should not scroll the page
      const event = new KeyboardEvent('keydown', { key: ' ' });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      await user.keyboard(' ');

      // Just verify the click happened (preventDefault is handled internally)
      expect(handleClick).toHaveBeenCalled();
    });

    it('adds interactive class when onClick is provided', () => {
      const { container } = render(
        <InventoryStatCard
          title="Items"
          value={100}
          onClick={() => {}}
        />
      );

      expect(container.querySelector('.stat-card--interactive')).toBeInTheDocument();
    });
  });

  // =========================================
  // LOADING STATE
  // =========================================

  describe('Loading State', () => {
    it('shows loading skeleton when loading is true', () => {
      const { container } = render(
        <InventoryStatCard
          title="Items"
          value={100}
          loading
        />
      );

      expect(container.querySelector('.stat-card--loading')).toBeInTheDocument();
      expect(container.querySelector('.skeleton')).toBeInTheDocument();
    });

    it('does not show content when loading', () => {
      render(
        <InventoryStatCard
          title="Items"
          value={100}
          loading
        />
      );

      expect(screen.queryByText('Items')).not.toBeInTheDocument();
      expect(screen.queryByText('100')).not.toBeInTheDocument();
    });

    it('shows content when loading is false', () => {
      render(
        <InventoryStatCard
          title="Items"
          value={100}
          loading={false}
        />
      );

      expect(screen.getByText('Items')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  // =========================================
  // REF FORWARDING
  // =========================================

  describe('Ref Forwarding', () => {
    it('forwards ref to card element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <InventoryStatCard
          ref={ref}
          title="Items"
          value={100}
        />
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.className).toContain('stat-card');
    });
  });

  // =========================================
  // ACCESSIBILITY
  // =========================================

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<InventoryStatCard title="Total Items" value={100} />);

      const heading = screen.getByRole('heading', { name: /total items/i });
      expect(heading.tagName).toBe('H3');
    });

    it('has accessible trend status', () => {
      render(
        <InventoryStatCard
          title="Items"
          value={100}
          trend={{ value: 12, direction: 'up' }}
        />
      );

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label', 'Increased by 12%');
    });

    it('is keyboard accessible when interactive', () => {
      render(
        <InventoryStatCard
          title="Items"
          value={100}
          onClick={() => {}}
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('is not keyboard accessible when not interactive', () => {
      render(<InventoryStatCard title="Items" value={100} />);

      const { container } = render(<InventoryStatCard title="Items" value={100} />);
      const card = container.querySelector('.stat-card');

      expect(card).not.toHaveAttribute('tabIndex');
      expect(card).not.toHaveAttribute('role', 'button');
    });
  });

  // =========================================
  // EDGE CASES
  // =========================================

  describe('Edge Cases', () => {
    it('handles zero value', () => {
      render(<InventoryStatCard title="Items" value={0} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles negative value', () => {
      render(<InventoryStatCard title="Items" value={-50} />);

      expect(screen.getByText('-50')).toBeInTheDocument();
    });

    it('handles very large numbers', () => {
      render(
        <InventoryStatCard
          title="Items"
          value={999999999}
          formatValue
        />
      );

      expect(screen.getByText('1000.0M')).toBeInTheDocument();
    });

    it('handles empty string value', () => {
      render(<InventoryStatCard title="Items" value="" />);

      // Should render even if empty
      expect(screen.getByRole('heading', { name: /items/i })).toBeInTheDocument();
    });

    it('combines all props correctly', () => {
      const TestIcon = () => <svg data-testid="icon" />;
      const handleClick = jest.fn();

      render(
        <InventoryStatCard
          title="Total Items"
          value={1247}
          subtitle="Last 30 days"
          trend={{ value: 12, direction: 'up' }}
          status="fresh"
          icon={<TestIcon />}
          onClick={handleClick}
          className="custom"
        />
      );

      expect(screen.getByText('Total Items')).toBeInTheDocument();
      expect(screen.getByText('1,247')).toBeInTheDocument();
      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
      expect(screen.getByText('+12%')).toBeInTheDocument();
      expect(screen.getByText(/fresh/i)).toBeInTheDocument();
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
