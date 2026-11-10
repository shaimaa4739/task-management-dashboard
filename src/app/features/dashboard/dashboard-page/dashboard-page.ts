import { Component, computed, inject, signal } from '@angular/core';
import { TaskSearchService } from '../../../core/services/task-search.service';
import { Priority, Task } from '../../tasks/models/task.model';
import { TaskService } from '../../tasks/services/task.service';
import { mapTaskDtoToTask } from '../../tasks/utils/task.mapper';
import { BOARD_COLUMNS } from '../task.data';
import { StatsSummary } from '../components/stats-summary/stats-summary';
import { TaskFilterBar } from '../components/task-filter-bar/task-filter-bar';
import { TaskBoard } from '../components/task-board/task-board';
import {
  BoardColumn,
  FilterId,
  FilterOption,
  SortId,
  StatCard,
} from '../models/dashboard.model';

const FILTERS: FilterOption[] = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
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
  imports: [StatsSummary, TaskFilterBar, TaskBoard],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  private readonly taskService = inject(TaskService);
  private readonly taskSearch = inject(TaskSearchService);

  protected readonly filters = FILTERS;
  protected readonly tasks = computed(() =>
    this.taskService.tasks().map(mapTaskDtoToTask),
  );
  protected readonly searchQuery = this.taskSearch.query;
  protected readonly matchingTasks = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const tasks = this.tasks();

    return query
      ? tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(query) ||
            task.description.toLowerCase().includes(query),
        )
      : tasks;
  });
  protected readonly isLoading = this.taskService.isLoading;
  protected readonly error = this.taskService.error;

  protected readonly stats = computed<StatCard[]>(() => {
    const tasks = this.tasks();
    const completed = tasks.filter((task) => task.status.kind === 'completed').length;
    const inProgress = tasks.filter((task) => task.column === 'in-progress').length;
    const overdue = tasks.filter((task) => task.status.kind === 'overdue').length;

    return [
      {
        label: 'Total Tasks',
        icon: '📊',
        value: tasks.length,
        note: 'Current collection',
        tone: 'success',
      },
      { label: 'Completed', icon: '✅', value: completed, note: 'Current status', tone: 'success' },
      {
        label: 'In Progress',
        icon: '🔄',
        value: inProgress,
        note: 'Current status',
        tone: 'neutral',
      },
      { label: 'Overdue', icon: '⚠️', value: overdue, note: 'Current due dates', tone: 'danger' },
    ];
  });

  protected readonly filter = signal<FilterId>('all');
  protected readonly sortBy = signal<SortId>('priority');

  protected readonly columns = computed<BoardColumn[]>(() => {
    const sort = SORTS[this.sortBy()];
    const activeFilter = this.filter();
    const allTasks = this.tasks();
    const matchingTasks = this.matchingTasks();

    return BOARD_COLUMNS.filter(
      (column) => activeFilter === 'all' || activeFilter === column.id,
    ).map((column) => {
      const columnTasks = matchingTasks.filter((task) => task.column === column.id);

      return {
        ...column,
        count: allTasks.filter((task) => task.column === column.id).length,
        tasks: columnTasks.sort(sort),
      };
    });
  });

  protected readonly hasNoMatchingTasks = computed(() =>
    this.columns().every((column) => column.tasks.length === 0),
  );

  protected onFilterChange(filter: FilterId): void {
    this.filter.set(filter);
  }

  protected onSortChange(sort: SortId): void {
    this.sortBy.set(sort);
  }

  protected onRetry(): void {
    this.taskService.reload();
  }

  protected onNewTask(): void {
    // TODO: open the new-task dialog / navigate to the create form
  }
}