export type Priority = 'high' | 'medium' | 'low';

export type ColumnId = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: number | string;
  title: string;
  description: string;
  priority: Priority;
  column: ColumnId;
  tag: string;
  assignee: { initials: string; name: string };
  status: TaskStatus;
}

export type TaskStatus =
  | { kind: 'overdue'; label: string; dueInDays: number }
  | { kind: 'due'; label: string; dueInDays: number }
  | { kind: 'completed'; label: string };

export interface BoardColumn {
  id: ColumnId;
  title: string;
  count: number;
}
