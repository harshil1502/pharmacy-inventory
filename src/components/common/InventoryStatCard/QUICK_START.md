# InventoryStatCard - Quick Start Guide

Get started with the PharmSync InventoryStatCard component in 60 seconds.

## Step 1: Import

```tsx
import { InventoryStatCard } from '@/components/common/InventoryStatCard';
```

## Step 2: Use It

```tsx
<InventoryStatCard
  title="Total Items"
  value={1247}
/>
```

That's it! 🎉

---

## Common Patterns

### Dashboard Stats Grid

```tsx
<div className="stat-cards-grid">
  <InventoryStatCard title="Total Items" value={1247} />
  <InventoryStatCard title="Low Stock" value={23} />
  <InventoryStatCard title="Expiring Soon" value={8} />
  <InventoryStatCard title="Total Value" value="$42,150" />
</div>
```

### With Trend Indicator

```tsx
<InventoryStatCard
  title="Total Items"
  value={1247}
  trend={{ value: 12, direction: 'up' }}
/>
```

Displays: **1247** with ↑ +12% in green

### With Status Badge

```tsx
<InventoryStatCard
  title="Low Stock Items"
  value={23}
  status="old"
/>
```

Shows red "Old (180+ days)" badge.

### With Icon

```tsx
import { PackageIcon } from '@heroicons/react/24/outline';

<InventoryStatCard
  title="Total Items"
  value={1247}
  icon={<PackageIcon />}
/>
```

### Interactive Card

```tsx
<InventoryStatCard
  title="Low Stock Items"
  value={23}
  status="old"
  onClick={() => navigate('/inventory/low-stock')}
/>
```

### Full-Featured Card

```tsx
<InventoryStatCard
  title="Low Stock Items"
  value={23}
  trend={{ value: 5, direction: 'up' }}
  status="old"
  icon={<AlertIcon />}
  subtitle="Requires attention"
  onClick={() => navigateToLowStock()}
/>
```

---

## Status Options

```tsx
// Fresh (green)
<InventoryStatCard title="Fresh Stock" value={845} status="fresh" />

// Moderate (yellow)
<InventoryStatCard title="Moderate" value={312} status="moderate" />

// Aging (orange)
<InventoryStatCard title="Aging" value={67} status="aging" />

// Old (red)
<InventoryStatCard title="Old Stock" value={23} status="old" />

// Obsolete (error red)
<InventoryStatCard title="Obsolete" value={5} status="obsolete" />
```

---

## Trend Options

```tsx
// Upward trend (green arrow, +X%)
trend={{ value: 12, direction: 'up' }}

// Downward trend (red arrow, -X%)
trend={{ value: -8, direction: 'down' }}
```

---

## Grid Layouts

### 4-Column (Default)

```tsx
<div className="stat-cards-grid">
  {/* 1-4 cards */}
</div>
```

Responsive:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 4 columns

### 3-Column

```tsx
<div className="stat-cards-grid stat-cards-grid--three-col">
  {/* 1-3 cards */}
</div>
```

Responsive:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

---

## Number Formatting

```tsx
// Without formatting
<InventoryStatCard title="Items" value={15420} />
// Shows: 15,420

// With formatting (K/M)
<InventoryStatCard title="Items" value={15420} formatValue />
// Shows: 15.4K
```

---

## Loading State

```tsx
const [loading, setLoading] = useState(true);

<InventoryStatCard
  title="Total Items"
  value={metrics?.total || 0}
  loading={loading}
/>
```

---

## Need More Help?

📖 **Full Documentation**: `README.md` in this directory
🎨 **Live Demo**: Visit `/stat-cards-demo` in your browser
💡 **Examples**: Check `InventoryStatCard.examples.tsx` for copy-paste code

---

## Props Cheatsheet

| Prop | Values | Example |
|------|--------|---------|
| `title` | string | `title="Total Items"` |
| `value` | number \| string | `value={1247}` or `value="$42K"` |
| `trend` | `{ value: number, direction: 'up' \| 'down' }` | `trend={{ value: 12, direction: 'up' }}` |
| `status` | `'fresh' \| 'moderate' \| 'aging' \| 'old' \| 'obsolete'` | `status="old"` |
| `icon` | ReactNode | `icon={<PackageIcon />}` |
| `subtitle` | string | `subtitle="Last 30 days"` |
| `onClick` | function | `onClick={() => {}}` |
| `loading` | boolean | `loading={true}` |
| `formatValue` | boolean | `formatValue={true}` |

---

**Happy coding!** 🚀
