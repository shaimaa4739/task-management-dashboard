import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { CreateTaskDto, TaskDto } from '../models/task-api.model';
import { TASKS_API_URL } from './task-api.config';
import { TaskService } from './task.service';

const task: TaskDto = {
  id: 'task-001',
  title: 'Design new homepage layout',
  description: 'Create wireframes and mockups',
  status: 'todo',
  priority: 'high',
  dueDate: '2026-11-12',
  assignee: {
    id: 'user-001',
    name: 'John Doe',
    avatar: 'JD',
    email: 'john.doe@company.com',
  },
  tags: ['Design'],
  createdAt: '2026-11-08T10:53:09.942Z',
  updatedAt: '2026-11-10T10:53:09.942Z',
};

const createTask: CreateTaskDto = {
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  dueDate: task.dueDate,
  assignee: task.assignee,
  tags: task.tags,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
};

describe('TaskService', () => {
  let service: TaskService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), TaskService],
    });

    service = TestBed.inject(TaskService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  async function flushInitialTasks(): Promise<void> {
    TestBed.tick();
    const request = httpTesting.expectOne(TASKS_API_URL);
    expect(request.request.method).toBe('GET');
    request.flush([task]);
    await TestBed.inject(ApplicationRef).whenStable();
  }

  async function flushMutationRefresh(): Promise<void> {
    TestBed.tick();
    const request = httpTesting.expectOne(TASKS_API_URL);
    expect(request.request.method).toBe('GET');
    request.flush([task]);
    await TestBed.inject(ApplicationRef).whenStable();
  }

  it('loads tasks from the API as a TaskDto array', async () => {
    await flushInitialTasks();

    expect(service.tasks()).toEqual([task]);
  });

  it('exposes loading state while the collection request is pending', async () => {
    TestBed.tick();
    const request = httpTesting.expectOne(TASKS_API_URL);

    expect(service.isLoading()).toBe(true);
    request.flush([task]);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(service.isLoading()).toBe(false);
  });

  it('exposes GET failures and can reload the resource', async () => {
    TestBed.tick();
    const failedRequest = httpTesting.expectOne(TASKS_API_URL);
    failedRequest.flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(service.error()).toBeInstanceOf(HttpErrorResponse);
    expect(service.reload()).toBe(true);

    TestBed.tick();
    const retryRequest = httpTesting.expectOne(TASKS_API_URL);
    expect(retryRequest.request.method).toBe('GET');
    retryRequest.flush([task]);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(service.tasks()).toEqual([task]);
    expect(service.error()).toBeUndefined();
  });

  it('POSTs a task and reloads the collection after success', async () => {
    await flushInitialTasks();
    let response: TaskDto | undefined;

    service.createTask(createTask).subscribe((createdTask) => (response = createdTask));
    const request = httpTesting.expectOne(TASKS_API_URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(createTask);
    request.flush(task);
    await flushMutationRefresh();

    expect(response).toEqual(task);
  });

  it('PATCHes a task by ID and reloads the collection after success', async () => {
    await flushInitialTasks();
    const changes = { title: 'Updated title' };
    let response: TaskDto | undefined;

    service.updateTask(task.id, changes).subscribe((updatedTask) => (response = updatedTask));
    const request = httpTesting.expectOne(`${TASKS_API_URL}/${task.id}`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(changes);
    request.flush({ ...task, ...changes });
    await flushMutationRefresh();

    expect(response?.title).toBe(changes.title);
  });

  it('DELETEs a task by ID and reloads the collection after success', async () => {
    await flushInitialTasks();

    service.deleteTask(task.id).subscribe();
    const request = httpTesting.expectOne(`${TASKS_API_URL}/${task.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(task);
    await flushMutationRefresh();
  });

  it('propagates POST, PATCH, and DELETE failures to callers', async () => {
    await flushInitialTasks();
    const mutationCases: { url: string; method: string; send: () => Observable<unknown> }[] = [
      { url: TASKS_API_URL, method: 'POST', send: () => service.createTask(createTask) },
      {
        url: `${TASKS_API_URL}/${task.id}`,
        method: 'PATCH',
        send: () => service.updateTask(task.id, { title: 'Updated title' }),
      },
      { url: `${TASKS_API_URL}/${task.id}`, method: 'DELETE', send: () => service.deleteTask(task.id) },
    ];

    for (const mutation of mutationCases) {
      let actualError: unknown;
      mutation.send().subscribe({ error: (error: unknown) => (actualError = error) });
      const request = httpTesting.expectOne(mutation.url);
      expect(request.request.method).toBe(mutation.method);
      request.flush({ message: 'Mutation failed' }, { status: 500, statusText: 'Server Error' });

      expect(actualError).toBeInstanceOf(HttpErrorResponse);
    }
  });
});