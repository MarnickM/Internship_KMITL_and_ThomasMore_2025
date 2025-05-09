import { Component, OnInit } from '@angular/core';
import { Topic } from '../../../services/topics/topic';
import { Drawing } from '../../../services/drawings/drawing';
import { TopicService } from '../../../services/topics/topic-service.service';
import { DrawingService } from '../../../services/drawings/drawing-service.service';
import { AuthService } from '../../../services/auth.service';
import { LabelService } from '../../../services/labels/label-service.service';
import { Router } from '@angular/router';
import { UserService } from '../../../services/users/user-service.service';
import { User } from '../../../services/users/user';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manager-overview',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './manager-overview.component.html',
  styleUrls: ['./manager-overview.component.css']
})
export class ManagerOverviewComponent implements OnInit {
  topics: Topic[] = [];
  searchText: string = '';
  drawingsByTopic: { [key: string]: Drawing[] } = {};
  sortOption: string = 'alphabetical';
  addTopic: boolean = false;
  users: User[] = [];
  selectedEmail: string = '';
  userEmail: string = '';

  tempLabels: { name: string }[] = [];
  newLabelInput: string = '';

  topicForm = {
    name: '',
    ui_image: '',
    creator_email: '',
    access_user_emails: [] as string[]
  };

  constructor(
    private topicService: TopicService,
    private drawingService: DrawingService,
    private authService: AuthService,
    private labelService: LabelService,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user?.email) {
        this.userEmail = user.email;
        this.loadTopics(user.email);
      }
    });

    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  private loadTopics(email: string) {
    this.topicService.getTopicsByCreatorEmail(email).subscribe(topics => {
      this.topics = topics;
      topics.forEach(topic => {
        this.drawingService.getDrawings().subscribe(drawings => {
          const filtered = drawings.filter(d => d.topic_id === topic.id);
          this.drawingsByTopic[topic.id || ''] = filtered;
        });
      });
    });
  }

  addLabelToTempList() {
    if (!this.newLabelInput.trim()) return;

    this.tempLabels.push({ name: this.newLabelInput.trim() });
    this.newLabelInput = '';
  }

  removeLabelFromTempList(index: number) {
    this.tempLabels.splice(index, 1);
  }

  saveLabelsForTopic(topicId: string) {
    this.tempLabels.forEach(label => {
      const newLabel = {
        topic_id: topicId,
        name: label.name
      };

      this.labelService.addLabel(newLabel).subscribe();
    });

    this.tempLabels = [];
  }

  addAccessEmail() {
    if (this.selectedEmail && !this.topicForm.access_user_emails.includes(this.selectedEmail)) {
      this.topicForm.access_user_emails.push(this.selectedEmail);
      this.selectedEmail = '';
    }
  }

  removeAccessEmail(email: string) {
    this.topicForm.access_user_emails = this.topicForm.access_user_emails.filter(e => e !== email);
  }

  addTopicFunction(): void {
    this.addTopic = true;
    this.resetForm();
  }

  cancelAddTopic(): void {
    this.addTopic = false;
    this.resetForm();
  }

  private resetForm() {
    this.topicForm = {
      name: '',
      ui_image: '',
      creator_email: '',
      access_user_emails: []
    };
    this.tempLabels = [];
    this.newLabelInput = '';
    this.selectedEmail = '';
  }

  addTopicToDb() {
    if (this.topicForm.name.trim() && this.userEmail) {
      const newTopic: Topic = {
        name: this.topicForm.name,
        creator_email: this.userEmail,
        access_user_emails: this.topicForm.access_user_emails,
        ui_image: this.topicForm.ui_image.trim() ? this.topicForm.ui_image : 'https://images.pexels.com/photos/1526/dark-blur-blurred-gradient.jpg'
      };

      this.topicService.addTopic(newTopic).subscribe((topicId) => {
        newTopic.id = topicId;
        this.topics.push(newTopic);

        if (this.tempLabels.length > 0) {
          this.saveLabelsForTopic(topicId);
        }

        this.resetForm();
        this.addTopic = false;
      });
    }
  }

  filteredTopics(): Topic[] {
    const lower = this.searchText.toLowerCase();
    let filtered = this.topics.filter(t => t.name.toLowerCase().includes(lower));

    switch (this.sortOption) {
      case 'alphabetical':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'total':
        return filtered.sort((a, b) => this.getDrawingCount(b.id || '') - this.getDrawingCount(a.id || ''));
      case 'unreviewed':
        return filtered.sort((a, b) => this.getUnreviewedDrawingCount(b.id || '') - this.getUnreviewedDrawingCount(a.id || ''));
      default:
        return filtered;
    }
  }

  getDrawingCount(topicId: string): number {
    return this.drawingsByTopic[topicId || '']?.length || 0;
  }

  getUnreviewedDrawingCount(topicId: string): number {
    return this.getUnreviewedDrawings(topicId).length;
  }

  getUnreviewedDrawings(topicId: string): Drawing[] {
    return this.drawingsByTopic[topicId || '']?.filter(d => d.status === 'unreviewed') || [];
  }

  navigateToTopicOverview(topicId: string) {
    this.router.navigate(['/topic-detail', topicId]);
  }
}