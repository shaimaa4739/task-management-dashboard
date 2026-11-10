import { differenceInCalendarDays, parseISO, startOfToday } from 'date-fns';
import { Task, TaskStatus } from '../models/task.model';
import { TaskDto } from '../models/task-api.model';

function completedLabel(completedAt?: string): string {
  if (!completedAt) {
    return 'Completed';
  }

  const daysAgo = differenceInCalendarDays(startOfToday(), parseISO(completedAt));

  if (daysAgo <= 0) {
    return 'Completed today';
  }

  if (daysAgo === 1) {
    return 'Completed yesterday';
  }

  return `Completed ${daysAgo} days ago`;
}

function dueStatus(task: TaskDto): TaskStatus {
  const dueInDays = differenceInCalendarDays(parseISO(task.dueDate), startOfToday());

  if (task.isOverdue ?? dueInDays < 0) {
    const daysOverdue = Math.max(1, Math.abs(dueInDays));
    const dayLabel = daysOverdue === 1 ? 'day' : 'days';
    return { kind: 'overdue', label: `Overdue by ${daysOverdue} ${dayLabel}`, dueInDays };
  }

  if (dueInDays === 0) {
    return { kind: 'due', label: 'Due today', dueInDays };
  }

  if (dueInDays === 1) {
    return { kind: 'due', label: 'Due tomorrow', dueInDays };
  }

  return { kind: 'due', label: `Due in ${dueInDays} days`, dueInDays };
}

export function mapTaskDtoToTask(task: TaskDto): Task {
  const status: TaskStatus =
    task.status === 'done'
      ? { kind: 'completed', label: completedLabel(task.completedAt) }
      : dueStatus(task);

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    column: task.status === 'in_progress' ? 'in-progress' : task.status,
    tag: task.tags.join(', '),
    assignee: {
      initials: task.assignee?.avatar ?? '',
      name: task.assignee?.name ?? '',
    },
    status,
  };
}