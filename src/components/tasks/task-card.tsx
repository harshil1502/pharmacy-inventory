'use client';

import { useState } from 'react';
import {
  Check,
  Clock,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  User,
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, formatDateTime } from '@/lib/utils';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

interface TaskCardProps {
  task: Task;
  currentUserId: string;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const PRIORITY_STYLES: Record<TaskPriority, { bg: string; text: string; icon: string }> = {
  low: { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'text-gray-400' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'text-yellow-500' },
  high: { bg: 'bg-red-100', text: 'text-red-700', icon: 'text-red-500' },
};

const STATUS_STYLES: Record<TaskStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-700' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-700' },
  completed: { bg: 'bg-green-100', text: 'text-green-700' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
};

export function TaskCard({
  task,
  currentUserId,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const priorityStyle = PRIORITY_STYLES[task.priority];
  const statusStyle = STATUS_STYLES[task.status];

  const isAssignedToMe = task.assigned_to === currentUserId;
  const isCreatedByMe = task.assigned_by === currentUserId;
  const canModify = isAssignedToMe || isCreatedByMe;

  // Format due date
  const dueDate = parseISO(task.due_date);
  const isOverdue = isPast(dueDate) && task.status !== 'completed' && task.status !== 'cancelled';

  const getDueDateLabel = () => {
    if (isToday(dueDate)) return 'Today';
    if (isTomorrow(dueDate)) return 'Tomorrow';
    return format(dueDate, 'MMM d, yyyy');
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(task.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        task.status === 'completed' && 'opacity-60',
        isOverdue && 'border-red-200 bg-red-50/50'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Checkbox / Status indicator */}
          <button
            onClick={() => {
              if (task.status === 'completed') {
                handleStatusChange('pending');
              } else {
                handleStatusChange('completed');
              }
            }}
            disabled={isUpdating || !canModify}
            className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
              task.status === 'completed'
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 hover:border-green-400',
              !canModify && 'cursor-not-allowed opacity-50'
            )}
          >
            {task.status === 'completed' && <Check className="h-3 w-3" />}
          </button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  'font-medium text-gray-900',
                  task.status === 'completed' && 'line-through text-gray-500'
                )}
              >
                {task.title}
              </h3>

              {canModify && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {task.status === 'pending' && (
                      <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Task
                      </DropdownMenuItem>
                    )}
                    {task.status === 'in_progress' && (
                      <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                        <Check className="h-4 w-4 mr-2" />
                        Complete
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(task.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {task.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Priority */}
              <Badge className={cn('text-xs', priorityStyle.bg, priorityStyle.text)}>
                {task.priority}
              </Badge>

              {/* Status */}
              <Badge className={cn('text-xs', statusStyle.bg, statusStyle.text)}>
                {task.status.replace('_', ' ')}
              </Badge>

              {/* Due date */}
              <div
                className={cn(
                  'flex items-center space-x-1 text-xs',
                  isOverdue ? 'text-red-600' : 'text-gray-500'
                )}
              >
                <Clock className="h-3 w-3" />
                <span>{getDueDateLabel()}</span>
                {task.due_time && <span>at {task.due_time.slice(0, 5)}</span>}
              </div>

              {/* Overdue indicator */}
              {isOverdue && (
                <div className="flex items-center space-x-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  <span>Overdue</span>
                </div>
              )}
            </div>

            {/* Assigned info */}
            {!isAssignedToMe && task.assigned_to_user && (
              <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                <User className="h-3 w-3" />
                <span>Assigned to {task.assigned_to_user.full_name || task.assigned_to_user.email}</span>
              </div>
            )}

            {isAssignedToMe && !isCreatedByMe && task.assigned_by_user && (
              <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                <User className="h-3 w-3" />
                <span>From {task.assigned_by_user.full_name || task.assigned_by_user.email}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
