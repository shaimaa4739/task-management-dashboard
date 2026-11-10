import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskFilterBar } from './task-filter-bar';

describe('TaskFilterBar', () => {
  let component: TaskFilterBar;
  let fixture: ComponentFixture<TaskFilterBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFilterBar],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFilterBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
