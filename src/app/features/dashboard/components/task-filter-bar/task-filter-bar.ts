import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FilterId, FilterOption, SortId } from '../../models/dashboard.model';

@Component({
  selector: 'app-task-filter-bar',
  templateUrl: './task-filter-bar.html',
  styleUrl: './task-filter-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFilterBar {
  readonly filters = input.required<FilterOption[]>();
  readonly activeFilter = input.required<FilterId>();
  readonly sortBy = input.required<SortId>();

  readonly filterChange = output<FilterId>();
  readonly sortChange = output<SortId>();
  readonly newTask = output<void>();

  protected onSortChange(event: Event): void {
    this.sortChange.emit((event.target as HTMLSelectElement).value as SortId);
  }
}