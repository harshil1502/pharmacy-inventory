# PharmSync Design System - Quick Start

## 🎨 Overview

PharmSync uses a complete **Material Design 3** implementation with **Shoppers Drug Mart** branding (#E12F29 red primary). The design system includes full dark and light theme support.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000` with the design system fully integrated.

## 📁 File Structure

```
src/
├── styles/
│   ├── abstracts/
│   │   ├── _colors.scss         # Complete color system (dark + light themes)
│   │   ├── _typography.scss     # Material Design 3 type scale
│   │   ├── _spacing.scss        # 4px baseline grid
│   │   ├── _shapes.scss         # Border radius tokens
│   │   ├── _elevation.scss      # Shadow system with red tint
│   │   ├── _breakpoints.scss    # Responsive breakpoints
│   │   └── _animations.scss     # M3 motion system
│   ├── base/
│   │   ├── _reset.scss          # CSS reset
│   │   └── _global.scss         # Global styles
│   ├── components/
│   │   ├── _buttons.scss        # Button components
│   │   ├── _cards.scss          # Card & stat card components
│   │   └── _status-badge.scss   # Inventory status badges
│   └── main.scss                # Main import file
├── components/
│   ├── examples/
│   │   └── SampleStatCard.tsx   # Component examples
│   └── ThemeToggle.tsx          # Theme switcher
├── utils/
│   └── theme.ts                 # Theme management utilities
└── App.tsx                      # Main app with integrated design system
```

## 🎨 Using the Design System

### Colors

```scss
// In SCSS files
.my-component {
  background-color: var(--md-sys-color-primary);  // Shoppers red
  color: var(--md-sys-color-on-primary);          // White on red
  border-radius: var(--md-sys-shape-card);        // 12px
  padding: $spacing-6;                            // 24px
  @include elevation(1);                          // Material shadow
}
```

```tsx
// In React components (inline styles)
<div style={{
  backgroundColor: 'var(--md-sys-color-surface-container)',
  color: 'var(--md-sys-color-on-surface)',
  padding: 'var(--spacing-6)'
}}>
  Content
</div>
```

### Components

```tsx
import { StatCard, StatusBadge } from '@/components/examples/SampleStatCard';

// Stat Card
<StatCard
  label="Total Items"
  value="1,247"
  trend={{ value: '+12%', direction: 'positive' }}
/>

// Status Badge
<StatusBadge status="fresh" />     // Green (0-30 days)
<StatusBadge status="moderate" />  // Amber (31-90 days)
<StatusBadge status="aging" />     // Orange (91-180 days)
<StatusBadge status="old" />       // Red (180+ days) - CRITICAL
<StatusBadge status="obsolete" />  // Violet
```

### Buttons

```tsx
// Primary button (Shoppers red, pill shape)
<button className="button-primary">Add Item</button>

// Secondary button (medical blue)
<button className="button-secondary">Cancel</button>

// Outlined button
<button className="button-outlined">Details</button>

// Text button
<button className="button-text">Learn More</button>

// Icon button
<button className="button-icon">
  <svg>...</svg>
</button>

// Floating Action Button
<button className="fab">
  <svg>...</svg>
</button>
```

### Typography

```tsx
// Using utility classes
<h1 className="typescale-headline-large">Page Title</h1>
<h2 className="typescale-headline-small">Section Header</h2>
<h3 className="typescale-title-medium">Card Title</h3>
<p className="typescale-body-medium">Body text</p>
<button className="typescale-label-large">Button Text</button>
```

```scss
// Using mixins in SCSS
.page-title {
  @include typography($md-sys-typescale-headline-large);
}
```

### Cards

```tsx
<div className="card">
  <div className="card__header">
    <h3 className="card__title">Card Title</h3>
    <p className="card__subtitle">Subtitle</p>
  </div>

  <div className="card__content">
    Card content here
  </div>

  <div className="card__footer">
    <button className="button-text">Action</button>
  </div>
</div>

// Stat card
<div className="stat-card">
  <div className="stat-card__label">Total Value</div>
  <div className="stat-card__value">$42,150</div>
  <div className="stat-card__trend stat-card__trend--positive">
    ↑ +8%
  </div>
</div>
```

## 🌓 Theme Switching

### Manual Toggle

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

<ThemeToggle />
```

### Programmatic Control

```tsx
import { useTheme } from '@/utils/theme';

function MyComponent() {
  const { theme, effectiveTheme, setTheme, toggle } = useTheme();

  return (
    <div>
      <p>Current theme: {effectiveTheme}</p>
      <button onClick={toggle}>Toggle Theme</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>Auto</button>
    </div>
  );
}
```

### HTML Attribute

```html
<!-- Dark theme (default) -->
<html>

<!-- Light theme -->
<html data-theme="light">
```

## 🎨 Color Palette

### Primary (Shoppers Red)
- Primary: `#E12F29`
- Use for: Primary actions, critical alerts, branding

### Secondary (Medical Blue)
- Secondary: `#0066CC`
- Use for: Secondary actions, informational elements

### Surfaces (Dark Theme)
- Background: `#0F0F0F` (deep black)
- Surface Low: `#1A1A1A` (sidebar)
- Surface: `#2F2F2F` (cards, Shoppers gray)
- Surface High: `#404040` (hover)

### Status Colors (Inventory Aging)
- Fresh (0-30 days): `#10B981` (emerald)
- Moderate (31-90 days): `#F59E0B` (amber)
- Aging (91-180 days): `#F97316` (orange)
- Old (180+ days): `#E12F29` (Shoppers red - critical!)
- Obsolete: `#8B5CF6` (violet)

## 📐 Spacing

Use the 4px baseline grid:

```scss
$spacing-1: 4px     // Extra small
$spacing-2: 8px     // Small
$spacing-3: 12px    // Small-medium
$spacing-4: 16px    // Base unit
$spacing-6: 24px    // Card padding
$spacing-8: 32px    // Section gaps
$spacing-12: 48px   // Page margins
```

## 🔄 Responsive Breakpoints

```scss
@include sm { }     // 640px+
@include md { }     // 768px+
@include lg { }     // 1024px+
@include xl { }     // 1280px+
```

## ✨ Elevation (Shadows)

```scss
.card {
  @include elevation(1);        // Resting state
  @include elevation-transition; // Smooth animation

  &:hover {
    @include elevation(2);       // Hover state
  }
}
```

## 📝 Design Tokens Available

### Colors
- `--md-sys-color-primary` through `--md-sys-color-on-error-container`
- `--md-sys-color-status-fresh` through `--md-sys-color-status-obsolete`

### Typography
- `--md-sys-typescale-display-large` through `--md-sys-typescale-body-small`

### Shapes
- `--md-sys-shape-corner-none` through `--md-sys-shape-corner-full`

### Spacing
- `--spacing-0` through `--spacing-20`

### Elevation
- `--elevation-0` through `--elevation-5`

## 🎯 Best Practices

1. **Always use design tokens** instead of hardcoded values
2. **Reserve Shoppers red** for primary actions and critical alerts
3. **Use semantic color roles** (primary, secondary, surface, etc.)
4. **Follow the 4px spacing grid** for consistent layouts
5. **Test both themes** to ensure accessibility
6. **Use status colors** only for inventory aging indicators

## 📚 Full Documentation

See `README.md` for complete design system documentation and component patterns.

## 🧪 Testing the Design System

Run the development server and navigate to the dashboard to see all components in action with live theme switching.

```bash
npm run dev
```

Visit `http://localhost:3000` to see:
- Stat cards with trend indicators
- Status badges for all inventory states
- Button variants (primary, secondary, outlined, text, icon, FAB)
- Cards with headers, content, and footers
- Live theme toggle (light/dark/auto)
- Responsive grid layouts
- Typography scale examples
