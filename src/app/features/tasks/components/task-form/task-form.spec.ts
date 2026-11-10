import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { Observable, Subject, of, throwError } from 'rxjs';
import { CreateTaskDto, TaskDto } from '../../models/task-api.model';
import { TaskService } from '../../services/task.service';
import { TaskForm, TaskFormDialogData } from './task-form';

const existingTask: TaskDto = {
  id: 'task-001',
  title: 'Design new homepage layout',
  description: 'Create wireframes and mockups for the new homepage redesign',
  status: 'in_progress',
  priority: 'high',
  dueDate: '2026-11-18',
  assignee: {
    id: 'user-001',
    name: 'John Doe',
    avatar: 'JD',
    email: 'john.doe@company.com',
  },
  tags: ['Design', 'Web'],
  createdAt: '2026-11-01T10:00:00.000Z',
  updatedAt: '2026-11-02T10:00:00.000Z',
};

describe('TaskForm', () => {
  let taskService: {
    tasks: ReturnType<typeof signal<TaskDto[]>>;
    createTask: ReturnType<typeof vi.fn<(task: CreateTaskDto) => Observable<TaskDto>>>;
    updateTask: ReturnType<typeof vi.fn<(id: string, changes: Partial<CreateTaskDto>) => Observable<TaskDto>>>;
  };
  let dialogRef: { close: ReturnType<typeof vi.fn> };
  let dialogData: TaskFormDialogData;

  beforeEach(async () => {
    dialogData = { mode: 'create' };
    taskService = {
      tasks: signal([existingTask]),
      createTask: vi.fn(() => of({ ...existingTask, id: 'task-created' })),
      updateTask: vi.fn((_id, changes) => of({ ...existingTask, ...changes })),
    };
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TaskForm],
      providers: [
        { provide: MAT_DIALOG_DATA, useFactory: () => dialogData },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: TaskService, useValue: taskService },
      ],
    }).compileComponents();
  });

  function createFixture(data: TaskFormDialogData = dialogData): ComponentFixture<TaskForm> {
    dialogData = data;
    const fixture = TestBed.createComponent(TaskForm);
    fixture.detectChanges();
    return fixture;
  }

  function fillValidForm(fixture: ComponentFixture<TaskForm>): void {
    fixture.componentInstance.form.patchValue({
      title: 'Plan release notes',
      description: 'Prepare notes for the upcoming release',
      priority: 'medium',
      status: 'todo',
      dueDate: '2030-01-15',
      assigneeId: 'user-001',
      tags: 'Planning, Release',
    });
  }

  it('should create', () => {
    expect(createFixture().componentInstance).toBeTruthy();
  });

  it('initializes edit mode from the original DTO', () => {
    const fixture = createFixture({ mode: 'edit', task: existingTask });
    const value = fixture.componentInstance.form.getRawValue();

    expect(value).toMatchObject({
      title: existingTask.title,
      description: existingTask.description,
      priority: existingTask.priority,
      status: existingTask.status,
      dueDate: existingTask.dueDate,
      assigneeId: existingTask.assignee!.id,
      assigneeName: existingTask.assignee!.name,
      assigneeAvatar: existingTask.assignee!.avatar,
      assigneeEmail: existingTask.assignee!.email,
      tags: 'Design, Web',
    });
    expect(fixture.componentInstance.assigneeOptions()).toEqual([existingTask.assignee]);
  });

  it('makes view mode read-only and does not submit mutations', () => {
    const fixture = createFixture({ mode: 'view', task: existingTask });
    const component = fixture.componentInstance;

    expect(component.form.disabled).toBe(true);
    component.onSubmit();

    expect(taskService.createTask).not.toHaveBeenCalled();
    expect(taskService.updateTask).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('closes only when the user explicitly cancels while no save is pending', () => {
    const component = createFixture().componentInstance;
    component.onCancel();

    expect(dialogRef.close).toHaveBeenCalledOnce();
  });

  it('validates required and minimum-length task fields', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.onSubmit();

    expect(component.form.invalid).toBe(true);
    expect(taskService.createTask).not.toHaveBeenCalled();

    component.form.patchValue({ title: 'ab', description: 'short' });
    expect(component.form.controls.title.hasError('minlength')).toBe(true);
    expect(component.form.controls.description.hasError('minlength')).toBe(true);
  });

  it('creates a DTO with timestamps, assignee, tags, and consistent completion fields', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    fillValidForm(fixture);
    component.form.controls.status.setValue('done');

    component.onSubmit();

    const payload = taskService.createTask.mock.calls[0][0];
    expect(payload).toMatchObject({
      title: 'Plan release notes',
      description: 'Prepare notes for the upcoming release',
      status: 'done',
      dueDate: '2030-01-15',
      isOverdue: false,
      assignee: existingTask.assignee,
      tags: ['Planning', 'Release'],
    });
    expect(payload.completedAt).toBeTruthy();
    expect(payload.createdAt).toBe(payload.updatedAt);
    expect(dialogRef.close).toHaveBeenCalledOnce();
  });

  it('updates the selected task and clears completion when status changes away from done', () => {
    const doneTask: TaskDto = {
      ...existingTask,
      status: 'done',
      completedAt: '2026-11-02T10:00:00.000Z',
      isOverdue: true,
    };
    taskService.tasks.set([doneTask]);
    const fixture = createFixture({ mode: 'edit', task: doneTask });
    const component = fixture.componentInstance;
    component.form.patchValue({ status: 'todo', dueDate: '2030-01-15' });

    component.onSubmit();

    expect(taskService.updateTask).toHaveBeenCalledOnce();
    expect(taskService.updateTask.mock.calls[0][0]).toBe(doneTask.id);
    const changes = taskService.updateTask.mock.calls[0][1];
    expect(changes.createdAt).toBe(doneTask.createdAt);
    expect(changes.updatedAt).not.toBe(doneTask.updatedAt);
    expect(changes.completedAt).toBe('');
    expect(changes.isOverdue).toBe(false);
  });

  it('retains entered values and remains open after an API error', () => {
    taskService.createTask.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' })),
    );
    const fixture = createFixture();
    const component = fixture.componentInstance;
    fillValidForm(fixture);

    component.onSubmit();

    expect(component.form.controls.title.value).toBe('Plan release notes');
    expect(component.error()).toContain('Your changes are still here');
    expect(component.pending()).toBe(false);
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('prevents duplicate submissions while a request is pending', () => {
    const request = new Subject<TaskDto>();
    taskService.createTask.mockReturnValue(request);
    const fixture = createFixture();
    const component = fixture.componentInstance;
    fillValidForm(fixture);

    component.onSubmit();
    component.onSubmit();

    expect(taskService.createTask).toHaveBeenCalledOnce();
    expect(component.pending()).toBe(true);
    request.next(existingTask);
    request.complete();
  });

  it('closes after a successful update and retains the original creation timestamp', () => {
    const fixture = createFixture({ mode: 'edit', task: existingTask });
    const component = fixture.componentInstance;
    component.form.controls.title.setValue('Edited task title');

    component.onSubmit();

    expect(taskService.updateTask).toHaveBeenCalledOnce();
    expect(taskService.updateTask.mock.calls[0][1].createdAt).toBe(existingTask.createdAt);
    expect(dialogRef.close).toHaveBeenCalledOnce();
  });

  it('requires manual assignee fields when the API collection has no assignees', () => {
    taskService.tasks.set([]);
    const fixture = createFixture();
    const component = fixture.componentInstance;
    fillValidForm(fixture);
    component.form.patchValue({
      assigneeId: 'user-manual',
      assigneeName: 'Manual User',
      assigneeAvatar: 'MU',
      assigneeEmail: 'manual@example.com',
    });

    component.onSubmit();

    expect(taskService.createTask.mock.calls[0][0].assignee).toEqual({
      id: 'user-manual',
      name: 'Manual User',
      avatar: 'MU',
      email: 'manual@example.com',
    });
  });
});
