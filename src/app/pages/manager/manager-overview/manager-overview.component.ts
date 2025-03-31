import { Component, OnInit } from '@angular/core';
import { Topic } from '../../../services/topics/topic';
import { Drawing } from '../../../services/drawings/drawing';
import { TopicService } from '../../../services/topics/topic-service.service';
import { DrawingService } from '../../../services/drawings/drawing-service.service';
import { AuthService } from '../../../services/auth.service';
import { LabelService } from '../../../services/labels/label-service.service';
import { Router } from '@angular/router';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';

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


  constructor(
    private topicService: TopicService,
    private drawingService: DrawingService,
    private authService: AuthService,
    private labelService: LabelService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user?.email) {
        this.topicService.getTopicsByCreatorEmail(user.email).subscribe(topics => {
          this.topics = topics;

          topics.forEach(topic => {
            this.drawingService.getDrawings().subscribe(drawings => {
              this.drawingsByTopic[topic.id || ''] = drawings.filter(d => d.topic_id === topic.id);
              console.log(topic.id)
              console.log(this.drawingsByTopic[topic.id || ''])
            });
          });
        });
      }
    });
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


  downloadCSV(topic: any) {
    const drawings = this.drawingsByTopic[topic.id || ''] || [];
    const filename = topic.name + "_overview"
    const drawingCount = drawings.length;

    // Create an array of objects where each object represents a row in the CSV
    const csvData = drawings.map(drawing => ({
      "Drawing ID": drawing.id || 'N/A',
      "Description": drawing.description,
      "Writer ID": drawing.writer_id,
      "Vector Coordinates": drawing.vector.map(v => `(${v.x}, ${v.y})`).join('; ')
    }));

    // Set CSV export options
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      title: `Overview of ${topic.name}, Total drawings: ${drawingCount}`,
      useBom: true,
      noDownload: false,
      headers: ["Drawing ID", "Description", "Writer ID", "Vector Coordinates"],
      useHeader: false,
      nullToEmptyString: true,
    };

    // Export to CSV
    new AngularCsv(csvData, filename, options);
  }
}
