import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { CreateTaskDto, TaskDto, UpdateTaskDto } from '../models/task-api.model';
import { TASKS_API_URL } from './task-api.config';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly tasksResource = httpResource<TaskDto[]>(() => TASKS_API_URL, {
    defaultValue: [],
  });

  readonly tasks = this.tasksResource.value;
  readonly isLoading = this.tasksResource.isLoading;
  readonly error = this.tasksResource.error;

  reload(): boolean {
    return this.tasksResource.reload();
  }

  createTask(task: CreateTaskDto): Observable<TaskDto> {
    return this.http.post<TaskDto>(TASKS_API_URL, task).pipe(tap(() => this.reload()));
  }

  updateTask(id: string, changes: UpdateTaskDto): Observable<TaskDto> {
    const taskUrl = `${TASKS_API_URL}/${encodeURIComponent(id)}`;
    return this.http.patch<TaskDto>(taskUrl, changes).pipe(tap(() => this.reload()));
  }

  deleteTask(id: string): Observable<void> {
    const taskUrl = `${TASKS_API_URL}/${encodeURIComponent(id)}`;
    return this.http.delete<void>(taskUrl).pipe(tap(() => this.reload()));
  }
}