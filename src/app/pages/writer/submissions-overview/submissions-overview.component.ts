import { Component } from "@angular/core";
import { DrawingService } from "../../../services/drawings/drawing-service.service";
import { Router } from "@angular/router";
import { Drawing } from "../../../services/drawings/drawing";
import { TopicService } from "../../../services/topics/topic-service.service";
import { CommonModule } from "@angular/common";
import { LabelService } from "../../../services/labels/label-service.service";
import { UserService } from "../../../services/users/user-service.service";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: 'app-submissions-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './submissions-overview.component.html',
  styleUrl: './submissions-overview.component.css'
})

export class SubmissionsOverviewComponent {

  drawings: Drawing[] | undefined;

  constructor(private drawingService: DrawingService, private topicService: TopicService, private router: Router, private labelService: LabelService, private userService: UserService, private authService: AuthService) { }

  ngOnInit() {
    this.userService.getUserByEmail(this.authService.getUser().email).subscribe(user => {
      if (user) {
        if (user.id) {
          this.drawingService.getDrawingsByWriter(user.id).subscribe(drawings => {
            this.drawings = drawings;
          });
        }
      }
    });
}


  currentPage = 1;
  itemsPerPage = 10;

  get paginatedDrawings() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.drawings?.slice(startIndex, startIndex + this.itemsPerPage) ?? [];
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
}