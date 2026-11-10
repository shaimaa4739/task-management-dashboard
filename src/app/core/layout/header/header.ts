import { Component, inject } from '@angular/core';
import { TaskSearchService } from '../../services/task-search.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly taskSearch = inject(TaskSearchService);

  protected readonly searchQuery = this.taskSearch.query;

  protected onSearchInput(event: Event): void {
    this.taskSearch.setQuery((event.target as HTMLInputElement).value);
  }
}
