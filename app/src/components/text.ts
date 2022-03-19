import { Shape } from "./shape";

export class Text extends Shape {
  public static create(name: string) {
    return new Text(name);
  }

  constructor(name: string) {
    super("text", name);
  }
}
