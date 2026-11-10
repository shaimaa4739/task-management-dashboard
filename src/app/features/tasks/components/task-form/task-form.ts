import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { format } from 'date-fns';
import { TaskAssigneeDto, TaskDto, TaskApiPriority, TaskApiStatus } from '../../models/task-api.model';
import { TaskService } from '../../services/task.service';

export type TaskFormDialogData =
  | { mode: 'create' }
  | { mode: 'edit' | 'view'; task: TaskDto };

type TaskFormControls = {
  title: FormControl<string>;
  description: FormControl<string>;
  priority: FormControl<TaskApiPriority>;
  status: FormControl<TaskApiStatus>;
  dueDate: FormControl<string>;
  assigneeId: FormControl<string>;
  assigneeName: FormControl<string>;
  assigneeAvatar: FormControl<string>;
  assigneeEmail: FormControl<string>;
  tags: FormControl<string>;
};

@Component({
  selector: 'app-task-form',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskForm {
  private readonly taskService = inject(TaskService);
  private readonly dialogRef = inject(MatDialogRef<TaskForm>);
  readonly data = inject<TaskFormDialogData>(MAT_DIALOG_DATA);

  readonly pending = signal(false);
  readonly error = signal<string | null>(null);
  readonly submitted = signal(false);
  readonly isViewMode = this.data.mode === 'view';
  readonly title = this.data.mode === 'create' ? 'Create task' : this.data.mode === 'edit' ? 'Edit task' : 'Task details';
  readonly assigneeOptions = computed(() => {
    const assignees = new Map<string, TaskAssigneeDto>();
    for (const task of this.taskService.tasks()) {
      if (task.assignee?.id) {
        assignees.set(task.assignee.id, task.assignee);
      }
    }
    return [...assignees.values()];
  });

  readonly form = new FormGroup<TaskFormControls>({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10)],
    }),
    priority: new FormControl<TaskApiPriority>('medium', { nonNullable: true }),
    status: new FormControl<TaskApiStatus>('todo', { nonNullable: true }),
    dueDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    assigneeId: new FormControl('', { nonNullable: true }),
    assigneeName: new FormControl('', { nonNullable: true }),
    assigneeAvatar: new FormControl('', { nonNullable: true }),
    assigneeEmail: new FormControl('', { nonNullable: true }),
    tags: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    const task = this.data.mode === 'create' ? undefined : this.data.task;
    this.form.setValue({
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? 'medium',
      status: task?.status ?? 'todo',
      dueDate: task?.dueDate ?? '',
      assigneeId: task?.assignee?.id ?? '',
      assigneeName: task?.assignee?.name ?? '',
      assigneeAvatar: task?.assignee?.avatar ?? '',
      assigneeEmail: task?.assignee?.email ?? '',
      tags: task?.tags.join(', ') ?? '',
    });
    this.updateAssigneeValidators();

    if (this.isViewMode) {
      this.form.disable({ emitEvent: false });
    }
  }

  onCancel(): void {
    if (!this.pending()) {
      this.dialogRef.close();
    }
  }

  onSubmit(): void {
    if (this.isViewMode || this.pending()) {
      return;
    }

    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    const original = this.data.mode === 'create' ? undefined : this.data.task;
    const assignee = this.assigneeOptions().find((option) => option.id === value.assigneeId) ?? {
      id: value.assigneeId,
      name: value.assigneeName.trim(),
      avatar: value.assigneeAvatar.trim(),
      email: value.assigneeEmail.trim(),
    };
    const timestamp = new Date().toISOString();
    const isDone = value.status === 'done';
    const payload = {
      title: value.title.trim(),
      description: value.description.trim(),
      priority: value.priority,
      status: value.status,
      dueDate: value.dueDate,
      isOverdue: !isDone && value.dueDate < format(new Date(), 'yyyy-MM-dd'),
      completedAt: isDone
        ? original?.status === 'done' && original.completedAt
          ? original.completedAt
          : timestamp
        : '',
      assignee,
      tags: value.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      createdAt: original?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    this.pending.set(true);
    this.error.set(null);
    const request =
      this.data.mode === 'create'
        ? this.taskService.createTask(payload)
        : this.taskService.updateTask(this.data.task.id, payload);

    request.subscribe({
      next: (task) => this.dialogRef.close(task),
      error: () => {
        this.error.set('The task could not be saved. Your changes are still here; try again.');
        this.pending.set(false);
      },
    });
  }

  private updateAssigneeValidators(): void {
    const hasAssignees = this.assigneeOptions().length > 0;
    const { assigneeId, assigneeName, assigneeAvatar, assigneeEmail } = this.form.controls;

    assigneeId.setValidators(hasAssignees ? Validators.required : null);
    for (const control of [assigneeName, assigneeAvatar, assigneeEmail]) {
      control.setValidators(hasAssignees ? null : Validators.required);
    }
    if (!hasAssignees) {
      assigneeEmail.addValidators(Validators.email);
    }

    for (const control of [assigneeId, assigneeName, assigneeAvatar, assigneeEmail]) {
      control.updateValueAndValidity({ emitEvent: false });
    }
  }
}
