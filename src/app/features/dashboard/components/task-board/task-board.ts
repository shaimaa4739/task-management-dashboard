import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TaskCard } from '../../../tasks/components/task-card/task-card';
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
}