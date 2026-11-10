import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsSummary } from './stats-summary';

describe('StatsSummary', () => {
  let component: StatsSummary;
  let fixture: ComponentFixture<StatsSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsSummary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
