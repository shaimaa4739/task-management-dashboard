import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskSearchService } from '../../../core/services/task-search.service';
import { TaskDto } from '../../tasks/models/task-api.model';
import { TaskService } from '../../tasks/services/task.service';
import { DashboardPage } from './dashboard-page';

function createTask(overrides: Partial<TaskDto> = {}): TaskDto {
  return {
    id: 'task-001',
    title: 'Sample task',
    description: 'A task for the dashboard test',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-11-15',
    assignee: {
      id: 'user-001',
      name: 'Jordan Doe',
      avatar: 'JD',
      email: 'jordan.doe@example.com',
    },
    tags: ['Testing'],
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-02T10:00:00.000Z',
    ...overrides,
  };
}

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let searchQuery: WritableSignal<string>;
  let taskService: {
    tasks: ReturnType<typeof signal<TaskDto[]>>;
    isLoading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<Error | undefined>>;
    reload: ReturnType<typeof vi.fn<() => boolean>>;
  };

  beforeEach(async () => {
    searchQuery = signal('');
    taskService = {
      tasks: signal<TaskDto[]>([]),
      isLoading: signal(true),
      error: signal<Error | undefined>(undefined),
      reload: vi.fn(() => true),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        { provide: TaskService, useValue: taskService },
        { provide: TaskSearchService, useValue: { query: searchQuery } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function loadTasks(tasks: TaskDto[]): void {
    taskService.tasks.set(tasks);
    taskService.error.set(undefined);
    taskService.isLoading.set(false);
    fixture.detectChanges();
  }

  function searchFor(query: string): void {
    searchQuery.set(query);
    fixture.detectChanges();
  }

  function visibleTaskTitles(): string[] {
    const compiled = fixture.nativeElement as HTMLElement;
    return Array.from(compiled.querySelectorAll('.task-card__title')).map(
      (element) => element.textContent?.trim() ?? '',
    );
  }

  function selectFilter(label: string): void {
    const compiled = fixture.nativeElement as HTMLElement;
    const filterButton = Array.from(compiled.querySelectorAll<HTMLButtonElement>('.tab-button')).find(
      (button) => button.textContent?.trim() === label,
    );
    filterButton?.click();
    fixture.detectChanges();
  }

  function selectSort(sort: 'priority' | 'due-date'): void {
    const sortSelect = (fixture.nativeElement as HTMLElement).querySelector<HTMLSelectElement>(
      '[aria-label="Sort tasks"]',
    );
    sortSelect!.value = sort;
    sortSelect!.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows loading instead of dashboard content while the API is loading', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.dashboard-state--loading')).not.toBeNull();
    expect(compiled.querySelector('app-stats-summary')).toBeNull();
    expect(compiled.querySelector('app-task-filter-bar')).toBeNull();
    expect(compiled.querySelector('app-task-board')).toBeNull();
  });

  it('shows an error and retries the API request without falling back to static tasks', () => {
    taskService.error.set(new Error('API unavailable'));
    taskService.isLoading.set(false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.dashboard-state--error')?.textContent).toContain(
      'Tasks could not be loaded.',
    );
    expect(compiled.querySelector('app-task-board')).toBeNull();

    compiled.querySelector<HTMLButtonElement>('.dashboard-state__retry')?.click();

    expect(taskService.reload).toHaveBeenCalledOnce();
  });

  it('shows the empty state only after a successful empty response', () => {
    loadTasks([]);
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.dashboard-state--empty')?.textContent).toContain('No tasks yet.');
    expect(compiled.querySelector('.dashboard-state--loading')).toBeNull();
    expect(compiled.querySelector('.dashboard-state--error')).toBeNull();
    expect(compiled.querySelector('app-task-board')).toBeNull();
  });

  it('derives statistics and unfiltered board counts from API tasks', () => {
    loadTasks([
      createTask({ id: 'task-todo', isOverdue: true, dueDate: '2026-11-08' }),
      createTask({
        id: 'task-progress',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-11-15',
      }),
      createTask({
        id: 'task-done',
        status: 'done',
        completedAt: '2026-11-10T09:00:00.000Z',
      }),
    ]);

    const compiled = fixture.nativeElement as HTMLElement;
    const statValues = Array.from(compiled.querySelectorAll('.stat-card__value')).map((element) =>
      element.textContent?.trim(),
    );
    const columnCounts = Array.from(compiled.querySelectorAll('.column__count')).map((element) =>
      element.textContent?.trim(),
    );

    expect(statValues).toEqual(['3', '1', '1', '1']);
    expect(columnCounts).toEqual(['1', '1', '1']);
  });

  it('preserves task sorting and keeps column totals unchanged when filtering', () => {
    loadTasks([
      createTask({ id: 'task-low', title: 'Low priority', priority: 'low' }),
      createTask({ id: 'task-high', title: 'High priority', priority: 'high' }),
      createTask({ id: 'task-progress', status: 'in_progress' }),
    ]);

    const compiled = fixture.nativeElement as HTMLElement;
    const titles = visibleTaskTitles();
    expect(titles.slice(0, 2)).toEqual(['High priority', 'Low priority']);

    const todoFilter = Array.from(compiled.querySelectorAll<HTMLButtonElement>('.tab-button')).find(
      (button) => button.textContent?.trim() === 'To Do',
    );
    todoFilter?.click();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.column')).toHaveLength(1);
    expect(compiled.querySelector('.column__count')?.textContent?.trim()).toBe('2');
    expect(compiled.querySelector('.stat-card__value')?.textContent?.trim()).toBe('3');
  });

  it('searches full and partial task titles', () => {
    loadTasks([
      createTask({ id: 'task-design', title: 'Design the dashboard overview' }),
      createTask({ id: 'task-release', title: 'Prepare release notes' }),
    ]);

    searchFor('Design the dashboard overview');
    expect(visibleTaskTitles()).toEqual(['Design the dashboard overview']);

    searchFor('dashboard over');
    expect(visibleTaskTitles()).toEqual(['Design the dashboard overview']);
  });

  it('searches task descriptions', () => {
    loadTasks([
      createTask({
        id: 'task-description',
        title: 'Prepare the release',
        description: 'Coordinate the quarterly planning session',
      }),
      createTask({ id: 'task-other', description: 'Review API documentation' }),
    ]);

    searchFor('quarterly planning');

    expect(visibleTaskTitles()).toEqual(['Prepare the release']);
  });

  it('matches task titles and descriptions case-insensitively', () => {
    loadTasks([
      createTask({ id: 'task-title', title: 'Design the Dashboard' }),
      createTask({
        id: 'task-description',
        title: 'Review requirements',
        description: 'Confirm the SEARCH behavior',
      }),
    ]);

    searchFor('dEsIgN');
    expect(visibleTaskTitles()).toEqual(['Design the Dashboard']);

    searchFor('search BEHAVIOR');
    expect(visibleTaskTitles()).toEqual(['Review requirements']);
  });

  it('shows an empty-results message when search and filters match no tasks', () => {
    loadTasks([createTask({ title: 'Prepare release notes' })]);

    searchFor('nonexistent task');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.dashboard-state--empty')?.textContent).toContain(
      'No tasks match your search and filters.',
    );
    expect(compiled.querySelector('app-task-board')).toBeNull();
  });

  it('clearing search restores all tasks matching the selected status filter', () => {
    loadTasks([
      createTask({ id: 'task-match', title: 'Design release plan' }),
      createTask({ id: 'task-other', title: 'Prepare budget report' }),
      createTask({ id: 'task-progress', status: 'in_progress' }),
    ]);
    selectFilter('To Do');
    searchFor('design');
    expect(visibleTaskTitles()).toEqual(['Design release plan']);

    searchFor('');

    expect(visibleTaskTitles()).toEqual(['Design release plan', 'Prepare budget report']);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.column__count')?.textContent?.trim(),
    ).toBe('2');
  });

  it('combines search with each existing status filter', () => {
    loadTasks([
      createTask({ id: 'task-todo', title: 'Design todo task' }),
      createTask({ id: 'task-progress', title: 'Design active task', status: 'in_progress' }),
      createTask({
        id: 'task-done',
        title: 'Design completed task',
        status: 'done',
        completedAt: '2026-11-10T09:00:00.000Z',
      }),
    ]);
    searchFor('design');

    for (const [filterLabel, expectedTitle] of [
      ['To Do', 'Design todo task'],
      ['In Progress', 'Design active task'],
      ['Done', 'Design completed task'],
    ]) {
      selectFilter(filterLabel);
      expect(visibleTaskTitles()).toEqual([expectedTitle]);
    }
  });

  it('combines search with priority sorting', () => {
    loadTasks([
      createTask({ id: 'task-low', title: 'Plan low task', priority: 'low' }),
      createTask({ id: 'task-high', title: 'Plan high task', priority: 'high' }),
      createTask({ id: 'task-medium', title: 'Plan medium task', priority: 'medium' }),
    ]);
    searchFor('plan');
    selectSort('priority');

    expect(visibleTaskTitles()).toEqual(['Plan high task', 'Plan medium task', 'Plan low task']);
  });

  it('combines search with due-date sorting', () => {
    loadTasks([
      createTask({ id: 'task-later', title: 'Plan later task', dueDate: '2026-11-20' }),
      createTask({ id: 'task-sooner', title: 'Plan sooner task', dueDate: '2026-11-12' }),
      createTask({ id: 'task-middle', title: 'Plan middle task', dueDate: '2026-11-15' }),
    ]);
    searchFor('plan');
    selectSort('due-date');

    expect(visibleTaskTitles()).toEqual(['Plan sooner task', 'Plan middle task', 'Plan later task']);
  });
});
