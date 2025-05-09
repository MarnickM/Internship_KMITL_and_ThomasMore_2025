import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ManagerOverviewComponent } from './manager-overview.component';
import { TopicService } from '../../../services/topics/topic-service.service';
import { DrawingService } from '../../../services/drawings/drawing-service.service';
import { AuthService } from '../../../services/auth.service';
import { LabelService } from '../../../services/labels/label-service.service';
import { UserService } from '../../../services/users/user-service.service';
import { Topic } from '../../../services/topics/topic';
import { Drawing } from '../../../services/drawings/drawing';
import { User } from '../../../services/users/user';

describe('ManagerOverviewComponent', () => {
  let component: ManagerOverviewComponent;
  let fixture: ComponentFixture<ManagerOverviewComponent>;
  let mockTopicService: jasmine.SpyObj<TopicService>;
  let mockDrawingService: jasmine.SpyObj<DrawingService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockLabelService: jasmine.SpyObj<LabelService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUser: User = {
    email: 'test@example.com', 
    name: 'Test User',
    role_id: '',
    image: ''
  };

  const mockTopics: Topic[] = [
    {
      id: '1', 
      name: 'Topic 1', 
      creator_email: 'test@example.com', 
      access_user_emails: [],
      ui_image: ''
    },
    {
      id: '2', 
      name: 'Topic 2', 
      creator_email: 'test@example.com', 
      access_user_emails: [],
      ui_image: ''
    }
  ];

  const mockDrawings: Drawing[] = [
    {
      id: '1', 
      topic_id: '1', 
      status: 'unreviewed',
      writer_id: '',
      label_id: '',
      vector: [],
      description: '',
      created_at: new Date(),
    },
    {
      id: '2', 
      topic_id: '1', 
      status: 'approved',
      writer_id: '',
      label_id: '',
      vector: [],
      description: '',
      created_at: new Date(),
    }
  ];

  const mockUsers: User[] = [
    {
      email: 'user1@example.com', 
      name: 'User 1',
      role_id: '',
      image: ''
    },
    {
      email: 'user2@example.com', 
      name: 'User 2',
      role_id: '',
      image: ''
    }
  ];

  beforeEach(async () => {
    mockTopicService = jasmine.createSpyObj('TopicService', ['getTopicsByCreatorEmail', 'addTopic']);
    mockDrawingService = jasmine.createSpyObj('DrawingService', ['getDrawings']);
    mockAuthService = jasmine.createSpyObj('AuthService', [], { user$: of(mockUser) });
    mockLabelService = jasmine.createSpyObj('LabelService', ['addLabel']);
    mockUserService = jasmine.createSpyObj('UserService', ['getUsers']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ManagerOverviewComponent, FormsModule],
      providers: [
        { provide: TopicService, useValue: mockTopicService },
        { provide: DrawingService, useValue: mockDrawingService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: LabelService, useValue: mockLabelService },
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ManagerOverviewComponent);
    component = fixture.componentInstance;
  });

  function initializeComponent() {
    mockTopicService.getTopicsByCreatorEmail.and.returnValue(of([...mockTopics]));
    mockDrawingService.getDrawings.and.returnValue(of([...mockDrawings]));
    mockUserService.getUsers.and.returnValue(of([...mockUsers]));
    mockTopicService.addTopic.and.returnValue(of('new-topic-id'));
    mockLabelService.addLabel.and.returnValue(of('label-id'));

    fixture.detectChanges();
  }

  it('should create', () => {
    initializeComponent();
    expect(component).toBeTruthy();
  });

  it('should initialize with user data', () => {
    initializeComponent();
    expect(component.userEmail).toBe('test@example.com');
    expect(mockTopicService.getTopicsByCreatorEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should load topics and drawings on init', () => {
    initializeComponent();
    expect(component.drawingsByTopic['1'].length).toBe(2);
  });

  it('should load users on init', () => {
    initializeComponent();
    expect(component.users.length).toBe(2);
  });

  it('should filter topics by search text', () => {
    initializeComponent();
    component.searchText = 'Topic 1';
    const filtered = component.filteredTopics();
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Topic 1');
  });

  it('should sort topics alphabetically', () => {
    initializeComponent();
    component.sortOption = 'alphabetical';
    const filtered = component.filteredTopics();
    expect(filtered[0].name).toBe('Topic 1');
    expect(filtered[1].name).toBe('Topic 2');
  });

  it('should sort by total drawings', () => {
    initializeComponent();
    component.sortOption = 'total';
    const filtered = component.filteredTopics();
    expect(filtered[0].id).toBe('1');
    expect(filtered[1].id).toBe('2');
  });

  it('should sort by unreviewed drawings', () => {
    initializeComponent();
    component.sortOption = 'unreviewed';
    const filtered = component.filteredTopics();
    expect(filtered[0].id).toBe('1');
    expect(filtered[1].id).toBe('2');
  });

  it('should return correct drawing count', () => {
    initializeComponent();
    expect(component.getDrawingCount('1')).toBe(2);
    expect(component.getDrawingCount('2')).toBe(0);
  });

  it('should return correct unreviewed drawing count', () => {
    initializeComponent();
    expect(component.getUnreviewedDrawingCount('1')).toBe(1);
    expect(component.getUnreviewedDrawingCount('2')).toBe(0);
  });

  it('should add label to temp list', () => {
    initializeComponent();
    component.newLabelInput = 'New Label';
    component.addLabelToTempList();
    expect(component.tempLabels.length).toBe(1);
    expect(component.tempLabels[0].name).toBe('New Label');
    expect(component.newLabelInput).toBe('');
  });

  it('should not add empty label', () => {
    initializeComponent();
    component.newLabelInput = '   ';
    component.addLabelToTempList();
    expect(component.tempLabels.length).toBe(0);
  });

  it('should remove label from temp list', () => {
    initializeComponent();
    component.tempLabels = [{ name: 'Label 1' }, { name: 'Label 2' }];
    component.removeLabelFromTempList(0);
    expect(component.tempLabels.length).toBe(1);
    expect(component.tempLabels[0].name).toBe('Label 2');
  });

  it('should add access email', () => {
    initializeComponent();
    component.selectedEmail = 'new@example.com';
    component.addAccessEmail();
    expect(component.topicForm.access_user_emails).toContain('new@example.com');
    expect(component.selectedEmail).toBe('');
  });

  it('should not add duplicate access email', () => {
    initializeComponent();
    component.topicForm.access_user_emails = ['existing@example.com'];
    component.selectedEmail = 'existing@example.com';
    component.addAccessEmail();
    expect(component.topicForm.access_user_emails.length).toBe(1);
  });

  it('should remove access email', () => {
    initializeComponent();
    component.topicForm.access_user_emails = ['one@example.com', 'two@example.com'];
    component.removeAccessEmail('one@example.com');
    expect(component.topicForm.access_user_emails).toEqual(['two@example.com']);
  });

  it('should reset form when canceling add topic', () => {
    initializeComponent();
    component.addTopic = true;
    component.topicForm.name = 'Test';
    component.tempLabels = [{ name: 'Label' }];
    component.selectedEmail = 'test@example.com';
    
    component.cancelAddTopic();
    
    expect(component.addTopic).toBeFalse();
    expect(component.topicForm.name).toBe('');
    expect(component.tempLabels.length).toBe(0);
    expect(component.selectedEmail).toBe('');
  });

  it('should add topic to database', () => {
    initializeComponent();
    component.userEmail = 'test@example.com';
    component.topicForm.name = 'New Topic';
    component.tempLabels = [{ name: 'Label 1' }];
    
    component.addTopicToDb();
    
    expect(mockTopicService.addTopic).toHaveBeenCalled();
    expect(component.topics.length).toBe(3);
    expect(mockLabelService.addLabel).toHaveBeenCalledWith({
      topic_id: 'new-topic-id',
      name: 'Label 1'
    });
  });

  it('should not add topic with empty name', () => {
    initializeComponent();
    component.userEmail = 'test@example.com';
    component.topicForm.name = '   ';
    
    component.addTopicToDb();
    
    expect(mockTopicService.addTopic).not.toHaveBeenCalled();
  });

  it('should add topic with default image when none provided', () => {
    initializeComponent();
    component.userEmail = 'test@example.com';
    component.topicForm.name = 'New Topic';
    component.topicForm.ui_image = '';
    
    component.addTopicToDb();
    
    expect(mockTopicService.addTopic).toHaveBeenCalledWith(jasmine.objectContaining({
      ui_image: 'https://images.pexels.com/photos/1526/dark-blur-blurred-gradient.jpg'
    }));
  });

  it('should navigate to topic overview', () => {
    initializeComponent();
    component.navigateToTopicOverview('123');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/topic-detail', '123']);
  });
});