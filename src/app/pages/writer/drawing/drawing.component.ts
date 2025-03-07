import { Component, ElementRef, ViewChild } from '@angular/core';
import { ButtonComponent } from "../../../components/button/button.component";
import { ActivatedRoute } from '@angular/router';
import { Topic } from '../../../services/topics/topic';
import { LabelService } from '../../../services/labels/label-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-drawing',
  standalone: true,
  imports: [ButtonComponent, FormsModule, CommonModule],
  templateUrl: './drawing.component.html',
  styleUrl: './drawing.component.css'
})
export class DrawingComponent {
  @ViewChild('drawingCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  public coordinates: { x: number; y: number }[] = [];
  topic: Topic = { id: '', name: '' };

  selectedOption: string = '';
  dropdownOptions: string[] = []
  description: string = '';

  constructor(private route: ActivatedRoute, private labelService: LabelService) {
    // Access the query parameters
    this.route.queryParams.subscribe(params => {
    if (this.topic) {
        this.topic.id = params['id'];
        this.topic.name = params['name'];
      }
    if (this.topic.id !== '') {
        this.labelService.getLabelsByTopic(this.topic.id).subscribe(labels => {
          console.log(labels)
          for (let label of labels) {
            this.dropdownOptions.push(label.name);
            console.log(label.name)
          }
        });
      }
    
    });
  }

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = 'black';
  }

  startDrawing(event: MouseEvent) {
    this.drawing = true;
    const { x, y } = this.getMousePosition(event);
    this.coordinates.push({ x, y });
    console.log(x, y)

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  draw(event: MouseEvent) {
    if (!this.drawing) return;

    const { x, y } = this.getMousePosition(event);
    this.coordinates.push({ x, y });
    console.log(x, y)

    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  stopDrawing() {
    if (this.drawing) {
      const x = -1000
      const y = -1000
      this.coordinates.push({ x, y });
      console.log(x, y)
      this.ctx.closePath();
    }
    this.drawing = false;
  }

  private getMousePosition(event: MouseEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.coordinates = [];
  }
}
