import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TaskSearchService {
  private readonly queryState = signal('');

  readonly query = this.queryState.asReadonly();

  setQuery(query: string): void {
    this.queryState.set(query);
  }
}