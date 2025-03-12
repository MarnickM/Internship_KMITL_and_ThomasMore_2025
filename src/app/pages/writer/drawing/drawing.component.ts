import { Component, ElementRef, ViewChild } from '@angular/core';
import { ButtonComponent } from "../../../components/button/button.component";
import { ActivatedRoute } from '@angular/router';
import { Topic } from '../../../services/topics/topic';
import { LabelService } from '../../../services/labels/label-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DrawingService } from '../../../services/drawings/drawing-service.service';
import { Drawing } from '../../../services/drawings/drawing';
import { Vector } from '../../../services/drawings/vector';
import { UserService } from '../../../services/users/user-service.service';
import { AuthService } from '../../../services/auth.service';
import { filter, firstValueFrom, take } from 'rxjs';

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
  topic: Topic = { id: '', name: '', creator_email: 'senneke3112@gmail.com' };

  selectedOption: string = '';
  dropdownOptions: string[] = []
  description: string = '';
  error: boolean = false;
  success: boolean = false;
  labelId: string = '';
  drawingObject: Drawing = {
    writer_id: '',
    label_id: '',
    topic_id: '',
    vector: [],
    description: '',
    created_at: new Date()
  }

  constructor(private route: ActivatedRoute, private labelService: LabelService, private drawingService: DrawingService, private userService: UserService, private authService: AuthService) {
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
            this.labelId = label.id || '';
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
    // console.log(x, y)

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  draw(event: MouseEvent) {
    if (!this.drawing) return;

    const { x, y } = this.getMousePosition(event);
    this.coordinates.push({ x, y });
    // console.log(x, y)

    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  stopDrawing() {
    if (this.drawing) {
      const x = -1000
      const y = -1000
      this.coordinates.push({ x, y });
      // console.log(x, y)
      this.ctx.closePath();
    }
    this.drawing = false;
  }

  // private getMousePosition(event: MouseEvent) {
  //   const rect = this.canvas.nativeElement.getBoundingClientRect();
  //   return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  // }

  private getMousePosition(event: MouseEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (this.canvas.nativeElement.width / rect.width),
      y: (event.clientY - rect.top) * (this.canvas.nativeElement.height / rect.height)
    };
  }


  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.coordinates = [];
  }

  async loadUser() {
    const user = await firstValueFrom(
      this.userService.getUserByEmail(this.authService.getUser().email).pipe(
        filter(user => !!user), // Wait for a valid user
        take(1) // Take only the first result
      )
    );
    this.drawingObject.writer_id = user.id || '';
    console.log('User found: ', user.id);
  }



  async submitDrawing() {
    this.drawingObject.label_id = this.labelId;
    this.drawingObject.description = this.description;
    this.drawingObject.vector = this.coordinates;
    this.drawingObject.topic_id = this.topic.id;
    this.drawingObject.created_at = new Date();

    await this.loadUser();

    console.log(this.drawingObject)
    if (this.drawingObject.writer_id === '') {
      console.error('User not found');
      return;
    }

    if (this.drawingObject.label_id === '') {
      this.error = true;
      return;
    }
    this.drawingService.addDrawing(this.drawingObject).subscribe(id => {
      console.log('Drawing added with id: ', id);
      this.success = true;
    });
  }

  toggleError() {
    this.error = !this.error;
  }
  toggleSuccess() {
    this.success = !this.success;
  }
}
