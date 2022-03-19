import { Shape } from "./shape";

export class Circle extends Shape {
  public static create(name: string) {
    return new Circle(name);
  }

  protected get radiusX(): number {
    return this.points[1].x / 2;
  }

  protected get radiusY(): number {
    return this.points[1].y / 2;
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

  constructor(name: string) {
    super("ellipse", name);
  }

  protected draw() {
    this.domElement.setAttributeNS(null, "cx", this.points[0].x + this.radiusX);
    this.domElement.setAttributeNS(null, "cy", this.points[0].y + this.radiusY);
    this.domElement.setAttributeNS(null, "rx", this.radiusX);
    this.domElement.setAttributeNS(null, "ry", this.radiusY);
  }
}
