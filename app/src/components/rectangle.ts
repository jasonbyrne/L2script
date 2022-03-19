import { Shape } from "./shape";

export class Rectangle extends Shape {
  public static create(name: string) {
    return new Rectangle(name);
  }

  constructor(name: string) {
    super("rect", name);
  }
}
