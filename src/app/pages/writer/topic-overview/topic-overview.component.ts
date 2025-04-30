import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from "../../../components/button/button.component";
import { TopicService } from "../../../services/topics/topic-service.service";
import { Topic } from '../../../services/topics/topic';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-topic-overview',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './topic-overview.component.html',
  styleUrl: './topic-overview.component.css'
})
export class TopicOverviewComponent implements OnInit {

  topics: Topic[] | undefined;
  userEmail: string | undefined;

  constructor(
    private topicService: TopicService,
    private router: Router,
    private authService: AuthService // Inject AuthService
  ) { }

  ngOnInit() {
    // Get the logged-in user's email from the AuthService
    this.userEmail = this.authService.getUser()?.email;

    // Retrieve the topics
    this.topicService.getTopics().subscribe(topics => {
      // Filter topics based on the user's email in the access_user_emails list
      this.topics = topics.filter(topic => topic.access_user_emails?.includes(this.userEmail || ''));
    });
  }

  navigateToDrawing(topic: Topic) {
    this.router.navigate(['/drawing'], {
      queryParams: { id: topic.id, name: topic.name }
    });
  }
}
