'use client';

import { Task, TaskStatus } from '@/types';
import { TaskCard } from './task-card';

interface TaskListProps {
  tasks: Task[];
  currentUserId: string;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  currentUserId,
  onStatusChange,
  onEdit,
  onDelete,
  emptyMessage = 'No tasks found',
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  // Group tasks by status
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      {/* In Progress */}
      {inProgressTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
            In Progress ({inProgressTasks.length})
          </h3>
          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                currentUserId={currentUserId}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending */}
      {pendingTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
            <span className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
            Pending ({pendingTasks.length})
          </h3>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                currentUserId={currentUserId}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                currentUserId={currentUserId}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
