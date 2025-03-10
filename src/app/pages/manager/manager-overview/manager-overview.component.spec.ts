import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerOverviewComponent } from './manager-overview.component';

describe('ManagerOverviewComponent', () => {
  let component: ManagerOverviewComponent;
  let fixture: ComponentFixture<ManagerOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
