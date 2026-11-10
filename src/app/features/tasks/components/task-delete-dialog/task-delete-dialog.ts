import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TaskService } from '../../services/task.service';

export interface TaskDeleteDialogData {
  taskId: string;
  taskTitle: string;
}

@Component({
  selector: 'app-task-delete-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './task-delete-dialog.html',
  styleUrl: './task-delete-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDeleteDialog {
  private readonly taskService = inject(TaskService);
  private readonly dialogRef = inject(MatDialogRef<TaskDeleteDialog, boolean>);
  readonly data = inject<TaskDeleteDialogData>(MAT_DIALOG_DATA);

  readonly pending = signal(false);
  readonly error = signal<string | null>(null);

  onCancel(): void {
    if (!this.pending()) {
      this.dialogRef.close(false);
    }
  }

  onConfirm(): void {
    if (this.pending()) {
      return;
    }

    this.pending.set(true);
    this.error.set(null);
    this.taskService.deleteTask(this.data.taskId).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.error.set('The task could not be deleted. Try again.');
        this.pending.set(false);
      },
    });
  }
}