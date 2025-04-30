import { Component, OnInit } from '@angular/core';
import { Topic } from '../../../services/topics/topic';
import { Drawing } from '../../../services/drawings/drawing';
import { TopicService } from '../../../services/topics/topic-service.service';
import { DrawingService } from '../../../services/drawings/drawing-service.service';
import { AuthService } from '../../../services/auth.service';
import { LabelService } from '../../../services/labels/label-service.service';
import { Router } from '@angular/router';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { UserService } from '../../../services/users/user-service.service';
import { User } from '../../../services/users/user';

@Component({
  selector: 'app-manager-overview',
  standalone: true,
  imports: [],
  templateUrl: './manager-overview.component.html',
  styleUrl: './manager-overview.component.css'
})
export class ManagerOverviewComponent implements OnInit {
  topics: Topic[] = [];
  drawingsByTopic: { [key: string]: Drawing[] } = {};
  userCache: { [id: string]: string } = {}; // Cache of user names by ID

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
        this.topicService.getTopicsByCreatorEmail(user.email).subscribe(topics => {
          this.topics = topics;

          topics.forEach(topic => {
            this.drawingService.getDrawings().subscribe(drawings => {
              const filtered = drawings.filter(d => d.topic_id === topic.id);
              this.drawingsByTopic[topic.id || ''] = filtered;

              // Preload writer names for this topic
              filtered.forEach(drawing => {
                this.loadWriterName(drawing.writer_id);
              });
            });
          });
        });
      }
    });
  }

  loadWriterName(writerId: string) {
    if (!this.userCache[writerId]) {
      this.userService.getUser(writerId).subscribe(user => {
        this.userCache[writerId] = user.name;
      });
    }
  }

  getWriterName(writerId: string): string {
    return this.userCache[writerId] || 'Loading...';
  }

  getUnreviewedDrawings(topicId: string): Drawing[] {
    return this.drawingsByTopic[topicId || '']?.filter(d => d.status === 'unreviewed') || [];
  }

  getRequestChangesDrawings(topicId: string): Drawing[] {
    return this.drawingsByTopic[topicId || '']?.filter(d => d.status === 'request_changes') || [];
  }

  getReviewedDrawings(topicId: string): Drawing[] {
    return this.drawingsByTopic[topicId || '']?.filter(d => d.status === 'reviewed') || [];
  }

  deleteDrawing(id: string, topic_id: string) {
    this.drawingService.deleteDrawing(id).subscribe(() => {
      if (this.drawingsByTopic[topic_id]) {
        this.drawingsByTopic[topic_id] = this.drawingsByTopic[topic_id].filter(drawing => drawing.id !== id);
      }
    });
  }

  viewDrawing(drawing: Drawing, topic_name: string, topic_id: string) {
    this.labelService.getLabel(drawing.label_id).subscribe(label => {
      this.router.navigate(['/drawing'], {
        queryParams: {
          id: drawing.id,
          topic_id: topic_id,
          description: drawing.description,
          topic: topic_name,
          vector: JSON.stringify(drawing.vector),
          label: label.name,
          editable: false
        }
      });
    });
  }

  downloadCSV(topic: Topic) {
    const drawings = this.drawingsByTopic[topic.id || ''] || [];
    const filename = topic.name + "_overview"
    const drawingCount = drawings.length;

    const csvData = drawings.map(drawing => ({
      "Drawing ID": drawing.id || 'N/A',
      "Description": drawing.description,
      "Writer Name": this.getWriterName(drawing.writer_id),
      "Vector Coordinates": drawing.vector.map(v => `(${v.x}, ${v.y})`).join('; ')
    }));

    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      title: `Overview of ${topic.name}, Total drawings: ${drawingCount}`,
      useBom: true,
      noDownload: false,
      headers: ["Drawing ID", "Description", "Writer Name", "Vector Coordinates"],
      useHeader: false,
      nullToEmptyString: true,
    };

    new AngularCsv(csvData, filename, options);
  }
}
