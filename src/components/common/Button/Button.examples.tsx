/**
 * PharmSync Button Component
 * Usage Examples for Documentation
 */

import React, { useState } from 'react';
import { Button } from './Button';

// Example Icons (using inline SVG for demo)
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

// =========================================
// EXAMPLE 1: Form Actions
// =========================================

export function FormActionsExample() {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    alert('Saved!');
  };

  return (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
      <Button variant="text">
        Cancel
      </Button>
      <Button variant="primary" loading={loading} onClick={handleSave} icon={<SaveIcon />}>
        Save Changes
      </Button>
    </div>
  );
}

// =========================================
// EXAMPLE 2: Inventory Toolbar
// =========================================

export function InventoryToolbarExample() {
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <Button variant="primary" icon={<PlusIcon />}>
        Add Medication
      </Button>
      <Button variant="outlined">
        View Report
      </Button>
      <Button variant="secondary">
        Request Transfer
      </Button>
      <Button variant="error" icon={<TrashIcon />}>
        Delete Selected
      </Button>
    </div>
  );
}

// =========================================
// EXAMPLE 3: Delete Confirmation Dialog
// =========================================

export function DeleteConfirmationExample() {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setDeleting(false);
    alert('Deleted!');
  };

  return (
    <div style={{ padding: '24px', border: '1px solid #e0e0e0', borderRadius: '8px', maxWidth: '400px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
        Confirm Deletion
      </h3>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
        Are you sure you want to delete this medication? This action cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <Button variant="text" disabled={deleting}>
          Cancel
        </Button>
        <Button variant="error" loading={deleting} onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}

// =========================================
// EXAMPLE 4: Card Actions
// =========================================

export function InventoryCardExample() {
  return (
    <div style={{ padding: '24px', border: '1px solid #e0e0e0', borderRadius: '8px', maxWidth: '400px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
          Acetaminophen 500mg
        </h3>
        <p style={{ fontSize: '14px', color: '#666' }}>
          SKU: MED-001234 | Stock: 5 units
        </p>
      </div>

      <div style={{ padding: '12px', backgroundColor: '#FEF3C7', borderRadius: '4px', marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', color: '#92400E', fontWeight: 500 }}>
          ⚠️ Low Stock Alert
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="outlined" size="small" fullWidth>
          View Details
        </Button>
        <Button variant="primary" size="small" icon={<PlusIcon />} fullWidth>
          Reorder
        </Button>
      </div>
    </div>
  );
}

// =========================================
// EXAMPLE 5: Wizard Navigation
// =========================================

export function WizardNavigationExample() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  return (
    <div style={{ padding: '24px', border: '1px solid #e0e0e0', borderRadius: '8px', maxWidth: '500px' }}>
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Step {step} of {totalSteps}
        </p>
        <div style={{ height: '4px', backgroundColor: '#e0e0e0', borderRadius: '2px' }}>
          <div
            style={{
              height: '100%',
              width: `${(step / totalSteps) * 100}%`,
              backgroundColor: '#E12F29',
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      <div style={{ height: '120px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <p style={{ fontSize: '14px', color: '#666' }}>Step {step} Content</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          disabled={step === 1}
          onClick={() => setStep(s => s - 1)}
        >
          Previous
        </Button>
        {step < totalSteps ? (
          <Button
            variant="primary"
            icon={<ArrowRightIcon />}
            iconPosition="right"
            onClick={() => setStep(s => s + 1)}
          >
            Next
          </Button>
        ) : (
          <Button variant="primary" icon={<SaveIcon />}>
            Finish
          </Button>
        )}
      </div>
    </div>
  );
}

// =========================================
// EXAMPLE 6: Icon-Only Actions
// =========================================

export function IconOnlyActionsExample() {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Button variant="primary" icon={<PlusIcon />} ariaLabel="Add item" />
      <Button variant="outlined" icon={<SaveIcon />} ariaLabel="Save" />
      <Button variant="error" icon={<TrashIcon />} ariaLabel="Delete" />
    </div>
  );
}

// =========================================
// EXAMPLE 7: All Variants Showcase
// =========================================

export function AllVariantsExample() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
      <div>
        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Primary (Shoppers Red)</h4>
        <Button variant="primary">Primary Button</Button>
      </div>

      <div>
        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Secondary (Professional Blue)</h4>
        <Button variant="secondary">Secondary Button</Button>
      </div>

      <div>
        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Outlined</h4>
        <Button variant="outlined">Outlined Button</Button>
      </div>

      <div>
        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Text</h4>
        <Button variant="text">Text Button</Button>
      </div>

      <div>
        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Error</h4>
        <Button variant="error">Error Button</Button>
      </div>
    </div>
  );
}

// =========================================
// EXAMPLE 8: Loading States
// =========================================

export function LoadingStatesExample() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Button variant="primary" loading>
        Uploading PDF Report...
      </Button>
      <Button variant="secondary" loading>
        Saving Changes...
      </Button>
      <Button variant="outlined" loading>
        Processing Request...
      </Button>
    </div>
  );
}

// =========================================
// EXAMPLE 9: Size Comparison
// =========================================

export function SizeComparisonExample() {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary" size="small">
        Small (32px)
      </Button>
      <Button variant="primary" size="medium">
        Medium (40px)
      </Button>
      <Button variant="primary" size="large">
        Large (48px)
      </Button>
    </div>
  );
}

// =========================================
// EXAMPLE 10: Full Width Layout
// =========================================

export function FullWidthLayoutExample() {
  return (
    <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Button variant="primary" fullWidth icon={<PlusIcon />}>
        Add New Medication
      </Button>
      <Button variant="outlined" fullWidth>
        View All Reports
      </Button>
      <Button variant="secondary" fullWidth>
        Request Transfer
      </Button>
    </div>
  );
}
