import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from "../../../components/button/button.component";
import { TopicService } from "../../../services/topics/topic-service.service";
import { Topic } from '../../../services/topics/topic';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Drawing } from '../../../services/drawings/drawing';
import { DrawingService } from '../../../services/drawings/drawing-service.service';
import { UserService } from '../../../services/users/user-service.service';
import { LabelService } from '../../../services/labels/label-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topic-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topic-overview.component.html',
  styleUrl: './topic-overview.component.css'
})
export class TopicOverviewComponent implements OnInit {

  topics: Topic[] | undefined;
  userEmail: string | undefined;
  drawings: Drawing[] | undefined;
  topicIdToName: Record<string, string> = {};


  constructor( 
    private topicService: TopicService,
    private router: Router,
    private authService: AuthService,
    private drawingService: DrawingService,
    private userService: UserService,
    private labelService: LabelService,
  ) { }

  ngOnInit() {
    this.userEmail = this.authService.getUser()?.email;

    this.topicService.getTopics().subscribe(topics => {
      this.topics = topics.filter(topic => topic.access_user_emails?.includes(this.userEmail || ''));
      this.topicIdToName = {};
      for (const topic of this.topics) {
        if (topic.id) {
          this.topicIdToName[topic.id] = topic.name;
        }
      }
    });

    this.userService.getUserByEmail(this.authService.getUser().email).subscribe(user => {
      if (user) {
        if (user.id) {
          this.drawingService.getDrawingsByWriter(user.id).subscribe(drawings => {
            this.drawings = drawings
              .map(d => ({
                ...d,
                created_at: (d.created_at as any).toDate ? (d.created_at as any).toDate() : d.created_at
              }))
              .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
          });

        }
      }
    });

  }

  topicPage = 0;
  topicsPerPage = 3;

  get paginatedTopics(): Topic[] {
    if (!this.topics) return [];
    const start = this.topicPage * this.topicsPerPage;
    return this.topics.slice(start, start + this.topicsPerPage);
  }

  get totalTopicPages(): number {
    return Math.ceil((this.topics?.length ?? 0) / this.topicsPerPage);
  }

  nextTopicPage() {
    if (this.topicPage < this.totalTopicPages - 1) this.topicPage++;
  }

  prevTopicPage() {
    if (this.topicPage > 0) this.topicPage--;
  }

  setTopicPage(index: number) {
    this.topicPage = index;
  }


  navigateToDrawing(topic: Topic) {
    this.router.navigate(['/drawing'], {
      queryParams: { id: topic.id, name: topic.name }
    });
  }

  navigateToMyDrawings() {
    this.router.navigate(['/submissions-overview']);
  }

  viewDrawing(drawing: Drawing) {
    this.topicService.getTopic(drawing.topic_id).subscribe(topic => {
      this.labelService.getLabel(drawing.label_id).subscribe(label => {
        this.router.navigate(['/drawing'], {
          queryParams: {
            id: drawing.id,
            topic_id: drawing.topic_id,
            description: drawing.description,
            topic: topic.name,
            vector: JSON.stringify(drawing.vector),
            label: label.name,
            editable: false
          }
        });
      });
    });
  }
}
