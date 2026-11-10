import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TaskCard } from '../../../tasks/components/task-card/task-card';
import { Task } from '../../../tasks/models/task.model';

import { TaskBoard } from './task-board';

describe('TaskBoard', () => {
  let component: TaskBoard;
  let fixture: ComponentFixture<TaskBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskBoard],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskBoard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('columns', [
      { id: 'todo', title: 'To Do', count: 0, tasks: [] },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('forwards card view, edit, and delete events', () => {
    const task: Task = {
      id: 'task-001',
      title: 'Review release notes',
      description: 'Check the release notes before publication',
      priority: 'medium',
      column: 'todo',
      tag: 'Release',
      assignee: { initials: 'JD', name: 'Jordan Doe' },
      status: { kind: 'due', label: 'Due tomorrow', dueInDays: 1 },
    };
    fixture.componentRef.setInput('columns', [
      { id: 'todo', title: 'To Do', count: 1, tasks: [task] },
    ]);
    fixture.detectChanges();

    const viewTask = vi.fn();
    const editTask = vi.fn();
    const deleteTask = vi.fn();
    component.viewTask.subscribe(viewTask);
    component.editTask.subscribe(editTask);
    component.deleteTask.subscribe(deleteTask);

    const card = fixture.debugElement.query(By.directive(TaskCard)).componentInstance as TaskCard;
    card.viewTask.emit(task);
    card.editTask.emit(task);
    card.deleteTask.emit(task);

    expect(viewTask).toHaveBeenCalledWith(task);
    expect(editTask).toHaveBeenCalledWith(task);
    expect(deleteTask).toHaveBeenCalledWith(task);
  });

  it('emits the selected task from each card menu action', async () => {
    const task: Task = {
      id: 'task-001',
      title: 'Review release notes',
      description: 'Check the release notes before publication',
      priority: 'medium',
      column: 'todo',
      tag: 'Release',
      assignee: { initials: 'JD', name: 'Jordan Doe' },
      status: { kind: 'due', label: 'Due tomorrow', dueInDays: 1 },
    };
    fixture.componentRef.setInput('columns', [
      { id: 'todo', title: 'To Do', count: 1, tasks: [task] },
    ]);
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.directive(TaskCard)).componentInstance as TaskCard;
    const actions = [
      { label: 'View', output: card.viewTask },
      { label: 'Edit', output: card.editTask },
      { label: 'Delete', output: card.deleteTask },
    ];
    const received: Task[] = [];
    for (const action of actions) {
      action.output.subscribe((selectedTask) => received.push(selectedTask));
    }

    for (const action of actions) {
      (fixture.nativeElement as HTMLElement)
        .querySelector<HTMLButtonElement>('.task-card__menu')!
        .click();
      await fixture.whenStable();
      const menuItem = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'))
        .find((button) => button.textContent?.trim() === action.label);
      expect(menuItem).toBeDefined();
      menuItem!.click();
      await fixture.whenStable();
    }

    expect(received).toEqual([task, task, task]);
  });
});
