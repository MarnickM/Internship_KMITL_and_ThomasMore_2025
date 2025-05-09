import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SubmissionsOverviewComponent } from './submissions-overview.component';
import { DrawingService } from '../../../services/drawings/drawing-service.service';
import { TopicService } from '../../../services/topics/topic-service.service';
import { Router } from '@angular/router';
import { LabelService } from '../../../services/labels/label-service.service';
import { UserService } from '../../../services/users/user-service.service';
import { AuthService } from '../../../services/auth.service';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('SubmissionsOverviewComponent', () => {
  let component: SubmissionsOverviewComponent;
  let fixture: ComponentFixture<SubmissionsOverviewComponent>;
  let mockDrawingService: jasmine.SpyObj<DrawingService>;
  let mockTopicService: jasmine.SpyObj<TopicService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLabelService: jasmine.SpyObj<LabelService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    role_id: 'role1',
    image: 'image.jpg'
  };

  const mockDrawings = [
    {
      id: 'drawing1',
      writer_id: 'user123',
      label_id: 'label1',
      topic_id: 'topic1',
      vector: [{x: 10, y: 10}],
      description: 'Test drawing',
      created_at: new Date(),
      status: 'unreviewed'
    },
    {
      id: 'drawing2',
      writer_id: 'user123',
      label_id: 'label2',
      topic_id: 'topic2',
      vector: [{x: 20, y: 20}],
      description: 'Another drawing',
      created_at: new Date(),
      status: 'unreviewed'
    }
  ];

  const mockTopics = [
    {
      id: 'topic1',
      name: 'Test Topic 1',
      creator_email: 'creator@example.com',
      access_user_emails: ['test@example.com'],
      ui_image: ''
    },
    {
      id: 'topic2',
      name: 'Test Topic 2',
      creator_email: 'creator@example.com',
      access_user_emails: ['other@example.com'],
      ui_image: ''
    }
  ];

  const mockTopic = {
    id: 'topic1',
    name: 'Test Topic',
    creator_email: 'creator@example.com',
    access_user_emails: [''],
    ui_image: ''
  };

  const mockLabel = {
    id: 'label1',
    name: 'Test Label',
    topic_id: 'topic1'
  };

  beforeEach(async () => {
    mockDrawingService = jasmine.createSpyObj('DrawingService', ['getDrawingsByWriter', 'deleteDrawing']);
    mockTopicService = jasmine.createSpyObj('TopicService', ['getTopic', 'getTopics']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockLabelService = jasmine.createSpyObj('LabelService', ['getLabel']);
    mockUserService = jasmine.createSpyObj('UserService', ['getUserByEmail']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUser']);

    await TestBed.configureTestingModule({
      imports: [SubmissionsOverviewComponent, CommonModule],
      providers: [
        { provide: DrawingService, useValue: mockDrawingService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: Router, useValue: mockRouter },
        { provide: LabelService, useValue: mockLabelService },
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmissionsOverviewComponent);
    component = fixture.componentInstance;

    mockAuthService.getUser.and.returnValue({ email: 'test@example.com' });
    mockUserService.getUserByEmail.and.returnValue(of(mockUser));
    mockDrawingService.getDrawingsByWriter.and.returnValue(of(mockDrawings));
    mockTopicService.getTopic.and.returnValue(of(mockTopic));
    mockLabelService.getLabel.and.returnValue(of(mockLabel));
    
    mockTopicService.getTopics.and.returnValue(of(mockTopics));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load topics on initialization', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(mockTopicService.getTopics).toHaveBeenCalled();
    expect(component.topics).toEqual([mockTopics[0]]);
    expect(component.topicIdToName).toEqual({
      'topic1': 'Test Topic 1'
    });
  }));

  it('should load user drawings on initialization', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(mockAuthService.getUser).toHaveBeenCalled();
    expect(mockUserService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockDrawingService.getDrawingsByWriter).toHaveBeenCalledWith('user123');
    expect(component.drawings).toEqual(mockDrawings);
  }));

  it('should paginate drawings correctly', () => {
    component.drawings = mockDrawings;
    component.itemsPerPage = 1;

    component.currentPage = 1;
    expect(component.paginatedDrawings).toEqual([mockDrawings[0]]);
    expect(component.totalPages).toBe(2);

    component.currentPage = 2;
    expect(component.paginatedDrawings).toEqual([mockDrawings[1]]);
  });

  it('should navigate to next and previous pages', () => {
    component.drawings = mockDrawings;
    component.itemsPerPage = 1;

    expect(component.currentPage).toBe(1);

    component.nextPage();
    expect(component.currentPage).toBe(2);

    component.prevPage();
    expect(component.currentPage).toBe(1);

    component.prevPage();
    expect(component.currentPage).toBe(1);

    component.currentPage = 2;
    component.nextPage();
    expect(component.currentPage).toBe(2);
  });

  it('should view drawing with correct parameters', fakeAsync(() => {
    const drawing = mockDrawings[0];
    component.viewDrawing(drawing);
    tick();

    expect(mockTopicService.getTopic).toHaveBeenCalledWith('topic1');
    expect(mockLabelService.getLabel).toHaveBeenCalledWith('label1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/drawing'], {
      queryParams: {
        id: 'drawing1',
        topic_id: 'topic1',
        description: 'Test drawing',
        topic: 'Test Topic',
        vector: JSON.stringify([{x: 10, y: 10}]),
        label: 'Test Label',
        editable: false
      }
    });
  }));

  it('should delete a drawing', fakeAsync(() => {
    const drawingId = 'drawing1';
    mockDrawingService.deleteDrawing.and.returnValue(of(undefined));

    component.drawings = [...mockDrawings];
    component.deleteDrawing(drawingId);
    tick();

    expect(mockDrawingService.deleteDrawing).toHaveBeenCalledWith(drawingId);
    expect(component.drawings?.length).toBe(1);
    expect(component.drawings?.find(d => d.id === drawingId)).toBeUndefined();
  }));
});