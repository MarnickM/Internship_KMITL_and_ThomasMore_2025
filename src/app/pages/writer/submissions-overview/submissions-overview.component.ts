import { Component } from "@angular/core";
import { DrawingService } from "../../../services/drawings/drawing-service.service";
import { Router } from "@angular/router";
import { Drawing } from "../../../services/drawings/drawing";
import { TopicService } from "../../../services/topics/topic-service.service";
import { CommonModule } from "@angular/common";
import { LabelService } from "../../../services/labels/label-service.service";
import { UserService } from "../../../services/users/user-service.service";
import { AuthService } from "../../../services/auth.service";
import { Topic } from "../../../services/topics/topic";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-submissions-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submissions-overview.component.html',
  styleUrl: './submissions-overview.component.css'
})

export class SubmissionsOverviewComponent {

  drawings: Drawing[] | undefined;
  topicIdToName: Record<string, string> = {};
  userEmail: string | undefined;
  topics: Topic[] | undefined;


  constructor(private drawingService: DrawingService, private topicService: TopicService, private router: Router, private labelService: LabelService, private userService: UserService, private authService: AuthService) { }

  ngOnInit() {
    this.userEmail = this.authService.getUser()?.email;

    this.userService.getUserByEmail(this.authService.getUser().email).subscribe(user => {
      if (user) {
        if (user.id) {
          this.drawingService.getDrawingsByWriter(user.id).subscribe(drawings => {
            this.drawings = drawings.map(d => ({
              ...d,
              created_at: (d.created_at as any).toDate ? (d.created_at as any).toDate() : d.created_at
            }));
          });

        }
      }
    });

    this.topicService.getTopics().subscribe(topics => {
      // Filter topics based on the user's email in the access_user_emails list
      this.topics = topics.filter(topic => topic.access_user_emails?.includes(this.userEmail || ''));
      // Build map of topic_id => topic name
      this.topicIdToName = {};
      for (const topic of this.topics) {
        if (topic.id) {
          this.topicIdToName[topic.id] = topic.name;
        }
      }
    });
  }


  currentPage = 1;
  itemsPerPage = 10;

  get paginatedDrawings() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredDrawings.slice(startIndex, startIndex + this.itemsPerPage);
  }


  nextPage() {
    if (this.currentPage < Math.ceil((this.drawings?.length ?? 0) / this.itemsPerPage)) {
      this.currentPage++;
    }
  }


  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get totalPages(): number {
    return Math.ceil((this.drawings?.length ?? 0) / this.itemsPerPage);
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

  deleteDrawing(id: string) {
    this.drawingService.deleteDrawing(id).subscribe(() => {
      this.drawings = this.drawings?.filter(drawing => drawing.id !== id);
    });
  }

  filters = {
    topic: '',
    description: '',
    status: '',
    sortOrder: 'newest'
  };

  get filteredDrawings(): Drawing[] {
    let result = this.drawings ?? [];

    // Filter by topic
    if (this.filters.topic) {
      result = result.filter(d => d.topic_id === this.filters.topic);
    }

    // Filter by description text (case-insensitive)
    if (this.filters.description.trim()) {
      const term = this.filters.description.toLowerCase();
      result = result.filter(d => d.description?.toLowerCase().includes(term));
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
      const dateA = new Date(a.created_at ?? 0).getTime();
      const dateB = new Date(b.created_at ?? 0).getTime();
      return this.filters.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }

}