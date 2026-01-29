'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Truck, Phone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { Store, Driver, UrgencyLevel } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface RequestDrugDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stores: Store[];
  prefilledDIN?: string;
  prefilledName?: string;
  prefilledStoreId?: string;
  prefilledUPC?: string;
}

const URGENCY_OPTIONS: { value: UrgencyLevel; label: string; description: string; color: string }[] = [
  { value: 'low', label: 'Low', description: 'Standard delivery', color: 'bg-green-100 text-green-700' },
  { value: 'medium', label: 'Medium', description: 'Same-day priority', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'High', description: 'Rush delivery', color: 'bg-orange-100 text-orange-700' },
  { value: 'critical', label: 'Critical', description: 'Immediate attention', color: 'bg-red-100 text-red-700' },
];

export function RequestDrugDialog({
  open,
  onOpenChange,
  stores,
  prefilledDIN = '',
  prefilledName = '',
  prefilledStoreId = '',
  prefilledUPC = '',
}: RequestDrugDialogProps) {
  const router = useRouter();
  const { user } = useAppStore();
  const supabase = createClient();

  // Form state
  const [dinNumber, setDinNumber] = useState(prefilledDIN);
  const [upcCode, setUpcCode] = useState(prefilledUPC);
  const [medicationName, setMedicationName] = useState(prefilledName);
  const [quantity, setQuantity] = useState('');
  const [targetStoreId, setTargetStoreId] = useState(prefilledStoreId);
  const [urgency, setUrgency] = useState<UrgencyLevel>('low');
  const [driverId, setDriverId] = useState<string>('none');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Drivers for the user's store
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  // Filter out current user's store from the list
  const otherStores = stores.filter(s => s.id !== user?.store_id);

  // Fetch drivers for the user's store
  useEffect(() => {
    async function fetchDrivers() {
      if (!user?.store_id || !open) return;

      setLoadingDrivers(true);
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .eq('store_id', user.store_id)
          .eq('is_available', true)
          .order('name');

        if (error) throw error;
        setDrivers(data || []);
      } catch (err) {
        console.error('Error fetching drivers:', err);
      } finally {
        setLoadingDrivers(false);
      }
    }

    fetchDrivers();
  }, [user?.store_id, open, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user?.store_id) {
      setError('You must be assigned to a store to request medications');
      return;
    }

    if (!dinNumber.trim()) {
      setError('DIN number is required');
      return;
    }

    if (!medicationName.trim()) {
      setError('Medication name is required');
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (!targetStoreId) {
      setError('Please select a store to request from');
      return;
    }

    setLoading(true);

    try {
      // Create the request with new fields
      const { data: request, error: requestError } = await supabase
        .from('medication_requests')
        .insert({
          from_store_id: user.store_id,
          to_store_id: targetStoreId,
          din_number: dinNumber.trim(),
          upc: upcCode.trim() || null,
          medication_name: medicationName.trim(),
          requested_quantity: parseInt(quantity),
          urgency,
          driver_id: driverId && driverId !== 'none' ? driverId : null,
          message: message.trim() || null,
          requested_by: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Create notification for the receiving store
      const urgencyLabel = URGENCY_OPTIONS.find(u => u.value === urgency)?.label || urgency;
      await supabase.from('notifications').insert({
        store_id: targetStoreId,
        type: 'request_received',
        title: `New ${urgency !== 'low' ? urgencyLabel.toUpperCase() + ' ' : ''}Medication Request`,
        message: `${user.store?.name || 'A store'} has requested ${quantity} units of ${medicationName} (DIN: ${dinNumber})`,
        related_request_id: request.id,
        delivery_method: urgency === 'critical' ? 'both' : 'popup',
      });

      // Reset form
      resetForm();
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      console.error('Error creating request:', err);
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDinNumber('');
    setUpcCode('');
    setMedicationName('');
    setQuantity('');
    setTargetStoreId('');
    setUrgency('low');
    setDriverId('none');
    setMessage('');
    setError('');
  };

  const handleClose = () => {
    setDinNumber(prefilledDIN);
    setUpcCode(prefilledUPC);
    setMedicationName(prefilledName);
    setQuantity('');
    setTargetStoreId(prefilledStoreId);
    setUrgency('low');
    setDriverId('none');
    setMessage('');
    setError('');
    onOpenChange(false);
  };

  const selectedDriver = driverId !== 'none' ? drivers.find(d => d.id === driverId) : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Medication</DialogTitle>
          <DialogDescription>
            Submit a request to another store for medication transfer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* From Store (Read-only) */}
            <div className="space-y-2">
              <Label className="text-gray-500">From Store</Label>
              <div className="rounded-md bg-gray-50 px-3 py-2 text-sm">
                <span className="font-medium">{user?.store?.name}</span>
                <span className="text-gray-500 ml-2">({user?.store?.code})</span>
              </div>
            </div>

            {/* Target Store Selection */}
            <div className="space-y-2">
              <Label htmlFor="targetStore">Request From Store *</Label>
              <Select value={targetStoreId} onValueChange={setTargetStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a store..." />
                </SelectTrigger>
                <SelectContent>
                  {otherStores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name} ({store.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* DIN and UPC in a grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* DIN Number */}
              <div className="space-y-2">
                <Label htmlFor="dinNumber">DIN Number *</Label>
                <Input
                  id="dinNumber"
                  type="text"
                  value={dinNumber}
                  onChange={(e) => setDinNumber(e.target.value)}
                  placeholder="e.g., 02345678"
                  maxLength={8}
                />
              </div>

              {/* UPC Code (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="upcCode">UPC Code</Label>
                <Input
                  id="upcCode"
                  type="text"
                  value={upcCode}
                  onChange={(e) => setUpcCode(e.target.value)}
                  placeholder="Optional"
                  maxLength={14}
                />
              </div>
            </div>

            {/* Medication Name */}
            <div className="space-y-2">
              <Label htmlFor="medicationName">Medication Name *</Label>
              <Input
                id="medicationName"
                type="text"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                placeholder="e.g., Metformin 500mg Tablets"
              />
            </div>

            {/* Quantity and Urgency in a grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Quantity Input */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity Needed *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>

              {/* Urgency Level */}
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level *</Label>
                <Select value={urgency} onValueChange={(v) => setUrgency(v as UrgencyLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <Badge className={cn('text-xs', option.color)}>
                            {option.label}
                          </Badge>
                          <span className="text-xs text-gray-500">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Urgency Warning */}
            {urgency === 'critical' && (
              <div className="flex items-start space-x-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Critical requests will trigger immediate notifications to all receiving store staff.</span>
              </div>
            )}

            {/* Driver Selection */}
            <div className="space-y-2">
              <Label htmlFor="driver">Assign Driver (Optional)</Label>
              <Select value={driverId} onValueChange={setDriverId}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingDrivers ? 'Loading drivers...' : 'Select a driver...'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No driver assigned</SelectItem>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-gray-400" />
                        <span>{driver.name}</span>
                        <span className="text-xs text-gray-500">({driver.phone})</span>
                        <Badge
                          className={cn(
                            'text-xs',
                            driver.shift_status === 'on_duty' ? 'bg-green-100 text-green-700' :
                            driver.shift_status === 'on_delivery' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          )}
                        >
                          {driver.shift_status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {drivers.length === 0 && !loadingDrivers && (
                <p className="text-xs text-gray-500">
                  No drivers available. You can assign a driver later.
                </p>
              )}
            </div>

            {/* Selected Driver Info */}
            {selectedDriver && (
              <div className="flex items-center space-x-2 rounded-lg bg-blue-50 p-3 text-sm">
                <Truck className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800">
                  {selectedDriver.name} will be notified via SMS when the request is accepted.
                </span>
                <a
                  href={`tel:${selectedDriver.phone}`}
                  className="flex items-center space-x-1 text-blue-600 hover:underline ml-auto"
                >
                  <Phone className="h-3 w-3" />
                  <span>{selectedDriver.phone}</span>
                </a>
              </div>
            )}

            {/* Message Input */}
            <div className="space-y-2">
              <Label htmlFor="message">Additional Notes (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add any additional information..."
                rows={3}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
