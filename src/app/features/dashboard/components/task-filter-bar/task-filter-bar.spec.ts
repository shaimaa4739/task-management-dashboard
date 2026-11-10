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
    fixture.componentRef.setInput('filters', [{ id: 'all', label: 'All' }]);
    fixture.componentRef.setInput('activeFilter', 'all');
    fixture.componentRef.setInput('sortBy', 'priority');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
