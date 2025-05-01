import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Topic } from '../../../services/topics/topic';
import { Drawing } from '../../../services/drawings/drawing';
import { TopicService } from '../../../services/topics/topic-service.service';
import { DrawingService } from '../../../services/drawings/drawing-service.service';
import { LabelService } from '../../../services/labels/label-service.service';
import { UserService } from '../../../services/users/user-service.service';
import { User } from '../../../services/users/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';

@Component({
  selector: 'app-topic-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './topic-detail.component.html',
  styleUrls: ['./topic-detail.component.css']
})
export class TopicDetailComponent implements OnInit {
  topic: Topic | null = null;
  drawings: Drawing[] = [];
  labels: { id: string; name: string }[] = [];
  allUsers: User[] = [];
  loading = true;
  editMode = false;

  // Filter variables
  filters = {
    description: '',
    writer: '',
    status: '',
    sortOrder: 'newest'
  };

  // Form variables
  editForm = {
    name: '',
    ui_image: '',
    access_user_emails: [] as string[]
  };
  newLabelName = '';
  selectedUserEmail = '';
  writersWithDrawings: User[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private topicService: TopicService,
    private drawingService: DrawingService,
    private labelService: LabelService,
    private userService: UserService
  ) { }

  ngOnInit() {
    const topicId = this.route.snapshot.paramMap.get('id');
    if (topicId) {
      this.loadTopicAndRelatedData(topicId); // This now handles user loading
    }
  }

  loadTopicAndRelatedData(topicId: string) {
    this.topicService.getTopic(topicId).subscribe(topic => {
      this.topic = topic;
      this.editForm = {
        name: topic.name,
        ui_image: topic.ui_image,
        access_user_emails: [...topic.access_user_emails]
      };

      // First load users, then load drawings
      this.userService.getUsers().subscribe(users => {
        this.allUsers = users;

        this.drawingService.getDrawingsByTopic(topicId).subscribe(drawings => {
          this.drawings = drawings;

          // Get unique writer IDs from drawings
          const writerIds = [...new Set(drawings.map(d => d.writer_id))];

          // Filter allUsers to only include writers with drawings
          this.writersWithDrawings = this.allUsers.filter(user =>
            user.id && writerIds.includes(user.id)
          );
        });
      });

      this.labelService.getLabelsByTopic(topicId).subscribe(labels => {
        this.labels = labels
          .filter(label => label.id !== undefined)
          .map(label => ({
            id: label.id!,
            name: label.name
          }));
        this.loading = false;
      });
    });
  }

  loadAllUsers() {
    this.userService.getUsers().subscribe(users => {
      this.allUsers = users;
    });
  }

  // Filtering and sorting functionality
  get filteredDrawings(): Drawing[] {
    let result = this.drawings ?? [];

    // Filter by description
    if (this.filters.description.trim()) {
      const term = this.filters.description.toLowerCase();
      result = result.filter(d => d.description?.toLowerCase().includes(term));
    }

    // Filter by writer
    if (this.filters.writer) {
      result = result.filter(d => d.writer_id === this.filters.writer);
    }

    // Filter by status
    if (this.filters.status) {
      result = result.filter(d => {
        if (this.filters.status === 'reviewed') {
          return d.status !== 'unreviewed' && d.status !== 'request_changes';
        }
        return d.status === this.filters.status;
      });
    }

    // Sort
    result = result.slice().sort((a, b) => {
      // Sort by date
      if (this.filters.sortOrder === 'newest' || this.filters.sortOrder === 'oldest') {
        const dateA = new Date(a.created_at ?? 0).getTime();
        const dateB = new Date(b.created_at ?? 0).getTime();
        return this.filters.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      }
      // Sort by status
      else if (this.filters.sortOrder === 'status') {
        const statusOrder = ['unreviewed', 'request_changes', 'reviewed'];
        return statusOrder.indexOf(a.status || '') - statusOrder.indexOf(b.status || '');
      }
      return 0;
    });

    return result;
  }

  // Get writer name for display
  getWriterName(writerId: string | undefined): string {
    if (!writerId) return 'Unknown';
    const writer = this.allUsers.find(u => u.id === writerId);
    return writer?.name || writer?.email || 'Unknown';
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode && this.topic) {
      this.editForm = {
        name: this.topic.name,
        ui_image: this.topic.ui_image,
        access_user_emails: [...this.topic.access_user_emails]
      };
    }
  }

  addLabel() {
    if (!this.newLabelName.trim() || !this.topic?.id) return;

    const newLabel = {
      topic_id: this.topic.id,
      name: this.newLabelName.trim()
    };

    this.labelService.addLabel(newLabel).subscribe(id => {
      this.labels.push({ id, name: newLabel.name });
      this.newLabelName = '';
    });
  }

  removeLabel(labelId: string) {
    this.labelService.deleteLabel(labelId).subscribe(() => {
      this.labels = this.labels.filter(label => label.id !== labelId);
    });
  }

  addAccessUser() {
    if (this.selectedUserEmail && !this.editForm.access_user_emails.includes(this.selectedUserEmail)) {
      this.editForm.access_user_emails.push(this.selectedUserEmail);
      this.selectedUserEmail = '';
    }
  }

  removeAccessUser(email: string) {
    this.editForm.access_user_emails = this.editForm.access_user_emails.filter(e => e !== email);
  }

  saveChanges() {
    if (!this.topic?.id) return;

    const updatedTopic: Topic = {
      ...this.topic,
      name: this.editForm.name,
      ui_image: this.editForm.ui_image,
      access_user_emails: this.editForm.access_user_emails
    };

    this.topicService.updateTopic(updatedTopic).subscribe(() => {
      this.topic = updatedTopic;
      this.editMode = false;
    });
  }

  deleteTopic() {
    if (!this.topic?.id) return;

    if (confirm('Are you sure you want to delete this topic? All associated drawings and labels will also be deleted.')) {
      this.topicService.deleteTopic(this.topic.id).subscribe(() => {
        this.router.navigate(['/']); // Navigate back to home or topics list
      });
    }
  }

  getUnreviewedDrawings(): Drawing[] {
    return this.drawings.filter(d => d.status === 'unreviewed');
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

  downloadCSV() {
    if (!this.topic) return;

    const drawings = this.drawings;
    const filename = `${this.topic.name}_overview`.replace(/\s+/g, '_');
    const drawingCount = drawings.length;

    const csvData = drawings.map(drawing => ({
      "Drawing ID": drawing.id || 'N/A',
      "Description": drawing.description || 'N/A',
      "Writer Name": this.getWriterName(drawing.writer_id),
      "Status": drawing.status || 'N/A',
      "Created At": drawing.created_at ? new Date(drawing.created_at).toLocaleString() : 'N/A',
      "Vector Coordinates": drawing.vector?.map(v => `(${v.x}, ${v.y})`).join('; ') || 'N/A'
    }));

    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: `Overview of ${this.topic.name}\nTotal drawings: ${drawingCount}`,
      useBom: true,
      headers: ["Drawing ID", "Description", "Writer Name", "Status", "Created At", "Vector Coordinates"],
      useHeader: true,
      nullToEmptyString: true,
    };

    new AngularCsv(csvData, filename, options);
  }
}