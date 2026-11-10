import { ColumnId, Priority, Task } from '../../tasks/models/task.model';

export type FilterId = 'all' | ColumnId;
export type PriorityFilterId = 'all' | Priority;
export type SortId = 'priority' | 'due-date';

export interface FilterOption {
  id: FilterId;
  label: string;
}

export interface PriorityFilterOption {
  id: PriorityFilterId;
  label: string;
}

export interface AssigneeFilterOption {
  id: string;
  name: string;
  email: string;
}

export type StatTone = 'success' | 'neutral' | 'danger';

export interface StatCard {
  label: string;
  icon: string;
  value: number;
  note: string;
  tone: StatTone;
}

export interface BoardColumn {
  id: ColumnId;
  title: string;
  count: number;
  tasks: Task[];
}