/**
 * PharmSync InventoryStatCard Component
 * Usage Examples for Documentation
 */

import React from 'react';
import { InventoryStatCard } from './InventoryStatCard';

// Example Icons
const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
    />
  </svg>
);

// =========================================
// EXAMPLE 1: Dashboard Overview Grid
// =========================================

export function DashboardOverviewExample() {
  return (
    <div className="stat-cards-grid">
      <InventoryStatCard
        title="Total Items"
        value={1247}
        trend={{ value: 12, direction: 'up' }}
        icon={<PackageIcon />}
        subtitle="All medications"
      />

      <InventoryStatCard
        title="Low Stock Items"
        value={23}
        trend={{ value: 5, direction: 'up' }}
        status="old"
        icon={<AlertIcon />}
        subtitle="Requires attention"
      />

      <InventoryStatCard
        title="Expiring Soon"
        value={8}
        trend={{ value: -2, direction: 'down' }}
        status="aging"
        icon={<ClockIcon />}
        subtitle="Next 30 days"
      />

      <InventoryStatCard
        title="Total Value"
        value="$42,150"
        trend={{ value: 8, direction: 'up' }}
        icon={<DollarIcon />}
        subtitle="Current inventory"
      />
    </div>
  );
}

// =========================================
// EXAMPLE 2: Interactive Cards
// =========================================

export function InteractiveCardsExample() {
  const handleCardClick = (cardName: string) => {
    alert(`Navigating to ${cardName}...`);
  };

  return (
    <div className="stat-cards-grid">
      <InventoryStatCard
        title="Total Items"
        value={1247}
        icon={<PackageIcon />}
        onClick={() => handleCardClick('All Inventory')}
      />

      <InventoryStatCard
        title="Low Stock"
        value={23}
        status="old"
        icon={<AlertIcon />}
        onClick={() => handleCardClick('Low Stock Items')}
      />

      <InventoryStatCard
        title="Expiring Soon"
        value={8}
        status="aging"
        icon={<ClockIcon />}
        onClick={() => handleCardClick('Expiring Items')}
      />
    </div>
  );
}

// =========================================
// EXAMPLE 3: Status-based Cards
// =========================================

export function StatusCardsExample() {
  return (
    <div className="stat-cards-grid">
      <InventoryStatCard
        title="Fresh Stock"
        value={845}
        status="fresh"
        subtitle="0-30 days old"
      />

      <InventoryStatCard
        title="Moderate Age"
        value={312}
        status="moderate"
        subtitle="31-90 days old"
      />

      <InventoryStatCard
        title="Aging Stock"
        value={67}
        status="aging"
        subtitle="91-180 days old"
      />

      <InventoryStatCard
        title="Old Stock"
        value={23}
        status="old"
        subtitle="180+ days old"
      />
    </div>
  );
}

// =========================================
// EXAMPLE 4: Loading States
// =========================================

export function LoadingStatesExample() {
  return (
    <div className="stat-cards-grid">
      <InventoryStatCard
        title="Total Items"
        value={1247}
        loading
      />

      <InventoryStatCard
        title="Low Stock"
        value={23}
        loading
      />

      <InventoryStatCard
        title="Expiring Soon"
        value={8}
        loading
      />

      <InventoryStatCard
        title="Total Value"
        value="$42,150"
        loading
      />
    </div>
  );
}

// =========================================
// EXAMPLE 5: Large Number Formatting
// =========================================

export function FormattedNumbersExample() {
  return (
    <div className="stat-cards-grid">
      <InventoryStatCard
        title="Small Number"
        value={847}
        formatValue
        subtitle="Under 1,000"
      />

      <InventoryStatCard
        title="Thousands"
        value={15420}
        formatValue
        subtitle="15.4K"
      />

      <InventoryStatCard
        title="Millions"
        value={2567890}
        formatValue
        subtitle="2.6M"
      />

      <InventoryStatCard
        title="Custom Format"
        value="$42.1K"
        subtitle="Already formatted"
      />
    </div>
  );
}

// =========================================
// EXAMPLE 6: Transfer Requests Dashboard
// =========================================

export function TransferRequestsExample() {
  return (
    <div className="stat-cards-grid--three-col">
      <InventoryStatCard
        title="Pending Requests"
        value={12}
        icon={<TruckIcon />}
        trend={{ value: 3, direction: 'up' }}
        onClick={() => alert('View pending requests')}
      />

      <InventoryStatCard
        title="In Transit"
        value={5}
        icon={<TruckIcon />}
        subtitle="Being delivered"
        onClick={() => alert('View in-transit items')}
      />

      <InventoryStatCard
        title="Completed Today"
        value={8}
        icon={<TruckIcon />}
        trend={{ value: 2, direction: 'up' }}
        onClick={() => alert('View completed transfers')}
      />
    </div>
  );
}

// =========================================
// EXAMPLE 7: Store Comparison
// =========================================

export function StoreComparisonExample() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
          Store A - Downtown
        </h3>
        <div className="stat-cards-grid">
          <InventoryStatCard
            title="Total Items"
            value={1247}
            trend={{ value: 12, direction: 'up' }}
          />
          <InventoryStatCard
            title="Low Stock"
            value={23}
            status="old"
          />
          <InventoryStatCard
            title="Value"
            value="$42,150"
          />
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
          Store B - Uptown
        </h3>
        <div className="stat-cards-grid">
          <InventoryStatCard
            title="Total Items"
            value={892}
            trend={{ value: -3, direction: 'down' }}
          />
          <InventoryStatCard
            title="Low Stock"
            value={45}
            status="old"
          />
          <InventoryStatCard
            title="Value"
            value="$31,200"
          />
        </div>
      </div>
    </div>
  );
}

// =========================================
// EXAMPLE 8: Minimal Cards (No Icons/Status)
// =========================================

export function MinimalCardsExample() {
  return (
    <div className="stat-cards-grid">
      <InventoryStatCard
        title="Total Items"
        value={1247}
      />

      <InventoryStatCard
        title="Categories"
        value={42}
      />

      <InventoryStatCard
        title="Suppliers"
        value={18}
      />

      <InventoryStatCard
        title="Stores"
        value={3}
      />
    </div>
  );
}

// =========================================
// EXAMPLE 9: Mixed Formats
// =========================================

export function MixedFormatsExample() {
  return (
    <div className="stat-cards-grid">
      <InventoryStatCard
        title="Items in Stock"
        value={1247}
        icon={<PackageIcon />}
      />

      <InventoryStatCard
        title="Revenue Today"
        value="$2,450.50"
        icon={<DollarIcon />}
        trend={{ value: 15, direction: 'up' }}
      />

      <InventoryStatCard
        title="Fulfillment Rate"
        value="98.5%"
        trend={{ value: 2.3, direction: 'up' }}
      />

      <InventoryStatCard
        title="Avg. Processing Time"
        value="4.2 min"
        icon={<ClockIcon />}
        trend={{ value: -8, direction: 'down' }}
      />
    </div>
  );
}

// =========================================
// EXAMPLE 10: Single Row Layout
// =========================================

export function SingleRowExample() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
      <InventoryStatCard
        title="Total Items"
        value={1247}
        trend={{ value: 12, direction: 'up' }}
      />

      <InventoryStatCard
        title="Low Stock"
        value={23}
        trend={{ value: 5, direction: 'up' }}
        status="old"
      />

      <InventoryStatCard
        title="Expiring Soon"
        value={8}
        trend={{ value: -2, direction: 'down' }}
        status="aging"
      />
    </div>
  );
}
