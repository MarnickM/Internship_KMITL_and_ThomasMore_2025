import { Component, OnInit } from '@angular/core';
import { TopicService } from '../../../services/topics/topic-service.service';
import { AuthService } from '../../../services/auth.service';
import { Topic } from '../../../services/topics/topic';
import { DrawingService } from '../../../services/drawings/drawing-service.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-topic-management',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './topic-management.component.html',
  styleUrls: ['./topic-management.component.css']
})
export class TopicManagementComponent implements OnInit {
  topics: Topic[] = [];
  drawings: any[] = []; // Store all drawings here
  currentTopic: Topic | null = null;
  topicName: string = '';
  currentUserEmail: string | null = null;
  deleteModalVisible: boolean = false;
  topicToDeleteId: string | null = null;

  constructor(
    private topicService: TopicService,
    private authService: AuthService,
    private drawingService: DrawingService
  ) { }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user && user.email) {
        this.currentUserEmail = user.email;
        this.topicService.getTopicsByCreatorEmail(user.email).subscribe(topics => {
          this.topics = topics;
          this.loadDrawings(); // Fetch all drawings after topics are loaded
        });
      }
    });
  }

  loadDrawings() {
    this.drawingService.getDrawings().subscribe(drawings => {
      this.drawings = drawings;
    });
  }

  addTopic() {
    if (this.topicName.trim() && this.currentUserEmail) {
      const newTopic: Topic = {
        name: this.topicName,
        creator_email: this.currentUserEmail,
        id: '' // Firestore will generate an ID automatically
      };
      this.topicService.addTopic(newTopic).subscribe((topicId) => {
        newTopic.id = topicId;
        this.topics.push(newTopic); // Add the new topic to the list
        this.topicName = ''; // Reset the input field
      });
    }
  }

  editTopic(topic: Topic) {
    this.currentTopic = { ...topic }; // Create a copy of the topic for editing
    this.topicName = this.currentTopic.name
  }

  updateTopic() {
    if (this.currentTopic && this.currentTopic.name.trim()) {
      this.currentTopic.name = this.topicName;
      this.topicService.updateTopic(this.currentTopic).subscribe(() => {
        const index = this.topics.findIndex(t => t.id === this.currentTopic?.id);
        if (index !== -1) {
          this.topics[index] = this.currentTopic!;
          this.currentTopic = null;
          this.topicName = '';
        }
      });
    }
  }

  cancelEdit() {
    this.currentTopic = null;
    this.topicName = '';
  }

  openDeleteModal(topicId: string) {
    this.deleteModalVisible = true;
    this.topicToDeleteId = topicId;
  }

  cancelDelete() {
    this.deleteModalVisible = false;
    this.topicToDeleteId = null;
  }

  confirmDelete() {
    if (this.topicToDeleteId) {
      // Delete drawings related to the topic first
      const drawingsToDelete = this.drawings.filter(drawing => drawing.topicId === this.topicToDeleteId);
      drawingsToDelete.forEach(drawing => {
        this.drawingService.deleteDrawing(drawing.id).subscribe();
      });

      // Then delete the topic
      this.topicService.deleteTopic(this.topicToDeleteId).subscribe(() => {
        this.topics = this.topics.filter(topic => topic.id !== this.topicToDeleteId);
        this.topicToDeleteId = null;
      });

      this.deleteModalVisible = false;
    }
  }
}
