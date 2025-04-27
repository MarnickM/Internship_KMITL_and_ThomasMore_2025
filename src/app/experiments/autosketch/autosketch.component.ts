import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import p5 from 'p5';
// import * as ml5 from 'ml5';

@Component({
  selector: 'app-auto-sketch',
  template: '<div #autoSketchContainer class="auto-sketch-container"></div>',
  styles: [`
    .auto-sketch-container {
      border: 1px solid #ccc;
      margin: 10px;
    }
  `]
})
export class AutoSketchComponent implements OnInit, OnDestroy {
  @ViewChild('autoSketchContainer', { static: true }) autoSketchContainer!: ElementRef;
  private p5Instance!: p5;
  private sketchRNN: any;
  private currentStroke: any;
  private x = 0;
  private y = 0;
  private nextPen = 'down';
  private seedPath: any[] = [];
  private seedPoints: any[] = [];
  private personDrawing = false;

  ngOnInit(): void {
    this.initializeSketch();
  }

  ngOnDestroy(): void {
    if (this.p5Instance) {
      this.p5Instance.remove();
    }
  }

  private initializeSketch(): void {
    this.p5Instance = new p5((p: p5) => {
      p.preload = () => {
        // @ts-ignore
        this.sketchRNN = ml5.sketchRNN('cat', () => {
          console.log('Model loaded');
        });
      };

      p.setup = () => {
        const canvas = p.createCanvas(400, 400).parent(this.autoSketchContainer.nativeElement);
        canvas.mousePressed(() => this.startDrawing(p));
        canvas.mouseReleased(() => this.sketchRNNStart(p));
        p.background(255);
        this.x = p.width / 2;
        this.y = p.height / 2;
      };

      p.draw = () => {
        p.stroke(0);
        p.strokeWeight(4);

        if (this.personDrawing) {
          p.line(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
          this.seedPoints.push(p.createVector(p.mouseX, p.mouseY));
        }

        if (this.currentStroke) {
          if (this.nextPen === 'end') {
            this.sketchRNN.reset();
            this.sketchRNNStart(p);
            this.currentStroke = null;
            this.nextPen = 'down';
            return;
          }

          if (this.nextPen === 'down') {
            p.line(this.x, this.y, this.x + this.currentStroke.dx, this.y + this.currentStroke.dy);
          }
          this.x += this.currentStroke.dx;
          this.y += this.currentStroke.dy;
          this.nextPen = this.currentStroke.pen;
          this.currentStroke = null;
          this.sketchRNN.generate(this.gotStrokePath.bind(this));
        }
      };
    });
  }

  private startDrawing(p: p5): void {
    this.personDrawing = true;
    this.x = p.mouseX;
    this.y = p.mouseY;
    this.seedPoints = [];
  }

  private sketchRNNStart(p: p5): void {
    this.personDrawing = false;

    // Perform RDP Line Simplification
    const rdpPoints: any[] = [];
    const total = this.seedPoints.length;
    if (total < 2) return;

    const start = this.seedPoints[0];
    const end = this.seedPoints[total - 1];
    rdpPoints.push(start);
    this.rdp(0, total - 1, this.seedPoints, rdpPoints, p);
    rdpPoints.push(end);

    // Drawing simplified path
    p.background(255);
    p.stroke(0);
    p.strokeWeight(4);
    p.beginShape();
    p.noFill();
    for (const v of rdpPoints) {
      p.vertex(v.x, v.y);
    }
    p.endShape();

    this.x = rdpPoints[rdpPoints.length - 1].x;
    this.y = rdpPoints[rdpPoints.length - 1].y;

    this.seedPath = [];
    // Converting to SketchRNN states
    for (let i = 1; i < rdpPoints.length; i++) {
      const strokePath = {
        dx: rdpPoints[i].x - rdpPoints[i - 1].x,
        dy: rdpPoints[i].y - rdpPoints[i - 1].y,
        pen: 'down'
      };
      this.seedPath.push(strokePath);
    }

    this.sketchRNN.generate(this.seedPath, this.gotStrokePath.bind(this));
  }

  private gotStrokePath(error: any, strokePath: any): void {
    if (error) {
      console.error(error);
      return;
    }
    this.currentStroke = strokePath;
  }

  // Ramer-Douglas-Peucker algorithm for line simplification
  private rdp(startIndex: number, endIndex: number, points: any[], rdpPoints: any[], p: p5, epsilon = 2.0): void {
    if (startIndex >= endIndex - 1) return;

    const startPoint = points[startIndex];
    const endPoint = points[endIndex];
    let maxDistance = 0;
    let maxIndex = 0;

    for (let i = startIndex + 1; i < endIndex; i++) {
      const currentPoint = points[i];
      const distance = this.pointToLineDistance(currentPoint, startPoint, endPoint, p);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    if (maxDistance > epsilon) {
      this.rdp(startIndex, maxIndex, points, rdpPoints, p, epsilon);
      rdpPoints.push(points[maxIndex]);
      this.rdp(maxIndex, endIndex, points, rdpPoints, p, epsilon);
    }
  }

  private pointToLineDistance(point: any, lineStart: any, lineEnd: any, p: p5): number {
    const numerator = Math.abs(
      (lineEnd.y - lineStart.y) * point.x -
      (lineEnd.x - lineStart.x) * point.y +
      lineEnd.x * lineStart.y -
      lineEnd.y * lineStart.x
    );
    const denominator = p.dist(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
    return numerator / denominator;
  }
}