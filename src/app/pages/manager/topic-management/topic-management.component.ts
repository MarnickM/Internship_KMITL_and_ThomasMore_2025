import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TopicService } from '../../../services/topics/topic-service.service';
import { AuthService } from '../../../services/auth.service';
import { Topic } from '../../../services/topics/topic';
import { DrawingService } from '../../../services/drawings/drawing-service.service';
import { FormsModule } from '@angular/forms';
import { LabelService } from '../../../services/labels/label-service.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/users/user-service.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-topic-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './topic-management.component.html',
  styleUrls: ['./topic-management.component.css']
})
export class TopicManagementComponent implements OnInit {
  topics: Topic[] = [];
  drawingsCountByTopic: { [key: string]: number } = {};  
  drawings: any[] = []; 
  currentTopic: Topic | null = null;
  topicName: string = '';
  currentUserEmail: string | null = null;
  deleteModalVisible: boolean = false;
  topicToDeleteId: string | null = null;

  labelModalVisible: boolean = false;
  currentTopicName: string = "";
  labelsByTopic: { [key: string]: { id: string; name: string }[] } = {};
  newLabel: { topic_id: string; name: string } = { topic_id: "", name: "" };

  userEmails: string[] = [];
  accessModalVisible = false;
  selectedTopicForAccess: Topic | null = null;
  selectedEmail: string = '';


  constructor(
    private topicService: TopicService,
    private authService: AuthService,
    private drawingService: DrawingService,
    private labelService: LabelService,
    private userService: UserService,
    private location: Location
  ) { }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user && user.email) {
        this.currentUserEmail = user.email;
        this.topicService.getTopicsByCreatorEmail(user.email).subscribe(topics => {
          this.topics = topics;
          this.loadDrawingsCount(); 
        });
        this.loadUserEmails();
      }
    });
  }

  loadUserEmails() {
    this.userService.getUsersByRoles(["dfaNnrXgH6bqFys0Sw44"]).subscribe(users => {
      if (users) {
        this.userEmails = users.map(user => user.email);
        console.log(this.userEmails);
      } else {
        this.userEmails = [];
        console.warn('No users returned for the specified roles.');
      }
    });
  }

  openAccessModal(topic: Topic) {
    this.selectedTopicForAccess = topic;
    this.selectedEmail = '';
    this.accessModalVisible = true;
  }

  addAccessEmail() {
    if (this.selectedTopicForAccess && this.selectedEmail) {
      const topic = this.selectedTopicForAccess;
      topic.access_user_emails = topic.access_user_emails || [];

      if (!topic.access_user_emails.includes(this.selectedEmail)) {
        topic.access_user_emails.push(this.selectedEmail);

        this.topicService.updateTopic(topic).subscribe({
          next: () => {
            console.log('Access updated');
            this.selectedEmail = '';
            this.accessModalVisible = false; 
          },
          error: (err) => {
            console.error('Error updating access:', err);
          }
        });
      }
    }
  }

  removeAccessEmail(email: string) {
    if (this.selectedTopicForAccess) {
      const topic = this.selectedTopicForAccess;

      topic.access_user_emails = topic.access_user_emails.filter(existingEmail => existingEmail !== email);

      this.topicService.updateTopic(topic).subscribe({
        next: () => {
          console.log('Access removed');
        },
        error: (err) => {
          console.error('Error removing access:', err);
        }
      });
    }
  }

  loadDrawingsCount() {
    if (this.topics.length !== 0) {
      this.topics.forEach(topic => {
        this.drawingService.getDrawingsByTopic(topic.id!).subscribe(drawings => {
          this.drawingsCountByTopic[topic.id!] = drawings.length;
        });
      });
    }
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
        access_user_emails: [],
        ui_image: "https://images.pexels.com/photos/1526/dark-blur-blurred-gradient.jpg"
      };
      this.topicService.addTopic(newTopic).subscribe((topicId) => {
        newTopic.id = topicId;
        this.topics.push(newTopic);
        this.topicName = '';
      });
    }
  }

  addLabel(topic_id: string, topic_name: string) {
    console.log("addLabel triggered");
    if (this.labelModalVisible) return;

    this.newLabel = { topic_id: topic_id, name: "" };
    this.currentTopicName = topic_name;
    this.labelModalVisible = true;

    this.labelService.getLabelsByTopic(topic_id).subscribe((labels) => {
      console.log("Labels from Firebase:", labels);
      const updatedLabels = [];

      for (let label of labels) {
        const labelItem = { id: label.id as string, name: label.name }; 
        updatedLabels.push(labelItem);
      }

      this.labelsByTopic = { ...this.labelsByTopic, [topic_id]: updatedLabels };
      console.log("Labels by topic:", this.labelsByTopic);
    });
  }


  saveLabel() {
    if (!this.newLabel.name.trim()) return;

    this.labelService.addLabel(this.newLabel).subscribe((id) => {
      console.log("New label ID:", id);
      const newLabel = { id: id, name: this.newLabel.name };

      if (!this.labelsByTopic[this.newLabel.topic_id]) {
        this.labelsByTopic[this.newLabel.topic_id] = [];
      }

      this.labelsByTopic[this.newLabel.topic_id].push(newLabel); 
      this.newLabel.name = "";

    });
  }


  updateLabel(label: { id: string; name: string }, topic_id: string) {
    var updatedlabel = { id: "", name: "", topic_id: "" };
    updatedlabel.id = label.id;
    updatedlabel.name = label.name;
    updatedlabel.topic_id = topic_id;

    this.labelService.updateLabel(updatedlabel).subscribe(() => {
      const topicLabels = this.labelsByTopic[topic_id];
      const index = topicLabels.findIndex(l => l.id === label.id);
      if (index !== -1) {
        topicLabels[index] = { ...label };
      }
    });
  }


  deleteLabel(label_id: string, topic_id: string) {
    this.labelService.deleteLabel(label_id).subscribe(() => {
      if (this.labelsByTopic[topic_id]) {
        this.labelsByTopic[topic_id] = this.labelsByTopic[topic_id].filter(label => label.id !== label_id);
      }
    });
  }



  editTopic(topic: Topic) {
    this.currentTopic = { ...topic };
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
      const drawingsToDelete = this.drawings.filter(drawing => drawing.topicId === this.topicToDeleteId);
      drawingsToDelete.forEach(drawing => {
        this.drawingService.deleteDrawing(drawing.id).subscribe();
      });

      const labelsToDelete = this.labelsByTopic[this.topicToDeleteId] || [];
      labelsToDelete.forEach(label => {
        this.labelService.deleteLabel(label.id).subscribe();
      });

      this.topicService.deleteTopic(this.topicToDeleteId).subscribe(() => {
        this.topics = this.topics.filter(topic => topic.id !== this.topicToDeleteId);
        this.topicToDeleteId = null;
      });

      this.deleteModalVisible = false;
      this.goBack();
    }
  }

  goBack() {
    this.location.back();
  }
}
