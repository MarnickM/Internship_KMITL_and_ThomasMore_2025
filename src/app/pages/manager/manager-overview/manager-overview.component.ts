import { Component, OnInit } from '@angular/core';
import { Topic } from '../../../services/topics/topic';
import { Drawing } from '../../../services/drawings/drawing';
import { TopicService } from '../../../services/topics/topic-service.service';
import { DrawingService } from '../../../services/drawings/drawing-service.service';
import { AuthService } from '../../../services/auth.service';

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
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user?.email) {
        this.topicService.getTopicsByCreatorEmail(user.email).subscribe(topics => {
          this.topics = topics;

          topics.forEach(topic => {
            this.drawingService.getDrawings().subscribe(drawings => {
              this.drawingsByTopic[topic.id] = drawings.filter(d => d.topic_id === topic.id);
              console.log(topic.id)
              console.log(this.drawingsByTopic[topic.id])
            });
          });
        });
      }
    });
  }

  downloadCSV(topic: Topic) {
    const drawings = this.drawingsByTopic[topic.id] || [];
    const drawingCount = drawings.length;

    // Create an array of objects where each object represents a row in the CSV
    const csvData = drawings.map(drawing => ({
      "Topic Name": topic.name,
      "Drawing Count": drawingCount,
      "Drawing ID": drawing.id || 'N/A',
      "Description": drawing.description,
      "Writer ID": drawing.writer_id,
      "Created At": new Date(drawing.created_at).toLocaleString(),
      "Vector Coordinates": drawing.vector.map(v => `(${v.x}, ${v.y})`).join('; ')
    }));

    // Convert the array of objects into a CSV format
    const csvContent = this.convertToCSV(csvData);

    // Create a blob from the CSV content and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `${topic.name}_drawings.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Function to convert an array of objects to CSV format
  convertToCSV(array: any[]): string {
    const arrayCopy = [...array];
    const header = Object.keys(arrayCopy[0]);
    const csvRows = [];

    // Add header to CSV
    csvRows.push(header.join(','));

    // Add data to CSV
    arrayCopy.forEach(row => {
      const values = header.map(fieldName => {
        const value = row[fieldName];
        return `"${value}"`; // Wrap each value in quotes to handle commas, etc.
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

}
