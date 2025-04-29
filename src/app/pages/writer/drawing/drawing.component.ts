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
  topic: Topic = { id: '', name: '', creator_email: '' };

  selectedOption: string = '';
  dropdownOptions: string[] = []
  description: string = '';
  error: boolean = false;
  success: boolean = false;
  drawingObject: Drawing = {
    writer_id: '',
    label_id: '',
    topic_id: '',
    vector: [],
    description: '',
    created_at: new Date()
  }
  updateDrawing: boolean = false;
  drawingID: string = '';
  label_id_pairs: { [key: string]: string } = {}


  constructor(private route: ActivatedRoute, private labelService: LabelService, private drawingService: DrawingService, private userService: UserService, private authService: AuthService) {
    // Access the query parameters
    this.route.queryParams.subscribe(params => {

      if (params['name'] != undefined) {
        // if we come from the topic overview page
        this.topic.id = params['id'];
        this.topic.name = params['name'];
        console.log("We are coming from the topic overview page")
      }
      else {
        this.updateDrawing = true;
        // if we come from the submissions overview page
        this.drawingID = params['id'];
        this.topic.id = params['topic_id'];
        this.description = params['description'];
        this.topic.name = params['topic'];
        this.selectedOption = params['label'];
        this.coordinates = JSON.parse(params['vector']);
        console.log("We are coming from the submissions overview page")
      }

      if (this.topic.id !== '') {
        this.labelService.getLabelsByTopic(this.topic.id || '').subscribe(labels => {
          console.log(labels);
          
          for (let label of labels) {
            // Check if label.name is already in dropdownOptions
            if (!this.dropdownOptions.includes(label.name)) {
              this.dropdownOptions.push(label.name);
              this.label_id_pairs[label.name] = label.id ?? '';
            } else {
              console.log(`Label "${label.name}" already exists in dropdown options.`);
            }
          }
        });
      }
      if (this.selectedOption && this.dropdownOptions.includes(this.selectedOption)) {
        this.selectedOption = this.selectedOption;
      }
    });
  }

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = 'black';
  
    // If there are stored coordinates, redraw them
    if (this.coordinates.length > 0) {
      this.drawStoredCoordinates();
    }


    this.canvas.nativeElement.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.nativeElement.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.nativeElement.addEventListener('touchend', this.handleTouchEnd.bind(this));
    this.canvas.nativeElement.addEventListener('touchcancel', this.handleTouchEnd.bind(this));
  }
  

  private drawStoredCoordinates() {
    if (!this.coordinates.length) return;
  
    this.ctx.beginPath();
    let isDrawing = false;
  
    for (let i = 0; i < this.coordinates.length; i++) {
      const { x, y } = this.coordinates[i];
  
      if (x === -1000 && y === -1000) {
        this.ctx.closePath();  // Stop the current path
        isDrawing = false;
        this.ctx.beginPath();  // Start a new path for the next stroke
        continue;
      }
  
      if (!isDrawing) {
        this.ctx.moveTo(x, y);
        isDrawing = true;
      } else {
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
      }
    }
    this.ctx.closePath();
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
    this.drawingObject.label_id = this.label_id_pairs[this.selectedOption] || '';
    this.drawingObject.description = this.description;
    this.drawingObject.vector = this.coordinates;
    this.drawingObject.topic_id = this.topic.id || '';
    this.drawingObject.created_at = new Date();
    if (this.drawingID !== '') {
      this.drawingObject.id = this.drawingID;
    }
    await this.loadUser();
      
    if (this.drawingObject.writer_id === '') {
      console.error('User not found');
      return;
    }

    if (this.drawingObject.label_id === '') {
      this.toggleError();
      return;
    }

    console.log(this.drawingObject)

    console.log(this.drawingObject)
    if (!this.updateDrawing) {
      this.drawingService.addDrawing(this.drawingObject).subscribe(id => {
        console.log('Drawing added with id: ', id);
        this.toggleSuccess();
      });
    }
    else {
      this.drawingService.updateDrawing(this.drawingObject).subscribe(() => {
        console.log('Drawing updated');
        this.toggleSuccess();
      });
    }
  }

  toggleError() {
    this.error = !this.error;
    setTimeout(() => {
      this.error = false;
    }, 3000); // Hide the error message after 3 seconds
  }
  toggleSuccess() {
    this.success = !this.success;
    setTimeout(() => {
      this.success = false;
    }, 3000); // Hide the success message after 3 seconds
  }





  // -------------------------------------------------------------


  private getTouchPosition(event: TouchEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const touch = event.touches[0] || event.changedTouches[0];
    return {
      x: (touch.clientX - rect.left) * (this.canvas.nativeElement.width / rect.width),
      y: (touch.clientY - rect.top) * (this.canvas.nativeElement.height / rect.height)
    };
  }
  
  handleTouchStart(event: TouchEvent) {
    event.preventDefault();
    const pos = this.getTouchPosition(event);
    this.drawing = true;
    this.coordinates.push(pos);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }
  
  handleTouchMove(event: TouchEvent) {
    if (!this.drawing) return;
    event.preventDefault();
    const pos = this.getTouchPosition(event);
    this.coordinates.push(pos);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
  }
  
  handleTouchEnd(event: TouchEvent) {
    if (this.drawing) {
      this.coordinates.push({ x: -1000, y: -1000 });
      this.ctx.closePath();
    }
    this.drawing = false;
  }
  
}
