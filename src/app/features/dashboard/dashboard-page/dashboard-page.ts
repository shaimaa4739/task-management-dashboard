import { Component, computed, signal } from '@angular/core';
import { TaskCard } from '../../tasks/components/task-card/task-card';
import { ColumnId, Priority, Task } from '../../tasks/models/task.model';
import { BOARD_COLUMNS, TASKS } from '../task.data';

type FilterId = 'all' | ColumnId;
type SortId = 'priority' | 'due-date';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];

type StatTone = 'success' | 'neutral' | 'danger';

interface StatCard {
  label: string;
  icon: string;
  value: number;
  note: string;
  tone: StatTone;
}

const STATS: StatCard[] = [
  { label: 'Total Tasks', icon: '📊', value: 156, note: '+12 this week', tone: 'success' },
  { label: 'Completed', icon: '✅', value: 89, note: '+8 today', tone: 'success' },
  { label: 'In Progress', icon: '🔄', value: 42, note: 'Same as yesterday', tone: 'neutral' },
  { label: 'Overdue', icon: '⚠️', value: 25, note: '+3 today', tone: 'danger' },
];

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const NO_DUE_DATE = Number.MAX_SAFE_INTEGER;

function dueInDays(task: Task): number {
  return task.status.kind === 'completed' ? NO_DUE_DATE : task.status.dueInDays;
}

const SORTS: Record<SortId, (a: Task, b: Task) => number> = {
  priority: (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
  'due-date': (a, b) => dueInDays(a) - dueInDays(b),
};

@Component({
  selector: 'app-dashboard-page',
  imports: [TaskCard],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  protected readonly filters = FILTERS;
  protected readonly stats = STATS;
  protected readonly filter = signal<FilterId>('all');
  protected readonly sortBy = signal<SortId>('priority');

  protected readonly columns = computed(() => {
    const sort = SORTS[this.sortBy()];
    const activeFilter = this.filter();

    return BOARD_COLUMNS.filter((column) => activeFilter === 'all' || activeFilter === column.id).map(
      (column) => ({
        ...column,
        tasks: TASKS.filter((task) => task.column === column.id).sort(sort),
      }),
    );
  });

  protected onSortChange(event: Event): void {
    this.sortBy.set((event.target as HTMLSelectElement).value as SortId);
  }
}
