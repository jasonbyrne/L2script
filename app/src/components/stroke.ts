export class Stroke {
  protected _width: number;
  protected _color: string;

  public get color(): string {
    return this._color;
  }

  public get width(): number {
    return this._width;
  }

  constructor(color: string = "transparent", width: number = 1) {
    this._color = color;
    this._width = width;
  }
}
