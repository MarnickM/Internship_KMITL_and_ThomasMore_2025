import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TopicDetailComponent } from './topic-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TopicService } from '../../../services/topics/topic-service.service';
import { DrawingService } from '../../../services/drawings/drawing-service.service';
import { LabelService } from '../../../services/labels/label-service.service';
import { UserService } from '../../../services/users/user-service.service';
import { of } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Topic } from '../../../services/topics/topic';
import { Drawing } from '../../../services/drawings/drawing';
import { User } from '../../../services/users/user';

describe('TopicDetailComponent', () => {
  let component: TopicDetailComponent;
  let fixture: ComponentFixture<TopicDetailComponent>;
  let mockActivatedRoute: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTopicService: jasmine.SpyObj<TopicService>;
  let mockDrawingService: jasmine.SpyObj<DrawingService>;
  let mockLabelService: jasmine.SpyObj<LabelService>;
  let mockUserService: jasmine.SpyObj<UserService>;

  const mockTopic: Topic = {
    id: 'topic1',
    name: 'Test Topic',
    creator_email: 'creator@test.com',
    access_user_emails: ['user1@test.com'],
    ui_image: 'test.jpg'
  };

  const mockDrawings: Drawing[] = [
    {
      id: 'drawing1',
      topic_id: 'topic1',
      writer_id: 'user1',
      status: 'unreviewed',
      description: 'Test Drawing 1',
      created_at: new Date(),
      vector: [],
      label_id: ''
    }
  ];

  const mockUsers: User[] = [
    {
      id: 'user1',
      email: 'user1@test.com',
      name: 'User One',
      role_id: 'writer',
      image: 'user1.jpg'
    }
  ];

  const mockLabels = [
    { 
      id: 'label1', 
      name: 'Label One', 
      topic_id: 'topic1'
    }
  ];

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockTopicService = jasmine.createSpyObj('TopicService', ['getTopic', 'updateTopic', 'deleteTopic']);
    mockDrawingService = jasmine.createSpyObj('DrawingService', ['getDrawingsByTopic']);
    mockLabelService = jasmine.createSpyObj('LabelService', ['getLabelsByTopic', 'addLabel', 'deleteLabel']);
    mockUserService = jasmine.createSpyObj('UserService', ['getUsers']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('topic1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [TopicDetailComponent, CommonModule, FormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: TopicService, useValue: mockTopicService },
        { provide: DrawingService, useValue: mockDrawingService },
        { provide: LabelService, useValue: mockLabelService },
        { provide: UserService, useValue: mockUserService },
        DatePipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopicDetailComponent);
    component = fixture.componentInstance;

    // Setup mock responses
    mockTopicService.getTopic.and.returnValue(of(mockTopic));
    mockDrawingService.getDrawingsByTopic.and.returnValue(of(mockDrawings));
    mockUserService.getUsers.and.returnValue(of(mockUsers));
    mockLabelService.getLabelsByTopic.and.returnValue(of(mockLabels));
    mockLabelService.addLabel.and.returnValue(of('new-label-id'));
    mockLabelService.deleteLabel.and.returnValue(of(void 0));
    mockTopicService.updateTopic.and.returnValue(of(void 0));
    mockTopicService.deleteTopic.and.returnValue(of(void 0));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load topic and related data on init', fakeAsync(() => {
    // Reset mocks with complete data
    mockLabelService.getLabelsByTopic = jasmine.createSpy().and.returnValue(of([{
      id: 'label1',
      name: 'Label One',
      topic_id: 'topic1'
    }]));
  
    component.ngOnInit();
    tick();
  
    expect(component.topic).toEqual(mockTopic);
    expect(component.drawings).toEqual(mockDrawings);
    expect(component.labels).toEqual([{
      id: 'label1',
      name: 'Label One'
    }]);
    expect(component.loading).toBeFalse();
  }));

  it('should filter drawings correctly', () => {
    component.drawings = mockDrawings;
    
    // Test description filter
    component.filters.description = 'Test';
    expect(component.filteredDrawings.length).toBe(1);
    
    component.filters.description = 'Nonexistent';
    expect(component.filteredDrawings.length).toBe(0);
    
    // Test writer filter
    component.filters.description = '';
    component.filters.writer = 'user1';
    expect(component.filteredDrawings.length).toBe(1);
    
    component.filters.writer = 'user2';
    expect(component.filteredDrawings.length).toBe(0);
    
    // Test status filter
    component.filters.writer = '';
    component.filters.status = 'unreviewed';
    expect(component.filteredDrawings.length).toBe(1);
    
    component.filters.status = 'reviewed';
    expect(component.filteredDrawings.length).toBe(0);
  });

  it('should toggle edit mode', () => {
    component.topic = mockTopic;
    component.toggleEditMode();
    expect(component.editMode).toBeTrue();
    expect(component.editForm.name).toBe(mockTopic.name);
    
    component.toggleEditMode();
    expect(component.editMode).toBeFalse();
  });

  it('should add and remove labels', fakeAsync(() => {
    component.topic = mockTopic;
    component.newLabelName = 'New Label';
    
    component.addLabel();
    tick();
    
    expect(mockLabelService.addLabel).toHaveBeenCalled();
    expect(component.labels.length).toBe(2);
    expect(component.newLabelName).toBe('');
    
    component.removeLabel('label1');
    tick();
    
    expect(mockLabelService.deleteLabel).toHaveBeenCalledWith('label1');
    expect(component.labels.length).toBe(1);
  }));

  it('should manage access users', () => {
    component.editForm.access_user_emails = ['user1@test.com'];
    component.selectedUserEmail = 'user2@test.com';
    
    component.addAccessUser();
    expect(component.editForm.access_user_emails).toEqual(['user1@test.com', 'user2@test.com']);
    expect(component.selectedUserEmail).toBe('');
    
    component.removeAccessUser('user1@test.com');
    expect(component.editForm.access_user_emails).toEqual(['user2@test.com']);
  });

  it('should save changes', fakeAsync(() => {
    component.topic = mockTopic;
    component.editMode = true;
    component.editForm.name = 'Updated Topic';
    
    component.saveChanges();
    tick();
    
    expect(mockTopicService.updateTopic).toHaveBeenCalled();
    expect(component.editMode).toBeFalse();
  }));

  it('should delete topic', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.topic = mockTopic;
    
    component.deleteTopic();
    tick();
    
    expect(mockTopicService.deleteTopic).toHaveBeenCalledWith('topic1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should get writer name', () => {
    expect(component.getWriterName('user1')).toBe('User One');
    expect(component.getWriterName('unknown')).toBe('Unknown');
  });

  it('should view drawing', fakeAsync(() => {
    // Create a fresh test drawing with required properties
    const testDrawing: Drawing = {
      ...mockDrawings[0],
      label_id: 'label1',
      topic_id: 'topic1'
    };
  
    // Reset and setup fresh mocks
    mockTopicService.getTopic = jasmine.createSpy().and.returnValue(of(mockTopic));
    mockLabelService.getLabel = jasmine.createSpy().and.returnValue(of(mockLabels[0]));
  
    component.viewDrawing(testDrawing);
    tick();
  
    expect(mockTopicService.getTopic).toHaveBeenCalledWith('topic1');
    expect(mockLabelService.getLabel).toHaveBeenCalledWith('label1');
    expect(mockRouter.navigate).toHaveBeenCalled();
  }));
});