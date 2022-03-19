export class Point {
  protected _x: number = 0;
  protected _y: number = 0;

  public get x(): number {
    return this._x;
  }

  public get y(): number {
    return this._y;
  }

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  public toTuple(): [number, number] {
    return [this._x, this._y];
  }

  public toString(): string {
    return `${this._x},${this._y}`;
  }

  public moveBy(x: number | null, y: number | null) {
    this._x += Number(x === null ? 0 : x);
    this._y += Number(y === null ? 0 : y);
  }

  public moveTo(x: number | null, y: number | null) {
    this._x = Number(x === null ? this._x : x);
    this._y = Number(y === null ? this._y : y);
  }
}
