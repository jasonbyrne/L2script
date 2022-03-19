import { Shape } from "./shape";
import { Point } from "./point";

export class Line extends Shape {
  public get width(): number {
    return this.points[1].x;
  }

  public get height(): number {
    return this.points[1].y;
  }

  public static create(name: string) {
    return new Line(name);
  }

  constructor(name: string) {
    super("polyline", name);
    this._points = [new Point(10, 10), new Point(100, 10)];
    this.fill = "none";
    this.draw();
  }

  public moveBy(x: number | null, y: number | null) {
    this.points.forEach((point) => {
      point.moveBy(x, y);
    });
    this.draw();
  }

  public moveTo(x: number | null, y: number | null) {
    const prevPoints: [number, number] = this.points[0].toTuple();
    this.points[0].moveTo(x, y);
    const diffPoints: [number, number] = [
      this.points[0].x - prevPoints[0],
      this.points[0].y - prevPoints[1],
    ];
    this.points.forEach((point, i) => {
      // Don't move the first point again
      if (i > 0) {
        point.moveBy(diffPoints[0], diffPoints[1]);
      }
    });
    this.draw();
  }

  protected draw() {
    this.domElement.setAttributeNS(
      null,
      "points",
      this._points.map((point) => point.toString()).join(" ")
    );
  }
}
