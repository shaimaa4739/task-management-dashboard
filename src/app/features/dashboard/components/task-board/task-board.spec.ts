import { ComponentFixture, TestBed } from '@angular/core/testing';

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
});
