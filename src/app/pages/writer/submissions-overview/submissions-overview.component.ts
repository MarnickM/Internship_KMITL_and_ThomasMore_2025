import { Component } from "@angular/core";

@Component({
  selector: 'app-submissions-overview',
  standalone: true,
  templateUrl: './submissions-overview.component.html',
  styleUrl: './submissions-overview.component.css'
})

export class SubmissionsOverviewComponent {
  drawings = [
    { topic: 'Landscape', description: 'A beautiful scenery', createdAt: new Date('2024-03-01T10:00:00') },
    { topic: 'Portrait', description: 'A person’s face', createdAt: new Date('2024-03-02T12:30:00') },
    { topic: 'Abstract', description: 'Random artistic strokes', createdAt: new Date('2024-03-03T15:45:00') },
    { topic: 'Cartoon', description: 'A fun character sketch', createdAt: new Date('2024-03-04T08:20:00') },
    { topic: 'Landscape', description: 'A beautiful scenery', createdAt: new Date('2024-03-05T14:10:00') },
    { topic: 'Portrait', description: 'A person’s face', createdAt: new Date('2024-03-06T09:00:00') },
    { topic: 'Abstract', description: 'Random artistic strokes', createdAt: new Date('2024-03-07T16:30:00') },
    { topic: 'Cartoon', description: 'A fun character sketch', createdAt: new Date('2024-03-08T11:05:00') },
    { topic: 'Cartoon', description: 'A fun character sketch', createdAt: new Date('2024-03-04T08:20:00') },
    { topic: 'Landscape', description: 'A beautiful scenery', createdAt: new Date('2024-03-05T14:10:00') },
    { topic: 'Portrait', description: 'A person’s face', createdAt: new Date('2024-03-06T09:00:00') },
    { topic: 'Abstract', description: 'Random artistic strokes', createdAt: new Date('2024-03-07T16:30:00') },
    { topic: 'Cartoon', description: 'A fun character sketch', createdAt: new Date('2024-03-08T11:05:00') },
    { topic: 'Cartoon', description: 'A fun character sketch', createdAt: new Date('2024-03-04T08:20:00') },
    { topic: 'Landscape', description: 'A beautiful scenery', createdAt: new Date('2024-03-05T14:10:00') },
    { topic: 'Portrait', description: 'A person’s face', createdAt: new Date('2024-03-06T09:00:00') },
    { topic: 'Abstract', description: 'Random artistic strokes', createdAt: new Date('2024-03-07T16:30:00') },
    { topic: 'Cartoon', description: 'A fun character sketch', createdAt: new Date('2024-03-08T11:05:00') },
    { topic: 'Cartoon', description: 'A fun character sketch', createdAt: new Date('2024-03-04T08:20:00') },
    { topic: 'Landscape', description: 'A beautiful scenery', createdAt: new Date('2024-03-05T14:10:00') },
    { topic: 'Portrait', description: 'A person’s face', createdAt: new Date('2024-03-06T09:00:00') },
    { topic: 'Abstract', description: 'Random artistic strokes', createdAt: new Date('2024-03-07T16:30:00') },
    { topic: 'Cartoon', description: 'A fun character sketch', createdAt: new Date('2024-03-08T11:05:00') },
    { topic: 'Cartoon', description: 'A fun character sketch', createdAt: new Date('2024-03-04T08:20:00') },
    { topic: 'Landscape', description: 'A beautiful scenery', createdAt: new Date('2024-03-05T14:10:00') },
    { topic: 'Portrait', description: 'A person’s face', createdAt: new Date('2024-03-06T09:00:00') },
    { topic: 'Abstract', description: 'Random artistic strokes', createdAt: new Date('2024-03-07T16:30:00') },
    { topic: 'Cartoon', description: 'A fun character sketch', createdAt: new Date('2024-03-08T11:05:00') },
  ];

  currentPage = 1;
  itemsPerPage = 10;

  get paginatedDrawings() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.drawings.slice(startIndex, startIndex + this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < Math.ceil(this.drawings.length / this.itemsPerPage)) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.drawings.length / this.itemsPerPage);
  }

}