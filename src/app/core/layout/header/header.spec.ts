import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskSearchService } from '../../services/task-search.service';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates and clears the shared task search query as the user types', () => {
    fixture.detectChanges();
    const searchInput = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'input[aria-label="Search tasks"]',
    );
    const searchService = TestBed.inject(TaskSearchService);

    expect(searchInput).not.toBeNull();
    searchInput!.value = 'Dashboard';
    searchInput!.dispatchEvent(new Event('input', { bubbles: true }));
    expect(searchService.query()).toBe('Dashboard');

    searchInput!.value = '';
    searchInput!.dispatchEvent(new Event('input', { bubbles: true }));
    expect(searchService.query()).toBe('');
  });
});
