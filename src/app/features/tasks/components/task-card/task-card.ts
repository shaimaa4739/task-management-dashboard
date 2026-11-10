import { Component, computed, input } from '@angular/core';
import { Task } from '../../models/task.model';

type StatusTone = 'danger' | 'neutral' | 'success';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
  readonly task = input.required<Task>();

  protected readonly isOverdue = computed(() => this.task().status.kind === 'overdue');

  protected readonly meta = computed((): { icon: string; label: string; tone: StatusTone } => {
    const { status } = this.task();
    switch (status.kind) {
      case 'overdue':
        return { icon: '⚠️', label: status.label, tone: 'danger' };
      case 'due':
        return { icon: '📅', label: status.label, tone: 'neutral' };
      case 'completed':
        return { icon: '✅', label: status.label, tone: 'success' };
    }
  });
}
