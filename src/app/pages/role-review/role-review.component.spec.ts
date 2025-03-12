import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleReviewComponent } from './role-review.component';

describe('RoleReviewComponent', () => {
  let component: RoleReviewComponent;
  let fixture: ComponentFixture<RoleReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
