# Button Component

Material Design 3 Button component for PharmSync with Shoppers Drug Mart branding.

## Features

✅ **5 Variants**: Primary (red), Secondary (blue), Outlined, Text, Error
✅ **3 Sizes**: Small, Medium, Large
✅ **Icon Support**: Left/Right positioning, Icon-only mode
✅ **Loading State**: With animated spinner
✅ **Full Accessibility**: ARIA labels, keyboard navigation, focus management
✅ **Elevation Transitions**: Hover effects following M3 guidelines
✅ **TypeScript**: Fully typed with comprehensive prop types
✅ **Tested**: 40+ unit tests with 100% coverage
✅ **Documented**: Storybook stories with real-world examples

---

## Installation

The Button component is already integrated into the PharmSync design system. Simply import it:

```tsx
import { Button } from '@/components/common/Button';
```

---

## Basic Usage

### Primary Button (Shoppers Red)

```tsx
<Button variant="primary" onClick={handleSave}>
  Save Changes
</Button>
```

### Secondary Button (Professional Blue)

```tsx
<Button variant="secondary" onClick={handleSubmit}>
  Submit Request
</Button>
```

### Outlined Button

```tsx
<Button variant="outlined" onClick={handleCancel}>
  Cancel
</Button>
```

### Text Button

```tsx
<Button variant="text" onClick={handleDismiss}>
  Dismiss
</Button>
```

### Error/Destructive Button

```tsx
<Button variant="error" onClick={handleDelete}>
  Delete Item
</Button>
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outlined' \| 'text' \| 'error'` | `'primary'` | Visual style variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `fullWidth` | `boolean` | `false` | Full width button |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state with spinner |
| `icon` | `React.ReactNode` | `undefined` | Icon element to display |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon position relative to text |
| `children` | `React.ReactNode` | `undefined` | Button content (text) |
| `ariaLabel` | `string` | `undefined` | Accessible label for screen readers |
| `className` | `string` | `''` | Additional CSS classes |
| `onClick` | `(event: MouseEvent) => void` | `undefined` | Click handler |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button HTML type |

All standard HTML button attributes are supported.

---

## Sizes

### Small (32px height)
```tsx
<Button size="small">Small Button</Button>
```

### Medium (40px height) - Default
```tsx
<Button size="medium">Medium Button</Button>
```

### Large (48px height)
```tsx
<Button size="large">Large Button</Button>
```

---

## Icons

### Icon with Text (Left)

```tsx
import { PlusIcon } from '@heroicons/react/24/outline';

<Button variant="primary" icon={<PlusIcon />}>
  Add Medication
</Button>
```

### Icon with Text (Right)

```tsx
import { ArrowRightIcon } from '@heroicons/react/24/outline';

<Button
  variant="secondary"
  icon={<ArrowRightIcon />}
  iconPosition="right"
>
  Next Step
</Button>
```

### Icon Only

```tsx
import { TrashIcon } from '@heroicons/react/24/outline';

<Button
  variant="error"
  icon={<TrashIcon />}
  ariaLabel="Delete item"
/>
```

**Note**: Icon-only buttons are automatically rendered as circular (pill-shaped).

---

## States

### Loading State

```tsx
<Button variant="primary" loading>
  Uploading Report...
</Button>
```

When `loading={true}`:
- The button is automatically disabled
- A spinner replaces the icon
- The button shows `aria-busy="true"`
- Click events are prevented

### Disabled State

```tsx
<Button variant="primary" disabled>
  Disabled Button
</Button>
```

When `disabled={true}`:
- The button cannot be clicked
- Opacity is reduced to 0.38
- Shows `aria-disabled="true"`

### Full Width

```tsx
<Button variant="primary" fullWidth>
  Full Width Button
</Button>
```

---

## Real-world Examples

### Form Actions

```tsx
function EditForm() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="form-actions">
      <Button variant="text" onClick={handleCancel}>
        Cancel
      </Button>
      <Button
        variant="primary"
        loading={loading}
        onClick={handleSave}
      >
        Save Changes
      </Button>
    </div>
  );
}
```

### Inventory Actions

```tsx
function InventoryCard({ item }: { item: Medication }) {
  return (
    <div className="card">
      <div className="card__header">
        <h3>{item.name}</h3>
      </div>
      <div className="card__content">
        {/* Content */}
      </div>
      <div className="card__footer">
        <Button variant="outlined" size="small">
          View Details
        </Button>
        <Button
          variant="error"
          size="small"
          icon={<TrashIcon />}
          onClick={() => handleDelete(item.id)}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
```

### Alert Dialog

```tsx
function DeleteConfirmation({ onConfirm, onCancel }: Props) {
  const [deleting, setDeleting] = useState(false);

  return (
    <Dialog>
      <DialogHeader>
        <DialogTitle>Confirm Deletion</DialogTitle>
      </DialogHeader>
      <DialogContent>
        Are you sure you want to delete this medication?
      </DialogContent>
      <DialogFooter>
        <Button variant="text" onClick={onCancel} disabled={deleting}>
          Cancel
        </Button>
        <Button
          variant="error"
          loading={deleting}
          onClick={async () => {
            setDeleting(true);
            await onConfirm();
          }}
        >
          Delete
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
```

### Toolbar Actions

