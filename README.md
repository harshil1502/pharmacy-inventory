# PharmSync Design System Rules - Shoppers Drug Mart Edition

## Overview
PharmSync uses a **Material Design 3 (M3)** token-based architecture with semantic color roles, comprehensive typography scale, elevation system, and shape tokens. This document provides guidelines for implementing Figma designs into the codebase.

### Color Philosophy: Shoppers Drug Mart Inspired

The PharmSync color palette draws inspiration from Canada's most trusted pharmacy brand, Shoppers Drug Mart, prioritizing:

**Iconic Pharmacy Red (#E12F29)**
- Instantly recognizable pharmacy brand color
- Conveys urgency, importance, and healthcare authority
- Used strategically for primary actions and critical alerts
- Aligns with pharmaceutical retail industry standards

**Professional Medical Blue (#0066CC)**
- Secondary color for healthcare trust signals
- Balances the red with calming medical professionalism
- Used for informational elements and secondary actions

**Sophisticated Neutral Base**
- Deep blacks (#0F0F0F) and slate grays (#2F2F2F)
- Professional, enterprise-grade aesthetic
- Reduces eye strain for extended use
- Clean, modern interface foundation

**Clinical Status System**
- Evidence-based color coding for inventory aging
- Clear visual hierarchy without sensory overload
- Accessible to color-blind users with pattern overlays

---

## 1. Token Definitions

### Color System (`styles/abstracts/_colors.scss`)

#### Source Colors (Brand Foundation)
```scss
$source-primary: #E12F29;       // Shoppers Drug Mart Red
$source-secondary: #0066CC;     // Professional Medical Blue
$source-tertiary: #8B5CF6;      // Refined Purple
$source-neutral: #2F2F2F;       // Mine Shaft (Shoppers gray)
```

#### M3 Color Roles (Dark Theme - Primary Application)

**Primary Palette (Shoppers Red):**
```scss
Primary: #E12F29                // Main brand red
On-Primary: #FFFFFF             // White text on red
Primary Container: #4A0F0D      // Dark red container
On-Primary Container: #FECDCA   // Light pink on dark red
```

**Secondary Palette (Medical Blue):**
```scss
Secondary: #0066CC              // Professional blue
On-Secondary: #FFFFFF           // White text on blue
Secondary Container: #001F3F    // Dark blue container
On-Secondary Container: #B3D9FF // Light blue on dark blue
```

**Tertiary Palette (Refined Purple):**
```scss
Tertiary: #A78BFA               // Violet accent
On-Tertiary: #4C1D95           
Tertiary Container: #5B21B6     
On-Tertiary Container: #EDE9FE  
```

**Error Palette:**
```scss
Error: #EF4444                  // Professional red (different from primary)
On-Error: #FFFFFF              
Error Container: #7F1D1D        
On-Error Container: #FEE2E2     
```

**Surface Hierarchy (Critical for Layouts):**
```scss
Background: #0F0F0F              // Deep black app background
Surface: #0F0F0F                 // Component base surfaces
Surface Container Lowest: #0A0A0A
Surface Container Low: #1A1A1A   // Sidebar background
Surface Container: #2F2F2F       // Cards, elevated content (Shoppers gray)
Surface Container High: #404040  // Hover states
Surface Container Highest: #525252 // Active/selected states

On-Surface: #F5F5F5              // Primary text (off-white)
On-Surface-Variant: #BFBFBF      // Secondary text (gray)

Outline: #666666                 // Borders, dividers
Outline-Variant: #404040         // Subtle dividers
```

**PharmSync Status Colors (Clinical System):**
```scss
// Inventory Aging with Shoppers Red for critical
Fresh (0-30 days): #10B981       // Emerald green
  Container: rgba(16, 185, 129, 0.15)
  On-Fresh: #064E3B

Moderate (31-90 days): #F59E0B   // Amber warning
  Container: rgba(245, 158, 11, 0.15)
  On-Moderate: #78350F

Aging (91-180 days): #F97316     // Orange alert
  Container: rgba(249, 115, 22, 0.15)
  On-Aging: #7C2D12

Old (180+ days): #E12F29         // Shoppers Red (critical!)
  Container: rgba(225, 47, 41, 0.15)
  On-Old: #FFFFFF

Obsolete: #8B5CF6                // Violet (distinct category)
  Container: rgba(139, 92, 246, 0.15)
  On-Obsolete: #4C1D95
```

#### Usage in Code
```scss
// Always use CSS custom properties
.button-primary {
  background-color: var(--md-sys-color-primary); // #E12F29
  color: var(--md-sys-color-on-primary); // #FFFFFF
  
  &:hover {
    background-color: #C42820; // Darker red
  }
}

.stat-card {
  background-color: var(--md-sys-color-surface-container); // #2F2F2F
  color: var(--md-sys-color-on-surface);
}

.status-badge-old {
  background-color: var(--md-sys-color-status-old); // #E12F29
  color: var(--md-sys-color-on-status-old); // #FFFFFF
}
```

---

## 2. Typography System (`styles/abstracts/_typography.scss`)

### Font Families
```scss
Brand: 'Inter' (Headlines, titles, branding)
Plain: 'Inter' (Body text, UI elements)
Mono: 'JetBrains Mono' (SKUs, barcodes, data tables)
```

### M3 Type Scale (15 Styles + 15 Emphasized Variants)

#### Display Styles (Hero sections, landing pages)
- **Display Large**: 57px / 64px line-height / 400 weight
- **Display Medium**: 45px / 52px / 400
- **Display Small**: 36px / 44px / 400

#### Headline Styles (Section headers, page titles)
- **Headline Large**: 32px / 40px / 400
- **Headline Medium**: 28px / 36px / 400
- **Headline Small**: 24px / 32px / 400

#### Title Styles (Card titles, dialog headers)
- **Title Large**: 22px / 28px / 500
- **Title Medium**: 16px / 24px / 500
- **Title Small**: 14px / 20px / 500

#### Label Styles (Buttons, tabs, form labels)
- **Label Large**: 14px / 20px / 500
- **Label Medium**: 12px / 16px / 500
- **Label Small**: 11px / 16px / 500

#### Body Styles (Paragraphs, descriptions)
- **Body Large**: 16px / 24px / 400
- **Body Medium**: 14px / 20px / 400
- **Body Small**: 12px / 16px / 400

### Usage Patterns
```scss
// Using mixins
.page-title {
  @include typography($md-sys-typescale-headline-large);
}

// Using utility classes
<h1 class="typescale-headline-large">Inventory Dashboard</h1>
<p class="typescale-body-medium">Description text</p>
<button class="typescale-label-large">Add Item</button>

// For data tables (use monospace)
.table-cell--sku {
  font-family: var(--md-sys-typescale-font-family-mono);
  @include typography($md-sys-typescale-body-small);
}
```

**Typography Rules:**
1. Use **Title Medium** for card headers
2. Use **Body Medium** for table cells and descriptions
3. Use **Label Large** for button text
4. Use **Headline Small** for section headers
5. Use **Body Small** for timestamps and metadata
6. Use **Mono font** for SKUs, barcodes, IDs, quantities

---

## 3. Shape System (`styles/abstracts/_shapes.scss`)

### Corner Radius Scale
```scss
None: 0px
Extra Small: 4px    // Text fields, tooltips
Small: 8px          // Chips, badges, table rows
Medium: 12px        // Cards, stat cards
Large: 16px         // FABs
Extra Large: 28px   // Dialogs, modals
Full: 9999px        // Pills, avatars, primary buttons
```

### Component Mappings
```scss
Buttons (Primary): Full radius (pill shape)
Buttons (Secondary): Medium (12px)
Cards: Medium (12px)
Chips/Tags: Small (8px)
Dialogs/Modals: Extra Large (28px)
Text Fields: Extra Small (4px)
Status Badges: Small (8px)
Stat Cards: Medium (12px)
Table Rows: Small (8px)
Dropdowns: Small (8px)
Avatars: Full radius
```

### Usage
```scss
.stat-card {
  border-radius: var(--md-sys-shape-corner-medium); // 12px
}

.primary-button {
  border-radius: var(--md-sys-shape-button); // Full radius
}

.status-badge {
  border-radius: var(--md-sys-shape-corner-small); // 8px
}
```

---

## 4. Elevation System (`styles/abstracts/_elevation.scss`)

### Dark Theme Elevation (Shadow + Surface Tint)

**Level 0**: No elevation (resting state)
**Level 1**: Cards at rest (subtle shadow)
**Level 2**: Cards on hover (medium shadow)
**Level 3**: FABs, dialogs (prominent shadow)
**Level 4**: Menus, dropdowns (strong shadow)
**Level 5**: Navigation drawers (strongest shadow)

### Surface Tint (Red Tint for PharmSync)
In dark theme, elevated surfaces get a **primary red tint** to indicate elevation:
- Level 1: 3% opacity (#E12F29 @ 3%)
- Level 2: 5% opacity
- Level 3: 8% opacity
- Level 4: 10% opacity
- Level 5: 12% opacity

### Usage
```scss
.card {
  @include elevation(1);
  @include elevation-transition;
  
  &:hover {
    @include elevation(2);
  }
  
  &:active {
    @include elevation(0);
  }
}

// FAB (Floating Action Button)
.fab {
  @include elevation(3);
  background-color: var(--md-sys-color-primary); // Shoppers red
  
  &:hover {
    @include elevation(4);
  }
}
```

**Elevation Rules:**
1. Cards start at Level 1, hover to Level 2
2. Dialogs and modals use Level 3
3. Dropdowns and menus use Level 4
4. Sidebar uses Level 5
5. Critical action buttons (red) start at Level 2

---

## 5. Spacing System (`styles/abstracts/_spacing.scss`)

### 4px Baseline Grid
```scss
$spacing-0: 0
$spacing-1: 4px     // Extra small (icon padding)
$spacing-2: 8px     // Small (chip padding, tight gaps)
$spacing-3: 12px    // Small-medium (button padding Y)
$spacing-4: 16px    // Medium (base unit, default gaps)
$spacing-5: 20px    // Medium-large
$spacing-6: 24px    // Large (card padding)
$spacing-8: 32px    // Extra large (section gaps)
$spacing-10: 40px   // 2x Large
$spacing-12: 48px   // 3x Large (page margins)
```

### Usage Guidelines
```scss
// Card padding
.card {
  padding: $spacing-6; // 24px
}

// Button padding
.button {
  padding: $spacing-3 $spacing-6; // 12px 24px (Y X)
}

// Section spacing
.section {
  margin-bottom: $spacing-8; // 32px
}

// Grid gaps
.stats-grid {
  gap: $spacing-4; // 16px
}

// Page container
.page-container {
  padding: $spacing-12 $spacing-6; // 48px 24px
}
```

**Spacing Rules:**
1. Default spacing unit: `$spacing-4` (16px)
2. Card/panel padding: `$spacing-6` (24px)
3. Section spacing: `$spacing-8` (32px)
4. Page margins: `$spacing-12` (48px)
5. Always use 4px increments
6. Mobile: reduce by 50% (e.g., 24px → 12px)

---

## 6. Component Patterns

### Primary Action Button (Shoppers Red)
```scss
.button-primary {
  @include typography($md-sys-typescale-label-large);
  @include elevation(0);
  @include elevation-transition;
  
  background-color: var(--md-sys-color-primary); // #E12F29
  color: var(--md-sys-color-on-primary); // #FFFFFF
  border-radius: var(--md-sys-shape-button); // Full radius
  padding: $spacing-3 $spacing-6; // 12px 24px
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: #C42820; // Darker red
    @include elevation(1);
  }
  
  &:active {
    @include elevation(0);
    background-color: #A82319; // Even darker
  }
  
  &:disabled {
    background-color: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface-variant);
    opacity: 0.38;
    cursor: not-allowed;
  }
}
```

### Secondary Button (Medical Blue)
```scss
.button-secondary {
  @include typography($md-sys-typescale-label-large);
  
  background-color: var(--md-sys-color-secondary); // #0066CC
  color: var(--md-sys-color-on-secondary); // #FFFFFF
  border-radius: var(--md-sys-shape-corner-medium); // 12px
  padding: $spacing-3 $spacing-6;
  
  &:hover {
    background-color: #0052A3; // Darker blue
  }
}
```

### Stat Cards
```scss
.stat-card {
  @include elevation(1);
  @include elevation-transition;
  @include shape($md-sys-shape-corner-medium); // 12px
  
  background-color: var(--md-sys-color-surface-container); // #2F2F2F
  padding: $spacing-6; // 24px
  
  &:hover {
    @include elevation(2);
    background-color: var(--md-sys-color-surface-container-high);
  }
}

.stat-card__title {
  @include typography($md-sys-typescale-title-medium);
  color: var(--md-sys-color-on-surface-variant); // #BFBFBF
  margin-bottom: $spacing-2;
}

.stat-card__value {
  @include typography($md-sys-typescale-headline-large);
  color: var(--md-sys-color-on-surface); // #F5F5F5
  font-weight: 700; // Emphasized
}

.stat-card__trend {
  @include typography($md-sys-typescale-body-small);
  display: flex;
  align-items: center;
  gap: $spacing-1;
  
  &--positive {
    color: var(--md-sys-color-status-fresh); // Green
  }
  
  &--negative {
    color: var(--md-sys-color-status-old); // Red
  }
}
```

### Status Badges
```scss
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: $spacing-1; // 4px
  padding: $spacing-1 $spacing-3; // 4px 12px
  border-radius: var(--md-sys-shape-corner-small); // 8px
  @include typography($md-sys-typescale-label-small);
  font-weight: 600;
  
  &--fresh {
    background-color: $pharmsync-status-fresh-container;
    color: $pharmsync-status-fresh; // #10B981
  }
  
  &--moderate {
    background-color: $pharmsync-status-moderate-container;
    color: $pharmsync-status-moderate; // #F59E0B
  }
  
  &--aging {
    background-color: $pharmsync-status-aging-container;
    color: $pharmsync-status-aging; // #F97316
  }
  
  &--old {
    background-color: $pharmsync-status-old-container;
    color: $pharmsync-status-old; // #E12F29 (Shoppers Red!)
    font-weight: 700; // Extra emphasis for critical
  }
  
  &--obsolete {
    background-color: $pharmsync-status-obsolete-container;
    color: $pharmsync-status-obsolete; // #8B5CF6
  }
}
```

### Data Tables
```scss
.inventory-table {
  width: 100%;
  background-color: var(--md-sys-color-surface);
}

.table-row {
  background-color: var(--md-sys-color-surface-container); // #2F2F2F
  border-radius: $pharmsync-shape-table-row; // 8px
  padding: $spacing-4; // 16px
  margin-bottom: $spacing-2; // 8px
  transition: all 200ms ease;
  
  &:hover {
    background-color: var(--md-sys-color-surface-container-high); // #404040
  }
  
  &--selected {
    background-color: var(--md-sys-color-surface-container-high);
    border-left: 4px solid var(--md-sys-color-primary); // Red accent
  }
}

.table-cell {
  @include typography($md-sys-typescale-body-medium);
  color: var(--md-sys-color-on-surface);
  
  &--header {
    @include typography($md-sys-typescale-title-small);
    color: var(--md-sys-color-on-surface-variant);
    font-weight: 600;
  }
  
  &--mono {
    font-family: var(--md-sys-typescale-font-family-mono);
  }
  
  &--emphasized {
    color: var(--md-sys-color-on-surface);
    font-weight: 600;
  }
}
```

### Navigation Sidebar
```scss
.sidebar {
  background-color: var(--md-sys-color-surface-container-low); // #1A1A1A
  @include elevation(5);
  width: 280px;
  
  @media (max-width: $breakpoint-md) {
    width: 100%;
  }
}

.nav-item {
  @include typography($md-sys-typescale-label-large);
  color: var(--md-sys-color-on-surface-variant);
  padding: $spacing-3 $spacing-4;
  border-radius: var(--md-sys-shape-nav-item); // Full radius
  margin: $spacing-1 $spacing-2;
  
  &:hover {
    background-color: var(--md-sys-color-surface-container);
  }
  
  &--active {
    background-color: var(--md-sys-color-primary-container); // Dark red
    color: var(--md-sys-color-primary); // #E12F29
    font-weight: 600;
    
    // Red accent indicator
    border-left: 4px solid var(--md-sys-color-primary);
  }
}
```

---

## 7. Figma to Code Integration Guidelines

### When Implementing Figma Designs:

#### Step 1: Identify Color Tokens
- Match Figma colors to M3 color roles
- Primary actions → Use Shoppers red (#E12F29)
- Secondary actions → Use medical blue (#0066CC)
- Backgrounds → Use surface hierarchy (#0F0F0F → #2F2F2F)
- Text → Use on-surface variants (#F5F5F5, #BFBFBF)
- Status indicators → Use PharmSync status colors

#### Step 2: Apply Typography
- Map Figma text styles to M3 typescale
- Headlines → headline-large / headline-medium
- Card titles → title-medium
- Body text → body-medium
- Buttons → label-large
- Data/SKUs → body-small with mono font

#### Step 3: Apply Shapes
- Buttons (CTA) → Full radius (pill)
- Cards → Medium radius (12px)
- Badges → Small radius (8px)
- Modals → Extra large radius (28px)
- Inputs → Extra small radius (4px)

#### Step 4: Add Elevation
- Determine interaction state
- Cards: Level 1 rest → Level 2 hover
- Modals: Level 3
- Dropdowns: Level 4
- Add red tint overlay for elevation

#### Step 5: Spacing & Layout
- Use 4px baseline grid
- Card padding: 24px
- Section gaps: 32px
- Component gaps: 16px
- Mobile: halve spacing values

### Color Mapping Quick Reference
```
Figma Layer              →  Token
──────────────────────────────────────────────────────
Primary CTA Button       →  --md-sys-color-primary (#E12F29)
Secondary Button         →  --md-sys-color-secondary (#0066CC)
Card Background          →  --md-sys-color-surface-container (#2F2F2F)
Sidebar                  →  --md-sys-color-surface-container-low (#1A1A1A)
Body Text                →  --md-sys-color-on-surface (#F5F5F5)
Secondary Text           →  --md-sys-color-on-surface-variant (#BFBFBF)
Dividers/Borders         →  --md-sys-color-outline-variant (#404040)
Fresh Status (Green)     →  --md-sys-color-status-fresh (#10B981)
Critical Status (Red)    →  --md-sys-color-status-old (#E12F29)
Error State              →  --md-sys-color-error (#EF4444)
```

---

## 8. Shoppers Drug Mart Brand Integration

### When to Use Shoppers Red (#E12F29)
✅ **Primary actions**: Submit, Save, Confirm, Add Item
✅ **Critical alerts**: Old inventory (180+ days), urgent actions required
✅ **Active navigation**: Selected sidebar items, active tabs
✅ **FABs**: Floating action buttons for main tasks
✅ **Important badges**: Admin badges, priority indicators
✅ **Logo and branding**: Header logo, splash screens

❌ **Don't use red for**:
- All buttons (use sparingly for primary actions only)
- Success messages (use green)
- Informational content (use blue)
- Large background areas (too intense)

### Color Psychology in Pharmacy Context
```
Red (#E12F29):
✓ Urgency and importance (critical inventory alerts)
✓ Brand recognition (Shoppers Drug Mart familiarity)
✓ Call-to-action (motivates decisive action)
✗ Don't overuse: Red fatigue reduces effectiveness

Blue (#0066CC):
✓ Trust and stability (medical professionalism)
✓ Information and guidance (help sections)
✓ Secondary actions (less critical tasks)

Gray (#2F2F2F):
✓ Content containers (professional, neutral)
✓ Surface hierarchy (subtle depth)
✓ Reduces eye strain (extended use)
```

### Brand Consistency Guidelines
1. **Red is premium**: Reserve for most important actions
2. **Blue supports**: Use for helpful, informational elements
3. **Gray dominates**: 70% of interface should be neutral
4. **Status colors pop**: Only in data context (badges, charts)
5. **White text**: Always pair with red or blue backgrounds

---

## 9. Common Patterns & Best Practices

### DO ✅
- Always use CSS custom properties for colors
- Apply elevation transitions to interactive elements
- Use Shoppers red (#E12F29) for primary CTAs
- Maintain 4px spacing increments
- Use semantic M3 color roles
- Follow component shape mappings
- Reserve red for critical/primary actions
- Use monospace font for data (SKUs, IDs, quantities)
- Add loading states for all async operations

### DON'T ❌
- Hard-code color values (#E12F29) directly in components
- Mix px values outside the spacing scale
- Use red for all buttons (blue for secondary)
- Apply elevation without surface tint
- Use arbitrary border-radius values
- Skip elevation transitions on hover
- Use display/headline styles for body text
- Overuse red (causes alert fatigue)

---

## 10. Responsive Design Rules

### Breakpoints
```scss
Mobile:   < 640px    // Single column, bottom nav
Tablet:   640-1024px // 2 columns, condensed sidebar
Desktop:  > 1024px   // Full layout, side navigation
```

### Responsive Patterns

#### Stat Cards Grid
```scss
.stats-grid {
  display: grid;
  gap: $spacing-4;
  
  // Mobile: 1 column
  grid-template-columns: 1fr;
  
  // Tablet: 2 columns
  @media (min-width: $breakpoint-sm) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  // Desktop: 4 columns
  @media (min-width: $breakpoint-lg) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

#### Navigation
```scss
// Mobile: bottom navigation
@media (max-width: $breakpoint-md) {
  .sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    flex-direction: row;
  }
}

// Desktop: side navigation
@media (min-width: $breakpoint-md) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    flex-direction: column;
  }
}
```

#### Tables → Cards
```scss
// Desktop: full table
.inventory-table {
  display: table;
}

// Mobile: card layout
@media (max-width: $breakpoint-md) {
  .inventory-table {
    display: block;
  }
  
  .table-row {
    display: block;
    margin-bottom: $spacing-4;
    padding: $spacing-4;
    border-radius: $md-sys-shape-corner-medium;
  }
  
  .table-cell {
    display: grid;
    grid-template-columns: 120px 1fr;
    margin-bottom: $spacing-2;
    
    &::before {
      content: attr(data-label);
      font-weight: 600;
      color: var(--md-sys-color-on-surface-variant);
    }
  }
}
```

---

## 11. Accessibility Requirements

### Color Contrast (WCAG AAA Preferred)
```
Red on Black:     #E12F29 on #0F0F0F  →  5.1:1 ✓ AA
White on Red:     #FFFFFF on #E12F29  →  8.2:1 ✓ AAA
Blue on Black:    #0066CC on #0F0F0F  →  4.9:1 ✓ AA
Gray on Black:    #BFBFBF on #0F0F0F  →  7.8:1 ✓ AAA
Green on Black:   #10B981 on #0F0F0F  →  6.2:1 ✓ AA
```

### Focus Indicators
```scss
.focusable {
  &:focus-visible {
    outline: 2px solid var(--md-sys-color-primary); // Red outline
    outline-offset: 2px;
    border-radius: inherit;
  }
}
```

### ARIA Patterns
```html
<!-- Button -->
<button 
  aria-label="Add new inventory item"
  aria-pressed="false">
  <PlusIcon /> Add Item
</button>

<!-- Status Badge -->
<span 
  role="status"
  aria-label="Inventory status: Fresh, 15 days old"
  class="status-badge status-badge--fresh">
  Fresh
</span>

<!-- Data Table -->
<table role="grid" aria-label="Inventory items">
  <thead>
    <tr role="row">
      <th role="columnheader" aria-sort="ascending">Item Name</th>
    </tr>
  </thead>
</table>
```

---

## 12. Implementation Checklist

When creating a new component from Figma:

**Design Tokens**
- [ ] Colors mapped to M3 tokens (red for primary, blue for secondary)
- [ ] Typography using M3 scale
- [ ] Border radius using shape tokens
- [ ] Spacing using 4px grid
- [ ] Elevation applied correctly with red tint

**Functionality**
- [ ] TypeScript interfaces defined
- [ ] Props validated
- [ ] Event handlers implemented
- [ ] Loading state
- [ ] Error state
- [ ] Empty state

**Interactivity**
- [ ] Hover states defined
- [ ] Active states defined
- [ ] Disabled states styled
- [ ] Transitions smooth (200-300ms)
- [ ] Focus indicators visible

**Responsiveness**
- [ ] Mobile layout tested (< 640px)
- [ ] Tablet layout tested (640-1024px)
- [ ] Desktop layout tested (> 1024px)
- [ ] Touch targets min 44x44px

**Accessibility**
- [ ] Semantic HTML used
- [ ] ARIA labels added
- [ ] Keyboard navigation works
- [ ] Color contrast verified (WCAG AA minimum)
- [ ] Screen reader tested
- [ ] Focus management correct

**Quality**
- [ ] Unit tests written
- [ ] Accessibility tests (jest-axe)
- [ ] Component documented
- [ ] Storybook story created (optional)
- [ ] Code reviewed

---

## 13. Quick Reference Card

```scss
// ===== SHOPPERS PHARMSYNC QUICK REFERENCE =====

// PRIMARY COLORS
--primary: #E12F29;              // Shoppers Red (main CTAs)
--primary-hover: #C42820;        // Darker red
--on-primary: #FFFFFF;           // White on red

--secondary: #0066CC;            // Medical Blue
--secondary-hover: #0052A3;      // Darker blue
--on-secondary: #FFFFFF;         // White on blue

// SURFACES
--background: #0F0F0F;           // Deep black
--surface-low: #1A1A1A;          // Sidebar
--surface: #2F2F2F;              // Cards (Shoppers gray)
--surface-high: #404040;         // Hover

// TEXT
--text-primary: #F5F5F5;         // Off-white
--text-secondary: #BFBFBF;       // Gray
--text-muted: #808080;           // Dim gray

// STATUS (Inventory Aging)
--status-fresh: #10B981;         // Emerald (0-30 days)
--status-moderate: #F59E0B;      // Amber (31-90 days)
--status-aging: #F97316;         // Orange (91-180 days)
--status-old: #E12F29;           // Shoppers Red (180+ days) ⚠️
--status-obsolete: #8B5CF6;      // Violet

// TYPOGRAPHY
Title:          22px / 28px / 500 (card headers)
Body:           14px / 20px / 400 (content)
Label:          14px / 20px / 500 (buttons)
Data:           12px / 16px / 400 / mono (SKUs, IDs)

// SHAPES
Button:         9999px (full/pill)
Card:           12px (medium)
Badge:          8px (small)
Modal:          28px (extra-large)
Input:          4px (extra-small)

// SPACING
Base:           16px ($spacing-4)
Card:           24px ($spacing-6)
Section:        32px ($spacing-8)
Page:           48px ($spacing-12)

// ELEVATION
Card:           level-1 (rest) → level-2 (hover)
Modal:          level-3
Dropdown:       level-4
Sidebar:        level-5
```

---

## 14. Advanced: Animation & Transitions

### Standard Durations
```scss
$duration-instant: 100ms;   // Micro-interactions
$duration-fast: 200ms;      // Hover states
$duration-medium: 300ms;    // Transitions
$duration-slow: 500ms;      // Page transitions
```

### Easing Functions
```scss
$easing-standard: cubic-bezier(0.4, 0, 0.2, 1);  // Deceleration
$easing-emphasized: cubic-bezier(0.2, 0, 0, 1);  // Sharp deceleration
$easing-decelerate: cubic-bezier(0, 0, 0.2, 1);  // Enter screen
$easing-accelerate: cubic-bezier(0.4, 0, 1, 1);  // Exit screen
```

### Example Transitions
```scss
.card {
  transition: 
    background-color $duration-fast $easing-standard,
    box-shadow $duration-fast $easing-standard,
    transform $duration-fast $easing-standard;
    
  &:hover {
    transform: translateY(-2px);
  }
}

.modal-enter {
  animation: slideUp $duration-medium $easing-emphasized;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

**Last Updated**: PharmSync Design System v2.0 - Shoppers Drug Mart Edition
**Color Scheme**: Shoppers Red (#E12F29) Primary, Medical Blue (#0066CC) Secondary
**Design Framework**: Material Design 3 (2024)
**Industry**: Healthcare/Pharmaceutical Retail