import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WriterManagementComponent } from './writer-management.component';

describe('WriterManagementComponent', () => {
  let component: WriterManagementComponent;
  let fixture: ComponentFixture<WriterManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WriterManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WriterManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
