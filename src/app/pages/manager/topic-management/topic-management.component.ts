import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TopicService } from '../../../services/topics/topic-service.service';
import { AuthService } from '../../../services/auth.service';
import { Topic } from '../../../services/topics/topic';
import { DrawingService } from '../../../services/drawings/drawing-service.service';
import { FormsModule } from '@angular/forms';
import { LabelService } from '../../../services/labels/label-service.service';
import { Label } from '../../../services/labels/label';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topic-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
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

  labelModalVisible: boolean = false;
  currentTopicName: string = "";
  labelsByTopic: { [key: string]: { id: string; name: string }[] } = {};
  newLabel: { topic_id: string; name: string } = { topic_id: "", name: "" };

  constructor(
    private topicService: TopicService,
    private authService: AuthService,
    private drawingService: DrawingService,
    private labelService: LabelService,
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
        creator_email: this.currentUserEmail
      };
      this.topicService.addTopic(newTopic).subscribe((topicId) => {
        newTopic.id = topicId;
        this.topics.push(newTopic); // Add the new topic to the list
        this.topicName = ''; // Reset the input field
      });
    }
  }

  addLabel(topic_id: string, topic_name: string) {
    console.log("addLabel triggered"); // Debugging log
    if (this.labelModalVisible) return;
  
    this.newLabel = { topic_id: topic_id, name: "" }; // Reset new label input
    this.currentTopicName = topic_name;
    this.labelModalVisible = true;
  
    // Fetch labels for this topic and store them in the dictionary
    this.labelService.getLabelsByTopic(topic_id).subscribe((labels) => {
      console.log("Labels from Firebase:", labels);
      const updatedLabels = []; // Create a new array for the labels
  
      // Assuming Firebase returns an array of label objects with `id` and `name`
      for (let label of labels) {
        const labelItem = { id: label.id as string, name: label.name }; // Use the correct `id` and `name`
        updatedLabels.push(labelItem);
      }
  
      this.labelsByTopic = { ...this.labelsByTopic, [topic_id]: updatedLabels }; // Immutable update
      console.log("Labels by topic:", this.labelsByTopic);
    });
  }
  

  saveLabel() {
    if (!this.newLabel.name.trim()) return; // Prevent empty label submission
  
    this.labelService.addLabel(this.newLabel).subscribe((id) => {
      console.log("New label ID:", id);
      const newLabel = { id: id, name: this.newLabel.name }; // Create full label object with Firebase-generated ID
  
      // Ensure labelsByTopic is initialized for this topic
      if (!this.labelsByTopic[this.newLabel.topic_id]) {
        this.labelsByTopic[this.newLabel.topic_id] = [];
      }
  
      this.labelsByTopic[this.newLabel.topic_id].push(newLabel); // Update dictionary
      this.newLabel.name = ""; // Reset input
  
      // Manually trigger change detection
    });
  }
  

  updateLabel(label: { id: string; name: string }, topic_id: string) {
    var updatedlabel = { id: "", name: "", topic_id: "" };
    updatedlabel.id = label.id;
    updatedlabel.name = label.name;
    updatedlabel.topic_id = topic_id;
    
    this.labelService.updateLabel(updatedlabel).subscribe(() => {
      // Update the label in our dictionary
      const topicLabels = this.labelsByTopic[topic_id];
      const index = topicLabels.findIndex(l => l.id === label.id);
      if (index !== -1) {
        topicLabels[index] = { ...label }; // Ensure it's properly updated
      }
    });
  }
  
  
  deleteLabel(label_id: string, topic_id: string) {
    this.labelService.deleteLabel(label_id).subscribe(() => {
      if (this.labelsByTopic[topic_id]) {
        // Filter out the label with the matching `id`
        this.labelsByTopic[topic_id] = this.labelsByTopic[topic_id].filter(label => label.id !== label_id);
      }
    });
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

      // delete all labels related to the topic
      const labelsToDelete = this.labelsByTopic[this.topicToDeleteId] || [];
      labelsToDelete.forEach(label => {
        this.labelService.deleteLabel(label.id).subscribe();
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
