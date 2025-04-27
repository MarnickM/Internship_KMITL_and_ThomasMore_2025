import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SketchGeneratorComponent } from './sketch-generator.component';

describe('SketchGeneratorComponent', () => {
  let component: SketchGeneratorComponent;
  let fixture: ComponentFixture<SketchGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SketchGeneratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SketchGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
