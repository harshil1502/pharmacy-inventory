'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { ShiftSchedule, ShiftType, UserProfile, canCreateSchedules } from '@/types';
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
import { format } from 'date-fns';

interface CreateShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingShift?: ShiftSchedule | null;
  selectedDate?: string;
  onSuccess: () => void;
}

const SHIFT_TYPE_OPTIONS: { value: ShiftType; label: string; color: string }[] = [
  { value: 'regular', label: 'Regular', color: 'bg-green-100 text-green-700' },
  { value: 'on_call', label: 'On Call', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'driver', label: 'Driver', color: 'bg-blue-100 text-blue-700' },
];

export function CreateShiftDialog({
  open,
  onOpenChange,
  editingShift,
  selectedDate,
  onSuccess,
}: CreateShiftDialogProps) {
  const { user, stores } = useAppStore();
  const supabase = createClient();

  // Form state
  const [userId, setUserId] = useState('');
  const [storeId, setStoreId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [shiftType, setShiftType] = useState<ShiftType>('regular');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Users for assignment
  const [storeUsers, setStoreUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const canCreate = user?.role ? canCreateSchedules(user.role) : false;
  const isEditing = !!editingShift;
  const isAssociate = user?.role === 'associate';

  // Get manageable stores
  const managedStores = isAssociate
    ? stores
    : stores.filter(s => s.id === user?.store_id);

  // Initialize form
  useEffect(() => {
    if (editingShift) {
      setUserId(editingShift.user_id);
      setStoreId(editingShift.store_id);
      setDate(editingShift.date);
      setStartTime(editingShift.start_time);
      setEndTime(editingShift.end_time);
      setShiftType(editingShift.shift_type);
      setNotes(editingShift.notes || '');
    } else {
      resetForm();
      if (selectedDate) {
        setDate(selectedDate);
      }
      if (!isAssociate && user?.store_id) {
        setStoreId(user.store_id);
      }
    }
  }, [editingShift, selectedDate, open, isAssociate, user?.store_id]);

  // Fetch users when store changes
  useEffect(() => {
    async function fetchUsers() {
      if (!storeId || !open) return;

      setLoadingUsers(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('store_id', storeId)
          .order('full_name');

        if (error) throw error;
        setStoreUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoadingUsers(false);
      }
    }

    fetchUsers();
  }, [storeId, open, supabase]);

  const resetForm = () => {
    setUserId('');
    setStoreId(isAssociate ? '' : user?.store_id || '');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setStartTime('09:00');
    setEndTime('17:00');
    setShiftType('regular');
    setNotes('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!canCreate) {
      setError('You do not have permission to create schedules');
      return;
    }

    if (!userId) {
      setError('Please select a user');
      return;
    }

    if (!storeId) {
      setError('Please select a store');
      return;
    }

    if (!date) {
      setError('Please select a date');
      return;
    }

    if (!startTime || !endTime) {
      setError('Please enter start and end times');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);

    try {
      const shiftData = {
        user_id: userId,
        store_id: storeId,
        date,
        start_time: startTime,
        end_time: endTime,
        shift_type: shiftType,
        notes: notes.trim() || null,
        created_by: user?.id,
      };

      if (isEditing && editingShift) {
        const { error: updateError } = await supabase
          .from('shift_schedules')
          .update(shiftData)
          .eq('id', editingShift.id);

        if (updateError) throw updateError;
      } else {
        const { data: newShift, error: createError } = await supabase
          .from('shift_schedules')
          .insert(shiftData)
          .select()
          .single();

        if (createError) throw createError;

        // Notify the user about their new shift
        if (userId !== user?.id) {
          await supabase.from('notifications').insert({
            user_id: userId,
            store_id: storeId,
            type: 'schedule_changed',
            title: 'New Shift Scheduled',
            message: `You have been scheduled for a shift on ${format(new Date(date), 'MMMM d, yyyy')} from ${startTime} to ${endTime}`,
            delivery_method: 'popup',
          });
        }
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (err) {
      console.error('Error saving shift:', err);
      setError('Failed to save shift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  if (!canCreate) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Shift' : 'Create Shift'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update shift details' : 'Schedule a new shift for a team member'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Store Selection (for associates) */}
            {isAssociate && (
              <div className="space-y-2">
                <Label htmlFor="store">Store *</Label>
                <Select value={storeId} onValueChange={(v) => {
                  setStoreId(v);
                  setUserId(''); // Reset user when store changes
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a store..." />
                  </SelectTrigger>
                  <SelectContent>
                    {managedStores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name} ({store.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* User Selection */}
            <div className="space-y-2">
              <Label htmlFor="user">Assign To *</Label>
              <Select value={userId} onValueChange={setUserId} disabled={!storeId}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingUsers ? 'Loading...' : 'Select a user...'} />
                </SelectTrigger>
                <SelectContent>
                  {storeUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      <div className="flex items-center space-x-2">
                        <span>{u.full_name || u.email}</span>
                        <Badge className="text-xs bg-gray-100 text-gray-600">
                          {u.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Start and End Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Shift Type */}
            <div className="space-y-2">
              <Label htmlFor="shiftType">Shift Type</Label>
              <Select value={shiftType} onValueChange={(v) => setShiftType(v as ShiftType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHIFT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <Badge className={cn('text-xs', option.color)}>
                        {option.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this shift..."
                rows={2}
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
              {loading ? 'Saving...' : isEditing ? 'Update Shift' : 'Create Shift'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
