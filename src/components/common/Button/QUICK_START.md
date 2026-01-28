# Button Component - Quick Start Guide

Get started with the PharmSync Button component in 60 seconds.

## Step 1: Import

```tsx
import { Button } from '@/components/common/Button';
```

## Step 2: Use It

```tsx
<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>
```

That's it! 🎉

---

## Common Patterns

### Save/Cancel Form Actions

```tsx
function MyForm() {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Button variant="text" onClick={handleCancel}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSave}>
        Save
      </Button>
    </div>
  );
}
```

### Add Item Button

```tsx
import { PlusIcon } from '@heroicons/react/24/outline';

<Button variant="primary" icon={<PlusIcon />} onClick={handleAdd}>
  Add Medication
</Button>
```

### Delete with Confirmation

```tsx
function DeleteButton({ onDelete }) {
  const [deleting, setDeleting] = useState(false);

  return (
    <Button
      variant="error"
      loading={deleting}
      onClick={async () => {
        setDeleting(true);
        await onDelete();
        setDeleting(false);
      }}
    >
      Delete
    </Button>
  );
}
```

### Icon-Only Action

```tsx
import { TrashIcon } from '@heroicons/react/24/outline';

<Button
  variant="error"
  icon={<TrashIcon />}
  ariaLabel="Delete item"
/>
```

---

## All Variants

```tsx
<Button variant="primary">Primary (Red)</Button>
<Button variant="secondary">Secondary (Blue)</Button>
<Button variant="outlined">Outlined</Button>
<Button variant="text">Text</Button>
<Button variant="error">Delete</Button>
```

---

## All Sizes

```tsx
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>  // Default
<Button size="large">Large</Button>
```

---

## Need More Help?

📖 **Full Documentation**: `README.md` in this directory
🎨 **Live Demo**: Visit `/components-demo` in your browser
💡 **Examples**: Check `Button.examples.tsx` for copy-paste code

---

## Props Cheatsheet

| Prop | Values | Example |
|------|--------|---------|
| `variant` | `primary`, `secondary`, `outlined`, `text`, `error` | `variant="primary"` |
| `size` | `small`, `medium`, `large` | `size="large"` |
| `icon` | Any React element | `icon={<Icon />}` |
| `iconPosition` | `left`, `right` | `iconPosition="right"` |
| `loading` | `true`, `false` | `loading={true}` |
| `disabled` | `true`, `false` | `disabled={true}` |
| `fullWidth` | `true`, `false` | `fullWidth` |
| `onClick` | Function | `onClick={() => {}}` |

---

**Happy coding!** 🚀
