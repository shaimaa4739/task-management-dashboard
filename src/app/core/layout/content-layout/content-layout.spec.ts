import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppContentLayout } from './content-layout';

describe('AppContentLayout', () => {
  let component: AppContentLayout;
  let fixture: ComponentFixture<AppContentLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppContentLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(AppContentLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
