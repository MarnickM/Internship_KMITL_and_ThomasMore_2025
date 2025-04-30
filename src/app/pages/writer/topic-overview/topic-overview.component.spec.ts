import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TopicOverviewComponent } from './topic-overview.component';
import { TopicService } from '../../../services/topics/topic-service.service';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../components/button/button.component';
import { of } from 'rxjs';
import { Topic } from '../../../services/topics/topic';

describe('TopicOverviewComponent', () => {
  let component: TopicOverviewComponent;
  let fixture: ComponentFixture<TopicOverviewComponent>;
  let mockTopicService: jasmine.SpyObj<TopicService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockTopics: Topic[] = [
    { id: 'topic1', name: 'Test Topic 1', creator_email: 'creator1@example.com', access_user_emails: ['example@example.com'] },
    { id: 'topic2', name: 'Test Topic 2', creator_email: 'creator2@example.com', access_user_emails: ['example@example.com'] }
  ];

  beforeEach(async () => {
    // Create spy objects for services
    mockTopicService = jasmine.createSpyObj('TopicService', ['getTopics']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TopicOverviewComponent, ButtonComponent],
      providers: [
        { provide: TopicService, useValue: mockTopicService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopicOverviewComponent);
    component = fixture.componentInstance;

    // Setup mock responses
    mockTopicService.getTopics.and.returnValue(of(mockTopics));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load topics on initialization', fakeAsync(() => {
    // Trigger ngOnInit
    fixture.detectChanges();
    tick();

    expect(mockTopicService.getTopics).toHaveBeenCalled();
    expect(component.topics).toEqual(mockTopics);
  }));

  it('should navigate to drawing page with topic parameters', () => {
    const testTopic = mockTopics[0];
    component.navigateToDrawing(testTopic);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/drawing'], {
      queryParams: { id: testTopic.id, name: testTopic.name }
    });
  });

  it('should display topics in the template', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const topicElements = compiled.querySelectorAll('.topic-item');

    expect(topicElements.length).toBe(mockTopics.length);
    expect(topicElements[0].textContent).toContain(mockTopics[0].name);
    expect(topicElements[1].textContent).toContain(mockTopics[1].name);
  }));
});