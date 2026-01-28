'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { Task, TaskPriority, UserProfile, canAssignTasks } from '@/types';
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

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask?: Task | null;
  onSuccess: () => void;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' },
];

const REMINDER_OPTIONS = [
  { value: '', label: 'No reminder' },
  { value: '15', label: '15 minutes before' },
  { value: '30', label: '30 minutes before' },
  { value: '60', label: '1 hour before' },
  { value: '1440', label: '1 day before' },
];

export function CreateTaskDialog({
  open,
  onOpenChange,
  editingTask,
  onSuccess,
}: CreateTaskDialogProps) {
  const { user } = useAppStore();
  const supabase = createClient();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [reminderMinutes, setReminderMinutes] = useState('');
  const [reminderType, setReminderType] = useState<'email' | 'popup' | 'both'>('popup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Store users for assignment
  const [storeUsers, setStoreUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const canAssign = user?.role ? canAssignTasks(user.role) : false;
  const isEditing = !!editingTask;

  // Initialize form when editing
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setAssignedTo(editingTask.assigned_to);
      setDueDate(editingTask.due_date);
      setDueTime(editingTask.due_time || '');
      setPriority(editingTask.priority);
      setReminderType(editingTask.reminder_type || 'popup');
    } else {
      resetForm();
    }
  }, [editingTask, open]);

  // Fetch store users for assignment
  useEffect(() => {
    async function fetchUsers() {
      if (!user?.store_id || !open || !canAssign) return;

      setLoadingUsers(true);
      try {
        let query = supabase
          .from('profiles')
          .select('*')
          .neq('role', 'driver')
          .order('full_name');

        // Admins can only assign to their store users
        if (user.role === 'admin') {
          query = query.eq('store_id', user.store_id);
        }

        const { data, error } = await query;
        if (error) throw error;
        setStoreUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoadingUsers(false);
      }
    }

    fetchUsers();
  }, [user?.store_id, user?.role, open, canAssign, supabase]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssignedTo(user?.id || '');
    setDueDate(format(new Date(), 'yyyy-MM-dd'));
    setDueTime('');
    setPriority('medium');
    setReminderMinutes('');
    setReminderType('popup');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user?.store_id) {
      setError('You must be assigned to a store to create tasks');
      return;
    }

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!dueDate) {
      setError('Due date is required');
      return;
    }

    const assignee = assignedTo || user.id;

    // Validate assignment permissions
    if (assignee !== user.id && !canAssign) {
      setError('You can only create tasks for yourself');
      return;
    }

    setLoading(true);

    try {
      // Calculate reminder time if set
      let reminderAt = null;
      if (reminderMinutes && dueDate) {
        const dueDateTime = new Date(`${dueDate}T${dueTime || '09:00'}:00`);
        reminderAt = new Date(dueDateTime.getTime() - parseInt(reminderMinutes) * 60 * 1000).toISOString();
      }

      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        store_id: user.store_id,
        assigned_to: assignee,
        assigned_by: user.id,
        due_date: dueDate,
        due_time: dueTime || null,
        priority,
        reminder_at: reminderAt,
        reminder_type: reminderMinutes ? reminderType : null,
      };

      if (isEditing && editingTask) {
        // Update existing task
        const { error: updateError } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', editingTask.id);

        if (updateError) throw updateError;
      } else {
        // Create new task
        const { data: newTask, error: createError } = await supabase
          .from('tasks')
          .insert({
            ...taskData,
            status: 'pending',
          })
          .select()
          .single();

        if (createError) throw createError;

        // Create notification if assigned to someone else
        if (assignee !== user.id) {
          await supabase.from('notifications').insert({
            user_id: assignee,
            store_id: user.store_id,
            type: 'task_assigned',
            title: 'New Task Assigned',
            message: `${user.full_name || user.email} assigned you a task: ${title}`,
            related_task_id: newTask.id,
            delivery_method: 'popup',
          });
        }
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create Task'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update task details' : 'Create a new task for yourself or your team'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Review inventory report"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about the task..."
                rows={3}
              />
            </div>

            {/* Assign To (only for admins/associates) */}
            {canAssign && (
              <div className="space-y-2">
                <Label htmlFor="assignTo">Assign To</Label>
                <Select value={assignedTo || user?.id} onValueChange={setAssignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingUsers ? 'Loading...' : 'Select user...'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={user?.id || ''}>
                      Myself ({user?.full_name || user?.email})
                    </SelectItem>
                    {storeUsers
                      .filter(u => u.id !== user?.id)
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.full_name || u.email}
                          <span className="text-xs text-gray-500 ml-1">({u.role})</span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Due Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueTime">Due Time</Label>
                <Input
                  id="dueTime"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                />
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <Badge className={cn('text-xs', option.color)}>
                          {option.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reminder Settings */}
            <div className="space-y-3 rounded-lg border border-gray-200 p-3">
              <Label className="text-sm font-medium">Reminder</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reminderMinutes" className="text-xs text-gray-500">
                    When to remind
                  </Label>
                  <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
                    <SelectTrigger>
                      <SelectValue placeholder="No reminder" />
                    </SelectTrigger>
                    <SelectContent>
                      {REMINDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {reminderMinutes && (
                  <div className="space-y-2">
                    <Label htmlFor="reminderType" className="text-xs text-gray-500">
                      Notification type
                    </Label>
                    <Select
                      value={reminderType}
                      onValueChange={(v) => setReminderType(v as 'email' | 'popup' | 'both')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popup">Pop-up only</SelectItem>
                        <SelectItem value="email">Email only</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
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
              {loading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
