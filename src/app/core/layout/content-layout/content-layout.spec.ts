import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentLayout } from './content-layout';

describe('ContentLayout', () => {
  let component: ContentLayout;
  let fixture: ComponentFixture<ContentLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
