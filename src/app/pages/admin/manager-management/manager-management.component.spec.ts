import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerManagementComponent } from './manager-management.component';

describe('ManagerManagementComponent', () => {
  let component: ManagerManagementComponent;
  let fixture: ComponentFixture<ManagerManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
