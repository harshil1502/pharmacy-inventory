'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Trash2,
  Edit,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { ShiftSchedule, UserProfile, canCreateSchedules } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateShiftDialog } from '@/components/schedules/create-shift-dialog';
import { cn } from '@/lib/utils';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isToday,
  isSameDay,
  parseISO,
} from 'date-fns';

type ShiftWithUser = ShiftSchedule & {
  user?: UserProfile;
};

const SHIFT_TYPE_COLORS: Record<string, string> = {
  regular: 'bg-green-100 border-green-300 text-green-800',
  on_call: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  driver: 'bg-blue-100 border-blue-300 text-blue-800',
};

export default function SchedulesPage() {
  const { user, stores } = useAppStore();
  const supabase = createClient();

  const [shifts, setShifts] = useState<ShiftWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [filterStore, setFilterStore] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftSchedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  const canCreate = user?.role ? canCreateSchedules(user.role) : false;
  const isAssociate = user?.role === 'associate';

  // Get week days
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const fetchShifts = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      let query = supabase
        .from('shift_schedules')
        .select(`
          *,
          user:profiles!shift_schedules_user_id_fkey(id, email, full_name, role)
        `)
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'))
        .order('start_time');

      // Filter by store
      if (filterStore !== 'all') {
        query = query.eq('store_id', filterStore);
      } else if (!isAssociate && user.store_id) {
        // Non-associates only see their store
        query = query.eq('store_id', user.store_id);
      }

      // Regular users only see their own schedule
      if (user.role === 'regular' || user.role === 'driver') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setShifts(data || []);
    } catch (err) {
      console.error('Error fetching shifts:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role, user?.store_id, isAssociate, filterStore, weekStart, weekEnd, supabase]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const handleDeleteShift = async (shiftId: string) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;

    try {
      const { error } = await supabase
        .from('shift_schedules')
        .delete()
        .eq('id', shiftId);

      if (error) throw error;
      setShifts(prev => prev.filter(s => s.id !== shiftId));
    } catch (err) {
      console.error('Error deleting shift:', err);
    }
  };

  const handleEditShift = (shift: ShiftSchedule) => {
    setEditingShift(shift);
    setShowCreateDialog(true);
  };

  const handleAddShift = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    setEditingShift(null);
    setShowCreateDialog(true);
  };

  const handleDialogClose = (open: boolean) => {
    setShowCreateDialog(open);
    if (!open) {
      setEditingShift(null);
      setSelectedDate(undefined);
    }
  };

  const getShiftsForDay = (day: Date) => {
    return shifts.filter(shift => isSameDay(parseISO(shift.date), day));
  };

  if (!user) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Please log in to view schedules</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shift Schedule</h1>
          <p className="text-gray-600 mt-1">
            {user.role === 'regular' || user.role === 'driver'
              ? 'View your scheduled shifts'
              : 'Manage team shift schedules'}
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => {
            setEditingShift(null);
            setSelectedDate(undefined);
            setShowCreateDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Shift
          </Button>
        )}
      </div>

      {/* Week Navigation and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(prev => subWeeks(prev, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <p className="font-medium text-gray-900">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </p>
            <button
              onClick={() => setCurrentWeek(new Date())}
              className="text-xs text-blue-600 hover:underline"
            >
              Go to Today
            </button>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(prev => addWeeks(prev, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {isAssociate && stores.length > 1 && (
          <Select value={filterStore} onValueChange={setFilterStore}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Week Grid */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-500">Loading schedule...</p>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayShifts = getShiftsForDay(day);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'min-h-[200px] rounded-lg border bg-white p-2',
                  isCurrentDay && 'border-blue-300 bg-blue-50/50'
                )}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      {format(day, 'EEE')}
                    </p>
                    <p className={cn(
                      'text-lg font-semibold',
                      isCurrentDay ? 'text-blue-600' : 'text-gray-900'
                    )}>
                      {format(day, 'd')}
                    </p>
                  </div>
                  {canCreate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleAddShift(day)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Shifts */}
                <div className="space-y-1">
                  {dayShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className={cn(
                        'rounded border p-1.5 text-xs cursor-pointer hover:shadow-sm transition-shadow',
                        SHIFT_TYPE_COLORS[shift.shift_type]
                      )}
                      onClick={() => canCreate && handleEditShift(shift)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">
                          {shift.user?.full_name || shift.user?.email || 'Unknown'}
                        </span>
                        {canCreate && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteShift(shift.id);
                            }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 mt-0.5 text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>
                          {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {dayShifts.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">
                      No shifts
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center space-x-4 text-xs text-gray-500">
        <span className="font-medium">Shift Types:</span>
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 rounded bg-green-200 border border-green-300"></span>
          <span>Regular</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 rounded bg-yellow-200 border border-yellow-300"></span>
          <span>On Call</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 rounded bg-blue-200 border border-blue-300"></span>
          <span>Driver</span>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <CreateShiftDialog
        open={showCreateDialog}
        onOpenChange={handleDialogClose}
        editingShift={editingShift}
        selectedDate={selectedDate}
        onSuccess={fetchShifts}
      />
    </div>
  );
}
