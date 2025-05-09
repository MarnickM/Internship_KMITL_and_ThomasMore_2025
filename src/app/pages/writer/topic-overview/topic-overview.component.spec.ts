import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TopicOverviewComponent } from './topic-overview.component';
import { TopicService } from '../../../services/topics/topic-service.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Topic } from '../../../services/topics/topic';
import { AuthService } from '../../../services/auth.service';
import { DrawingService } from '../../../services/drawings/drawing-service.service';
import { UserService } from '../../../services/users/user-service.service';
import { LabelService } from '../../../services/labels/label-service.service';
import { CommonModule } from '@angular/common';

describe('TopicOverviewComponent', () => {
  let component: TopicOverviewComponent;
  let fixture: ComponentFixture<TopicOverviewComponent>;
  let mockTopicService: jasmine.SpyObj<TopicService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDrawingService: jasmine.SpyObj<DrawingService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockLabelService: jasmine.SpyObj<LabelService>;

  const mockTopics: Topic[] = [
    {
      id: 'topic1', name: 'Test Topic 1', creator_email: 'creator1@example.com', 
      access_user_emails: ['example@example.com'], ui_image: ''
    },
    {
      id: 'topic2', name: 'Test Topic 2', creator_email: 'creator2@example.com', 
      access_user_emails: ['example@example.com'], ui_image: ''
    }
  ];

  const mockUser = { email: 'example@example.com' };

  beforeEach(async () => {
    mockTopicService = jasmine.createSpyObj('TopicService', ['getTopics', 'getTopic']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUser']);
    mockDrawingService = jasmine.createSpyObj('DrawingService', ['getDrawingsByWriter']);
    mockUserService = jasmine.createSpyObj('UserService', ['getUserByEmail']);
    mockLabelService = jasmine.createSpyObj('LabelService', ['getLabel']);

    await TestBed.configureTestingModule({
      imports: [TopicOverviewComponent, CommonModule],
      providers: [
        { provide: TopicService, useValue: mockTopicService },
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: DrawingService, useValue: mockDrawingService },
        { provide: UserService, useValue: mockUserService },
        { provide: LabelService, useValue: mockLabelService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopicOverviewComponent);
    component = fixture.componentInstance;

    mockTopicService.getTopics.and.returnValue(of(mockTopics));
    mockAuthService.getUser.and.returnValue(mockUser);
    mockUserService.getUserByEmail.and.returnValue(of({ id: 'user1', name: 'user1', email: '', role_id: '', image: '' }));
    mockDrawingService.getDrawingsByWriter.and.returnValue(of([]));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load topics on initialization', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(mockTopicService.getTopics).toHaveBeenCalled();
    expect(component.topics).toEqual(mockTopics.filter(t => t.access_user_emails.includes('example@example.com')));
  }));

  it('should navigate to drawing page with topic parameters', () => {
    const testTopic = mockTopics[0];
    component.navigateToDrawing(testTopic);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/drawing'], {
      queryParams: { id: testTopic.id, name: testTopic.name }
    });
  });

  it('should filter topics based on user email', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(component.topics?.length).toBe(2);
    expect(component.topics).toEqual(mockTopics);
  }));

  it('should handle pagination correctly', () => {
    component.topics = mockTopics;
    component.topicsPerPage = 1;

    expect(component.paginatedTopics.length).toBe(1);
    expect(component.paginatedTopics[0]).toEqual(mockTopics[0]);
    expect(component.totalTopicPages).toBe(2);

    component.nextTopicPage();
    expect(component.paginatedTopics[0]).toEqual(mockTopics[1]);

    component.prevTopicPage();
    expect(component.paginatedTopics[0]).toEqual(mockTopics[0]);

    component.setTopicPage(1);
    expect(component.paginatedTopics[0]).toEqual(mockTopics[1]);
  });
});