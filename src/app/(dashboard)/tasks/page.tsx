'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Filter, ListTodo, CheckCircle2, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { Task, TaskStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskList } from '@/components/tasks/task-list';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';

type FilterType = 'all' | 'assigned_to_me' | 'created_by_me';

export default function TasksPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const supabase = createClient();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('assigned_to_me');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Task stats
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  const fetchTasks = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_user:profiles!tasks_assigned_to_fkey(id, email, full_name, role),
          assigned_by_user:profiles!tasks_assigned_by_fkey(id, email, full_name, role),
          store:stores(id, name, code)
        `)
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false });

      // Apply filter
      if (filter === 'assigned_to_me') {
        query = query.eq('assigned_to', user.id);
      } else if (filter === 'created_by_me') {
        query = query.eq('assigned_by', user.id);
      }

      // If not associate, limit to own store
      if (user.role !== 'associate' && user.store_id) {
        query = query.eq('store_id', user.store_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role, user?.store_id, filter, supabase]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase, fetchTasks]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updateData: Partial<Task> = {
        status: newStatus,
      };

      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      // Optimistic update
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, ...updateData } : t
        )
      );
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowCreateDialog(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setShowCreateDialog(open);
    if (!open) {
      setEditingTask(null);
    }
  };

  if (!user) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Please log in to view tasks</p>
      </div>
    );
  }

  // Drivers don't have access to tasks
  if (user.role === 'driver') {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">You don't have access to task management</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage your tasks and to-do items
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <ListTodo className="h-4 w-4 mr-2 text-blue-500" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">Filter:</span>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="assigned_to_me">Assigned to Me</SelectItem>
            <SelectItem value="created_by_me">Created by Me</SelectItem>
            <SelectItem value="all">All Tasks</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-500">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-500">Loading tasks...</p>
        </div>
      ) : (
        <TaskList
          tasks={tasks}
          currentUserId={user.id}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage={
            filter === 'assigned_to_me'
              ? 'No tasks assigned to you'
              : filter === 'created_by_me'
              ? 'You haven\'t created any tasks'
              : 'No tasks found'
          }
        />
      )}

      {/* Create/Edit Task Dialog */}
      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={handleDialogClose}
        editingTask={editingTask}
        onSuccess={fetchTasks}
      />
    </div>
  );
}
