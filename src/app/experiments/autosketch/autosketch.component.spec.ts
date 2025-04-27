import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutoSketchComponent } from './autosketch.component';

describe('AutosketchComponent', () => {
  let component: AutoSketchComponent;
  let fixture: ComponentFixture<AutoSketchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoSketchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoSketchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
