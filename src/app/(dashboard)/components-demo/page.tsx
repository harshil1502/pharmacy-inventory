/**
 * PharmSync Components Demo Page
 * Showcase of the Button component with all variants and states
 */

'use client';

import React from 'react';
import { Button } from '@/components/common/Button';
import {
  FormActionsExample,
  InventoryToolbarExample,
  DeleteConfirmationExample,
  InventoryCardExample,
  WizardNavigationExample,
  IconOnlyActionsExample,
  AllVariantsExample,
  LoadingStatesExample,
  SizeComparisonExample,
  FullWidthLayoutExample
} from '@/components/common/Button/Button.examples';

// Icons
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

export default function ComponentsDemoPage() {
  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <header style={{ marginBottom: '48px' }}>
        <h1 className="typescale-headline-large" style={{ marginBottom: '8px' }}>
          Button Component
        </h1>
        <p className="typescale-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
          Material Design 3 implementation with Shoppers Drug Mart branding
        </p>
      </header>

      {/* Variants */}
      <section style={{ marginBottom: '64px' }}>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '24px' }}>
          Variants
        </h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Button variant="primary">Primary (Shoppers Red)</Button>
          <Button variant="secondary">Secondary (Blue)</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
          <Button variant="error">Error</Button>
        </div>
      </section>

      {/* Sizes */}
      <section style={{ marginBottom: '64px' }}>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '24px' }}>
          Sizes
        </h2>
        <SizeComparisonExample />
      </section>

      {/* With Icons */}
      <section style={{ marginBottom: '64px' }}>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '24px' }}>
          With Icons
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 className="typescale-title-medium" style={{ marginBottom: '12px' }}>
              Icon Left
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button variant="primary" icon={<PlusIcon />}>
                Add Item
              </Button>
              <Button variant="secondary" icon={<SaveIcon />}>
                Save
              </Button>
              <Button variant="outlined" icon={<PlusIcon />}>
                New
              </Button>
              <Button variant="error" icon={<TrashIcon />}>
                Delete
              </Button>
            </div>
          </div>

          <div>
            <h3 className="typescale-title-medium" style={{ marginBottom: '12px' }}>
              Icon Right
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button variant="primary" icon={<ArrowRightIcon />} iconPosition="right">
                Next
              </Button>
              <Button variant="secondary" icon={<ArrowRightIcon />} iconPosition="right">
                Continue
              </Button>
            </div>
          </div>

          <div>
            <h3 className="typescale-title-medium" style={{ marginBottom: '12px' }}>
              Icon Only
            </h3>
            <IconOnlyActionsExample />
          </div>
        </div>
      </section>

      {/* States */}
      <section style={{ marginBottom: '64px' }}>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '24px' }}>
          States
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 className="typescale-title-medium" style={{ marginBottom: '12px' }}>
              Loading
            </h3>
            <LoadingStatesExample />
          </div>

          <div>
            <h3 className="typescale-title-medium" style={{ marginBottom: '12px' }}>
              Disabled
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button variant="primary" disabled>
                Disabled Primary
              </Button>
              <Button variant="secondary" disabled>
                Disabled Secondary
              </Button>
              <Button variant="outlined" disabled>
                Disabled Outlined
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Full Width */}
      <section style={{ marginBottom: '64px' }}>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '24px' }}>
          Full Width
        </h2>
        <FullWidthLayoutExample />
      </section>

      {/* Real-world Examples */}
      <section style={{ marginBottom: '64px' }}>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '32px' }}>
          Real-world Examples
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          <div>
            <h3 className="typescale-title-large" style={{ marginBottom: '16px' }}>
              Form Actions
            </h3>
            <FormActionsExample />
          </div>

          <div>
            <h3 className="typescale-title-large" style={{ marginBottom: '16px' }}>
              Inventory Toolbar
            </h3>
            <InventoryToolbarExample />
          </div>

          <div>
            <h3 className="typescale-title-large" style={{ marginBottom: '16px' }}>
              Delete Confirmation
            </h3>
            <DeleteConfirmationExample />
          </div>

          <div>
            <h3 className="typescale-title-large" style={{ marginBottom: '16px' }}>
              Inventory Card
            </h3>
            <InventoryCardExample />
          </div>

          <div>
            <h3 className="typescale-title-large" style={{ marginBottom: '16px' }}>
              Wizard Navigation
            </h3>
            <WizardNavigationExample />
          </div>
        </div>
      </section>

      {/* Usage Code */}
      <section>
        <h2 className="typescale-headline-medium" style={{ marginBottom: '24px' }}>
          Usage
        </h2>
        <div style={{ backgroundColor: 'var(--md-sys-color-surface-container-low)', padding: '24px', borderRadius: '8px', fontFamily: 'var(--md-sys-typescale-font-family-mono)', fontSize: '14px' }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
{`import { Button } from '@/components/common/Button';

// Basic usage
<Button variant="primary" onClick={handleClick}>
  Save Changes
</Button>

// With icon
<Button variant="primary" icon={<PlusIcon />}>
  Add Item
</Button>

// Loading state
<Button variant="primary" loading>
  Saving...
</Button>

// Icon only
<Button
  variant="primary"
  icon={<TrashIcon />}
  ariaLabel="Delete"
/>`}
          </pre>
        </div>
      </section>
    </div>
  );
}
