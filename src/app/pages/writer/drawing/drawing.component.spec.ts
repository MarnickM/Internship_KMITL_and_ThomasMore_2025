import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { DrawingComponent } from './drawing.component';
import { DrawingService } from '../../../services/drawings/drawing-service.service';
import { ActivatedRoute } from '@angular/router';
import { LabelService } from '../../../services/labels/label-service.service';
import { UserService } from '../../../services/users/user-service.service';
import { AuthService } from '../../../services/auth.service';
import { Firestore } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';

describe('DrawingComponent', () => {
  let component: DrawingComponent;
  let fixture: ComponentFixture<DrawingComponent>;
  let mockDrawingService: jasmine.SpyObj<DrawingService>;
  let mockLabelService: jasmine.SpyObj<LabelService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockDrawingService = jasmine.createSpyObj('DrawingService', [
      'addDrawing', 
      'updateDrawing', 
      'getDrawingById',
      'getDrawing'
    ]);
    
    mockLabelService = jasmine.createSpyObj('LabelService', ['getLabelsByTopic']);
    mockUserService = jasmine.createSpyObj('UserService', ['getUserByEmail']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUser']);

    await TestBed.configureTestingModule({
      imports: [DrawingComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              id: 'test-drawing-id',
              topic_id: 'test-topic-id',
              description: 'test description',
              topic: 'test topic',
              label: 'test label',
              vector: JSON.stringify([{x: 10, y: 10}]),
              name: undefined
            }),
            snapshot: {
              queryParams: {
                name: undefined
              }
            }
          }
        },
        {
          provide: DrawingService,
          useValue: mockDrawingService
        },
        {
          provide: LabelService,
          useValue: mockLabelService
        },
        {
          provide: UserService,
          useValue: mockUserService
        },
        {
          provide: AuthService,
          useValue: mockAuthService
        },
        {
          provide: Firestore,
          useValue: {
            collection: jasmine.createSpy('collection').and.returnValue({
              doc: jasmine.createSpy('doc').and.returnValue({
                set: jasmine.createSpy('set'),
                update: jasmine.createSpy('update'),
                get: jasmine.createSpy('get').and.returnValue(of({})),
                valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of({}))
              })
            })
          }
        }
      ]
    }).compileComponents();

    mockLabelService.getLabelsByTopic.and.returnValue(of([
      { id: 'label1', name: 'Label 1', topic_id: 'test-topic-id' },
      { id: 'label2', name: 'Label 2', topic_id: 'test-topic-id' }
    ]));

    mockAuthService.getUser.and.returnValue({ email: 'test@example.com' });
    mockUserService.getUserByEmail.and.returnValue(of({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role_id: 'test-role-id',
      image: 'test-image-url'
    }));

    mockDrawingService.addDrawing.and.returnValue(of('new-drawing-id'));
    mockDrawingService.updateDrawing.and.returnValue(of(void 0));
    
    mockDrawingService.getDrawing.and.returnValue(of({
      id: 'test-drawing-id',
      writer_id: 'test-user-id',
      label_id: 'label1',
      topic_id: 'test-topic-id',
      vector: [{x: 10, y: 10}],
      description: 'test description',
      status: 'unreviewed',
      created_at: new Date()
    }));

    fixture = TestBed.createComponent(DrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with drawing data when coming from submissions overview', () => {
    expect(component.updateDrawing).toBeTrue();
    expect(component.drawingID).toBe('test-drawing-id');
    expect(component.topic.id).toBe('test-topic-id');
    expect(component.description).toBe('test description');
    expect(component.selectedOption).toBe('test label');
    expect(component.coordinates).toEqual([{x: 10, y: 10}]);
  });

  it('should load labels for the topic', fakeAsync(() => {
    tick();
    expect(mockLabelService.getLabelsByTopic).toHaveBeenCalledWith('test-topic-id');
    expect(component.dropdownOptions).toEqual(['Label 1', 'Label 2']);
    expect(component.label_id_pairs).toEqual({
      'Label 1': 'label1',
      'Label 2': 'label2'
    });
  }));

  it('should call addDrawing when updateDrawing is false', fakeAsync(async () => {
    component.updateDrawing = false;
    component.selectedOption = 'Label 1';
    component.description = 'Test description';
    
    await component.submitDrawing();
    expect(component.success).toBeTrue();
    
    tick(3000);
        
    expect(component.success).toBeFalse();
        
    expect(mockDrawingService.addDrawing).toHaveBeenCalled();
  }));

  it('should call updateDrawing when updateDrawing is true', fakeAsync(async () => {
    component.updateDrawing = true;
    component.selectedOption = 'Label 1';
    component.description = 'Test description';
    
    await component.submitDrawing();
    expect(component.success).toBeTrue();
    
    tick(3000);
        
    expect(component.success).toBeFalse();
        
    expect(mockDrawingService.updateDrawing).toHaveBeenCalled();
  }));

  it('should show error when label is missing', fakeAsync(async () => {
    component.updateDrawing = false;
    component.selectedOption = '';
    
    await component.submitDrawing();
    expect(component.error).toBeTrue();
    
    tick(3000);
        
    expect(component.error).toBeFalse();
        
    expect(mockDrawingService.addDrawing).not.toHaveBeenCalled();
  }));
});