import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  AssigneeFilterOption,
  FilterId,
  FilterOption,
  PriorityFilterId,
  PriorityFilterOption,
  SortId,
} from '../../models/dashboard.model';

@Component({
  selector: 'app-task-filter-bar',
  templateUrl: './task-filter-bar.html',
  styleUrl: './task-filter-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFilterBar {
  readonly filters = input.required<FilterOption[]>();
  readonly priorityOptions = input.required<PriorityFilterOption[]>();
  readonly assigneeOptions = input.required<AssigneeFilterOption[]>();
  readonly activeFilter = input.required<FilterId>();
  readonly activePriority = input.required<PriorityFilterId>();
  readonly activeAssignee = input.required<string>();
  readonly sortBy = input.required<SortId>();

  readonly filterChange = output<FilterId>();
  readonly priorityChange = output<PriorityFilterId>();
  readonly assigneeChange = output<string>();
  readonly sortChange = output<SortId>();
  readonly newTask = output<void>();

  protected onSortChange(event: Event): void {
    this.sortChange.emit((event.target as HTMLSelectElement).value as SortId);
  }

  protected onPriorityChange(event: Event): void {
    this.priorityChange.emit((event.target as HTMLSelectElement).value as PriorityFilterId);
  }

  protected onAssigneeChange(event: Event): void {
    this.assigneeChange.emit((event.target as HTMLSelectElement).value);
  }
}