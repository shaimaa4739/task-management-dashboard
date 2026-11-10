import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TaskSearchService } from '../../../core/services/task-search.service';
import { TaskDeleteDialog } from '../../tasks/components/task-delete-dialog/task-delete-dialog';
import { TaskForm, TaskFormDialogData } from '../../tasks/components/task-form/task-form';
import { Priority, Task } from '../../tasks/models/task.model';
import { TaskService } from '../../tasks/services/task.service';
import { mapTaskDtoToTask } from '../../tasks/utils/task.mapper';
import { BOARD_COLUMNS } from '../task.data';
import { StatsSummary } from '../components/stats-summary/stats-summary';
import { TaskFilterBar } from '../components/task-filter-bar/task-filter-bar';
import { TaskBoard } from '../components/task-board/task-board';
import {
  AssigneeFilterOption,
  BoardColumn,
  FilterId,
  FilterOption,
  PriorityFilterId,
  PriorityFilterOption,
  SortId,
  StatCard,
} from '../models/dashboard.model';

const FILTERS: FilterOption[] = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS: PriorityFilterOption[] = [
  { id: 'all', label: 'All priorities' },
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
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
  imports: [MatButtonModule, StatsSummary, TaskFilterBar, TaskBoard],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  private readonly taskService = inject(TaskService);
  private readonly taskSearch = inject(TaskSearchService);
  private readonly dialog = inject(MatDialog);

  protected readonly filters = FILTERS;
  protected readonly priorityOptions = PRIORITY_OPTIONS;
  protected readonly assigneeOptions = computed<AssigneeFilterOption[]>(() => {
    const options = new Map<string, AssigneeFilterOption>();
    for (const task of this.taskService.tasks()) {
      const assignee = task.assignee;
      if (assignee?.id) {
        options.set(assignee.id, {
          id: assignee.id,
          name: assignee.name,
          email: assignee.email,
        });
      }
    }
    return [...options.values()].sort((first, second) => first.name.localeCompare(second.name));
  });
  protected readonly tasks = computed(() =>
    this.taskService.tasks().map(mapTaskDtoToTask),
  );
  protected readonly searchQuery = this.taskSearch.query;
  protected readonly filter = signal<FilterId>('all');
  protected readonly priorityFilter = signal<PriorityFilterId>('all');
  protected readonly assigneeFilter = signal('all');
  protected readonly sortBy = signal<SortId>('priority');

  protected readonly matchingTasks = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const priority = this.priorityFilter();
    const assignee = this.assigneeFilter();
    const tasks = this.tasks();
    const assigneeByTaskId = new Map(
      this.taskService.tasks().map((task) => [String(task.id), task.assignee?.id]),
    );

    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query);
      const matchesPriority = priority === 'all' || task.priority === priority;
      const matchesAssignee =
        assignee === 'all' || assigneeByTaskId.get(String(task.id)) === assignee;

      return matchesSearch && matchesPriority && matchesAssignee;
    });
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

  protected onPriorityChange(priority: PriorityFilterId): void {
    this.priorityFilter.set(priority);
  }

  protected onAssigneeChange(assignee: string): void {
    this.assigneeFilter.set(assignee);
  }

  protected onSortChange(sort: SortId): void {
    this.sortBy.set(sort);
  }

  protected onRetry(): void {
    this.taskService.reload();
  }

  protected onViewTask(task: Task): void {
    const taskDto = this.taskService.tasks().find((item) => item.id === task.id);
    if (taskDto) {
      this.openTaskForm({ mode: 'view', task: taskDto });
    }
  }

  protected onEditTask(task: Task): void {
    const taskDto = this.taskService.tasks().find((item) => item.id === task.id);
    if (taskDto) {
      this.openTaskForm({ mode: 'edit', task: taskDto });
    }
  }

  protected onDeleteTask(task: Task): void {
    this.dialog.open(TaskDeleteDialog, {
      data: { taskId: String(task.id), taskTitle: task.title },
      disableClose: true,
    });
  }

  protected onNewTask(): void {
    this.openTaskForm({ mode: 'create' });
  }

  private openTaskForm(data: TaskFormDialogData): void {
    this.dialog.open(TaskForm, { data, disableClose: true });
  }
}