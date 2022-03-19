import { Point } from "./point";
import { Stroke } from "./stroke";

const svgns: string = "http://www.w3.org/2000/svg";

export interface iShape {
  readonly type: string;
  readonly name: string;
  readonly domElement: any;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  points: Point[];
  fill: string;
  text: string;
  stroke: Stroke;
  fontSize: string;
  remove(): void;
  moveBy(x: number | null, y: number | null): void;
  moveTo(x: number | null, y: number | null): void;
  sizeBy(x: number | null, y: number | null): void;
  sizeTo(x: number | null, y: number | null): void;
  setStroke(color: string | null, width: number | null): void;
  setPoints(points: Point[]): void;
}

export abstract class Shape implements iShape {
  public readonly type: string;
  public readonly name: string;
  public readonly domElement: any;

  protected _points: Point[];
  protected _stroke: Stroke;

  public get points(): Point[] {
    return this._points;
  }

  public get x(): number {
    return this.points[0].x;
  }

  public get y(): number {
    return this.points[0].y;
  }

  public get width(): number {
    return this.points[1].x;
  }

  public get height(): number {
    return this.points[1].y;
  }

  public get stroke(): Stroke {
    return this._stroke;
  }

  public get fill(): string {
    return this.domElement.style.fill;
  }

  public set fill(value: string) {
    this.domElement.style.fill = value;
  }

  public get fontSize(): string {
    return this.domElement.style.fontSize;
  }

  public set fontSize(value: string) {
    this.domElement.style.fontSize = value;
  }

  public get text(): string {
    return this.domElement.style.fill;
  }

  public set text(value: string) {
    this.domElement.textContent = value;
  }

  protected constructor(type: string, name: string) {
    this.type = type;
    this.name = name;
    this._points = [new Point(0, 0), new Point(100, 100)];
    this._stroke = new Stroke();
    this.domElement = document.createElementNS(svgns, this.type);
    this.draw();
  }

  public remove() {
    this.domElement.parentNode.removeChild(this.domElement);
  }

  public moveBy(x: number | null, y: number | null) {
    this.points[0].moveBy(x, y);
    this.draw();
  }

  public moveTo(x: number | null, y: number | null) {
    this.points[0].moveTo(x, y);
    this.draw();
  }

  public sizeBy(x: number | null, y: number | null) {
    this.points[1].moveBy(x, y);
    this.draw();
  }

  public sizeTo(x: number | null, y: number | null) {
    this.points[1].moveTo(x, y);
    this.draw();
  }

  public setStroke(color: string | null, width: number | null) {
    this._stroke = new Stroke(
      color === null ? this.stroke.color : color,
      width === null ? this.stroke.width : width
    );
    this.domElement.setAttributeNS(null, "stroke", this.stroke.color);
    this.domElement.setAttributeNS(null, "stroke-width", this.stroke.width);
  }

  public setPoints(points: Point[]) {
    this._points = points;
    this.draw();
  }

  protected draw() {
    this.domElement.setAttributeNS(null, "x", this.points[0].x);
    this.domElement.setAttributeNS(null, "y", this.points[0].y);
    this.domElement.setAttributeNS(null, "width", this.points[1].x);
    this.domElement.setAttributeNS(null, "height", this.points[1].y);
  }
}
