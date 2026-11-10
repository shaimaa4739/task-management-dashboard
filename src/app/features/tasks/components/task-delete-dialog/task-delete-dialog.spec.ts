import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, of, throwError } from 'rxjs';
import { TaskService } from '../../services/task.service';
import { TaskDeleteDialog, TaskDeleteDialogData } from './task-delete-dialog';

describe('TaskDeleteDialog', () => {
  let taskService: { deleteTask: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };
  let data: TaskDeleteDialogData;

  beforeEach(async () => {
    data = { taskId: 'task-001', taskTitle: 'Prepare release notes' };
    taskService = { deleteTask: vi.fn(() => of(undefined)) };
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TaskDeleteDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useFactory: () => data },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: TaskService, useValue: taskService },
      ],
    }).compileComponents();
  });

  function createFixture(): ComponentFixture<TaskDeleteDialog> {
    const fixture = TestBed.createComponent(TaskDeleteDialog);
    fixture.detectChanges();
    return fixture;
  }

  it('does not delete when cancelled', () => {
    const component = createFixture().componentInstance;
    component.onCancel();

    expect(taskService.deleteTask).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('deletes only after confirmation and closes after success', () => {
    const component = createFixture().componentInstance;
    component.onConfirm();

    expect(taskService.deleteTask).toHaveBeenCalledWith(data.taskId);
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('shows an error and remains open when deletion fails', () => {
    taskService.deleteTask.mockReturnValue(throwError(() => new Error('Request failed')));
    const component = createFixture().componentInstance;
    component.onConfirm();

    expect(component.error()).toContain('could not be deleted');
    expect(component.pending()).toBe(false);
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('prevents duplicate confirmation while deletion is pending', () => {
    const request = new Subject<void>();
    taskService.deleteTask.mockReturnValue(request);
    const component = createFixture().componentInstance;
    component.onConfirm();
    component.onConfirm();

    expect(taskService.deleteTask).toHaveBeenCalledOnce();
    expect(component.pending()).toBe(true);
    request.next();
    request.complete();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});