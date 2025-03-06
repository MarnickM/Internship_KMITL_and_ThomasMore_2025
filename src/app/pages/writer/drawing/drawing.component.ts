import { Component, ElementRef, ViewChild } from '@angular/core';
import { ButtonComponent } from "../../../components/button/button.component";

@Component({
  selector: 'app-drawing',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './drawing.component.html',
  styleUrl: './drawing.component.css'
})
export class DrawingComponent {
  @ViewChild('drawingCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  public coordinates: { x: number; y: number }[] = [];

  selectedOption: string = '';
  dropdownOptions: string[] = ['Option 1', 'Option 2', 'Option 3'];
  description: string = '';


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
