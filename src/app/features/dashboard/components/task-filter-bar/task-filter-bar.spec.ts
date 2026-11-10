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
    fixture.componentRef.setInput('priorityOptions', [
      { id: 'all', label: 'All priorities' },
      { id: 'high', label: 'High' },
    ]);
    fixture.componentRef.setInput('assigneeOptions', [
      { id: 'user-001', name: 'Jordan Doe', email: 'jordan@example.com' },
    ]);
    fixture.componentRef.setInput('activeFilter', 'all');
    fixture.componentRef.setInput('activePriority', 'all');
    fixture.componentRef.setInput('activeAssignee', 'all');
    fixture.componentRef.setInput('sortBy', 'priority');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits priority and assignee filter changes', () => {
    const priorityChange = vi.fn();
    const assigneeChange = vi.fn();
    component.priorityChange.subscribe(priorityChange);
    component.assigneeChange.subscribe(assigneeChange);
    const compiled = fixture.nativeElement as HTMLElement;
    const prioritySelect = compiled.querySelector<HTMLSelectElement>(
      '[aria-label="Filter by priority"]',
    )!;
    const assigneeSelect = compiled.querySelector<HTMLSelectElement>(
      '[aria-label="Filter by assignee"]',
    )!;

    prioritySelect.value = 'high';
    prioritySelect.dispatchEvent(new Event('change', { bubbles: true }));
    assigneeSelect.value = 'user-001';
    assigneeSelect.dispatchEvent(new Event('change', { bubbles: true }));

    expect(priorityChange).toHaveBeenCalledWith('high');
    expect(assigneeChange).toHaveBeenCalledWith('user-001');
  });
});
