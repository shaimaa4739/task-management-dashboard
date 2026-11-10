import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
  let taskService: {
    tasks: ReturnType<typeof signal<TaskDto[]>>;
    isLoading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<Error | undefined>>;
    reload: ReturnType<typeof vi.fn<() => boolean>>;
  };

  beforeEach(async () => {
    taskService = {
      tasks: signal<TaskDto[]>([]),
      isLoading: signal(true),
      error: signal<Error | undefined>(undefined),
      reload: vi.fn(() => true),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [{ provide: TaskService, useValue: taskService }],
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
    const titles = Array.from(compiled.querySelectorAll('.task-card__title')).map((element) =>
      element.textContent?.trim(),
    );
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
});