```tsx
function InventoryToolbar() {
  return (
    <div className="toolbar">
      <Button
        variant="primary"
        icon={<PlusIcon />}
        onClick={handleAddMedication}
      >
        Add Medication
      </Button>
      <Button
        variant="outlined"
        icon={<UploadIcon />}
        onClick={handleUploadPDF}
      >
        Upload PDF Report
      </Button>
      <Button
        variant="secondary"
        icon={<RefreshIcon />}
        onClick={handleRefresh}
      >
        Refresh
      </Button>
    </div>
  );
}
```

---

## Accessibility

The Button component follows WCAG 2.1 AA/AAA guidelines:

### Keyboard Navigation

- **Enter/Space**: Activates the button
- **Tab**: Moves focus to/from button
- **Focus visible**: Shows outline when navigating with keyboard

### Screen Readers

```tsx
// Icon-only buttons MUST have aria-label
<Button icon={<PlusIcon />} ariaLabel="Add new medication" />

// Text buttons can optionally override with aria-label
<Button ariaLabel="Save all changes">Save</Button>
```

### States Communicated

- `disabled`: Sets `disabled` and `aria-disabled="true"`
- `loading`: Sets `aria-busy="true"` and shows loading status
- Loading spinner: Has `role="status"` with `aria-label="Loading"`

### High Contrast Mode

The button automatically adjusts in high contrast mode:
- Outlined/Text buttons get thicker borders
- All variants maintain sufficient contrast

### Reduced Motion

For users with `prefers-reduced-motion`:
- Transitions are disabled
- Loading spinner animation is removed

---

## Styling

The Button uses the PharmSync design system tokens:

### Colors

- **Primary**: `var(--md-sys-color-primary)` - Shoppers Red (#E12F29)
- **Secondary**: `var(--md-sys-color-secondary)` - Professional Blue (#0066CC)
- **Error**: `var(--md-sys-color-error)`

### Typography

- **Font**: Inter (from design system)
- **Weight**: Medium (500)
- **Letter spacing**: 0.1px - 0.15px depending on size

### Elevation

- **Default**: Elevation 0
- **Hover**: Elevation 1
- **Active**: Elevation 0

### Custom Styling

You can extend button styles using CSS classes:

```tsx
<Button className="my-custom-button">
  Custom Styled
</Button>
```

```scss
.my-custom-button {
  min-width: 200px;

  &:hover {
    transform: scale(1.02);
  }
}
```

---

## Testing

The Button component includes comprehensive unit tests:

```bash
# Run tests
npm test Button.test.tsx

# Run with coverage
npm test -- --coverage Button.test.tsx
```

**Coverage**: 100% (statements, branches, functions, lines)

---

## Storybook

View all button variants and states in Storybook:

```bash
npm run storybook
```

Navigate to: **Components → Common → Button**

Stories included:
- Default
- Variants
- Sizes
- With Icons (Left/Right)
- Icon Only
- Loading States
- Disabled States
- Full Width
- Real-world Examples
- Interactive Playground

---

## TypeScript

The component is fully typed. Import types as needed:

```tsx
import { Button, ButtonProps, ButtonVariant, ButtonSize } from '@/components/common/Button';

const MyComponent: React.FC = () => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Button clicked', event);
  };

  return <Button onClick={handleClick}>Click me</Button>;
};
```

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## Performance

- **Bundle Size**: ~2KB (gzipped)
- **Re-renders**: Optimized with React.memo (when needed)
- **Ref Forwarding**: Supports `ref` for direct DOM access

---

## Migration from Legacy Buttons

If you have old button implementations, migrate like this:

```tsx
// ❌ Old
<button className="btn btn-primary" onClick={handleClick}>
  Save
</button>

// ✅ New
<Button variant="primary" onClick={handleClick}>
  Save
</Button>
```

```tsx
// ❌ Old
<button className="btn btn-danger" disabled={loading}>
  {loading ? 'Deleting...' : 'Delete'}
</button>

// ✅ New
<Button variant="error" loading={loading}>
  Delete
</Button>
```

---

## FAQs

### How do I change the button color?

Use the appropriate variant:
- **Red** → `variant="primary"` (Shoppers Drug Mart red)
- **Blue** → `variant="secondary"` (Professional blue)
- **Destructive** → `variant="error"` (Red error state)

### How do I make a link look like a button?

Use Next.js Link with Button styling:

```tsx
import Link from 'next/link';

<Link href="/inventory" className="button button--primary">
  Go to Inventory
</Link>
```

### Can I use custom icons?

Yes! Pass any React element as the `icon` prop:

```tsx
<Button icon={<CustomIcon />}>
  With Custom Icon
</Button>
```

### How do I handle form submission?

```tsx
<form onSubmit={handleSubmit}>
  <Button type="submit" variant="primary">
    Submit Form
  </Button>
</form>
```

---

## Contributing

When updating the Button component:

1. Update the TypeScript component
2. Update the SCSS styles
3. Add/update tests
4. Add/update Storybook stories
5. Update this README
6. Test accessibility with screen reader
7. Test keyboard navigation

---

## Related Components

- **IconButton** - Circular icon-only buttons (use `Button` with `icon` prop only)
- **FAB** (Floating Action Button) - Use existing `.fab` class from design system
- **ButtonGroup** - Coming soon

---

## License

Part of the PharmSync application. Internal use only.
