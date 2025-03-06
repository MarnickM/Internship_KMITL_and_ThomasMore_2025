import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionsOverviewComponent } from './submissions-overview.component';

describe('SubmissionsOverviewComponent', () => {
  let component: SubmissionsOverviewComponent;
  let fixture: ComponentFixture<SubmissionsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionsOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmissionsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
