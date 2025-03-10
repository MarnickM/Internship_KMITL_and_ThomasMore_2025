import { Component } from "@angular/core";
import { DrawingService } from "../../../services/drawings/drawing-service.service";
import { Router } from "@angular/router";
import { Drawing } from "../../../services/drawings/drawing";
import { TopicService } from "../../../services/topics/topic-service.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-submissions-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './submissions-overview.component.html',
  styleUrl: './submissions-overview.component.css'
})

export class SubmissionsOverviewComponent {

  drawings: Drawing[] | undefined;

  constructor(private drawingService: DrawingService, private topicService: TopicService, private router: Router) { }

  ngOnInit() {
    this.drawingService.getDrawings().subscribe(drawings => {
      this.drawings = drawings;
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
    this.router.navigate(['/drawing'], {
      queryParams: {
        id: drawing.topic_id,
        description: drawing.description,
        vector: JSON.stringify(drawing.vector),
        editable: false
      }
    });
  }


}