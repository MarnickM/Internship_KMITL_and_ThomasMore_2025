import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import p5 from 'p5';
import * as ms from '@magenta/sketch';

@Component({
  selector: 'app-sketch-generator',
  templateUrl: './sketch-generator.component.html',
  styleUrls: ['./sketch-generator.component.css']
})
export class SketchGeneratorComponent implements OnInit, OnDestroy {
  @ViewChild('sketchContainer', { static: true }) sketchContainer!: ElementRef;
  private p5Instance!: p5;
  private model!: ms.SketchRNN;
  private modelLoaded = false;
  private drawing = false;
  private userStroke: { dx: number; dy: number; pen: number[] }[] = [];
  private x = 0;
  private y = 0;
  private prevX = 0;
  private prevY = 0;
  private rnnState: any;
  private lineColor!: p5.Color;

  constructor() {}

  ngOnInit(): void {
    this.initializeSketch();
  }

  ngOnDestroy(): void {
    this.p5Instance.remove();
  }

  private initializeSketch(): void {
    this.p5Instance = new p5((p: p5) => {
      p.setup = () => {
        p.createCanvas(600, 600).parent(this.sketchContainer.nativeElement);
        this.x = p.width / 2;
        this.y = p.height / 3;
        this.prevX = this.x;
        this.prevY = this.y;
        this.lineColor = p.color(p.random(64, 224), p.random(64, 224), p.random(64, 224));
        this.loadModel(p);
      };

      p.mousePressed = () => {
        if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
          this.drawing = true;
          this.userStroke = [];
          this.prevX = p.mouseX;
          this.prevY = p.mouseY;
        }
      };

      p.mouseReleased = () => {
        this.drawing = false;
        this.finishDrawing(p);
      };

      p.mouseDragged = () => {
        if (this.drawing) {
          let dx = p.mouseX - this.prevX;
          let dy = p.mouseY - this.prevY;
          this.userStroke.push({ dx, dy, pen: [1, 0, 0] }); // Keep pen down during mouse drag
          p.stroke(this.lineColor);
          p.strokeWeight(3.0);
          p.line(this.prevX, this.prevY, p.mouseX, p.mouseY);
          this.prevX = p.mouseX;
          this.prevY = p.mouseY;
        }
      };
    });
  }

  private async loadModel(p: p5): Promise<void> {
    this.model = new ms.SketchRNN('https://storage.googleapis.com/quickdraw-models/sketchRNN/models/cat.gen.json');
    await this.model.initialize();
    this.model.setPixelFactor(3.0);
    this.rnnState = this.model.zeroState();
    this.modelLoaded = true;
    console.log('Model loaded!');
  }
  private finishDrawing(p: p5) {
    if (!this.modelLoaded || this.userStroke.length === 0) return;
  
    this.rnnState = this.model.zeroState();
  
    // Process user stroke data
    for (let i = 0; i < this.userStroke.length; i++) {
      let s = this.userStroke[i];
      this.rnnState = this.model.update([s.dx, s.dy, ...s.pen], this.rnnState);
    }
  
    // Initialize with pen down (penDown=1, penUp=0, penEnd=0)
    let [dx, dy, penDown, penUp, penEnd] = this.model.zeroInput();
  
    const drawStep = () => {
      if (penEnd === 1) return; // Stop if drawing is complete
  
      // Update the RNN state with the previous step's data
      this.rnnState = this.model.update([dx, dy, penDown, penUp, penEnd], this.rnnState);
      const pdf = this.model.getPDF(this.rnnState, 0.4);
      [dx, dy, penDown, penUp, penEnd] = this.model.sample(pdf);
      
      let newX = this.prevX + dx;
      let newY = this.prevY + dy;
  
      // Visual feedback based on pen state
      if (penDown === 1) {
        // Drawing (pen down) - use the original color
        p.stroke(this.lineColor);
        p.strokeWeight(2);
        p.line(this.prevX, this.prevY, newX, newY);
      } else if (penUp === 1) {
        // Moving without drawing (pen up) - use a different color
        p.stroke(100, 100, 100, 150); // Semi-transparent gray
        p.strokeWeight(1);
        p.line(this.prevX, this.prevY, newX, newY);
      }
  
      // Update position regardless of pen state
      this.prevX = newX;
      this.prevY = newY;
  
      // Continue drawing until penEnd is 1
      if (penEnd !== 1) {
        setTimeout(drawStep, 50);
      }
    };
  
    drawStep();
  }
  
  clearCanvas() {
    if (this.p5Instance) {
      this.p5Instance.clear();
      this.userStroke = [];
    }
  }
}
