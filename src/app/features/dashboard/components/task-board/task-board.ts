import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TaskCard } from '../../../tasks/components/task-card/task-card';
import { Task } from '../../../tasks/models/task.model';
import { BoardColumn } from '../../models/dashboard.model';

@Component({
  selector: 'app-task-board',
  imports: [TaskCard],
  templateUrl: './task-board.html',
  styleUrl: './task-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskBoard {
  readonly columns = input.required<BoardColumn[]>();
  readonly viewTask = output<Task>();
  readonly editTask = output<Task>();
  readonly deleteTask = output<Task>();
}