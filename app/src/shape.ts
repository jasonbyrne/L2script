const svgns: string = "http://www.w3.org/2000/svg";

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

export class Stroke {

    protected _width: number;
    protected _color: string;

    public get color(): string {
        return this._color;
    }

    public get width(): number {
        return this._width;
    }

    constructor(color: string = 'transparent', width: number = 1) {
        this._color = color;
        this._width = width;
    }

}

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
    remove(): void;
    moveBy(x: number | null, y: number | null): void;
    moveTo(x: number | null, y: number | null): void;
    sizeBy(x: number | null, y: number | null): void;
    sizeTo(x: number | null, y: number | null): void;
    setStroke(color: string | null, width: number | null): void;
    setPoints(points: Point[]): void;
}

abstract class Shape implements iShape {

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
            (color === null ? this.stroke.color : color),
            (width === null ? this.stroke.width : width)
        );
        this.domElement.setAttributeNS(null, 'stroke', this.stroke.color);
        this.domElement.setAttributeNS(null, 'stroke-width', this.stroke.width);
    }
    
    public setPoints(points: Point[]) {
        this._points = points;
        this.draw();
    }

    protected draw() {
        this.domElement.setAttributeNS(null, 'x', this.points[0].x);
        this.domElement.setAttributeNS(null, 'y', this.points[0].y);
        this.domElement.setAttributeNS(null, 'width', this.points[1].x);
        this.domElement.setAttributeNS(null, 'height', this.points[1].y);
    }

}

export class Text extends Shape {

    public static create(name: string) {
        return new Text(name);
    }

    constructor(name: string) {
        super('text', name);
    }

}

export class Rectangle extends Shape {

    public static create(name: string) {
        return new Rectangle(name);
    }

    constructor(name: string) {
        super('rect', name);
    }

}

export class Circle extends Shape {

    public static create(name: string) {
        return new Circle(name);
    }

    protected get radiusX(): number {
        return (this.points[1].x / 2);
    }

    protected get radiusY(): number {
        return (this.points[1].y / 2);
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
        super('ellipse', name);
    }

    protected draw() {
        this.domElement.setAttributeNS(null, 'cx', this.points[0].x + this.radiusX);
        this.domElement.setAttributeNS(null, 'cy', this.points[0].y + this.radiusY);
        this.domElement.setAttributeNS(null, 'rx', this.radiusX);
        this.domElement.setAttributeNS(null, 'ry', this.radiusY);
    }

}

export class Line extends Shape {

    public static create(name: string) {
        return new Line(name);
    }

    public get fill(): string {
        return this.domElement.getAttributeNS(null, 'stroke');
    }

    public set fill(value: string) {
        this.domElement.setAttributeNS(null, 'stroke', value);
    }

    constructor(name: string) {
        super('polyline', name);
        this._points = [
            new Point(0, 0), new Point(100, 0)
        ];
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
            this.points[0].y - prevPoints[1]
        ];
        this.points.forEach((point, i) => {
            // Don't move the first point again
            if (i > 0) {
                point.moveBy(diffPoints[0], diffPoints[1]);
            }
        })
        this.draw();
    }

    protected draw() {
        this.domElement.setAttributeNS(null, 'points', this._points.map(point => point.toString()).join(' '));
    }

}


export class Polygon extends Shape {

    public static create(name: string) {
        return new Polygon(name);
    }

    public get width(): number {
        return this.points[1].x;
    }

    public get height(): number {
        return this.points[1].y;
    }

    public get fill(): string {
        return this.domElement.getAttributeNS(null, 'fill');
    }

    public set fill(value: string) {
        this.domElement.setAttributeNS(null, 'fill', value);
    }

    constructor(name: string) {
        super('polygon', name);
        this._points = [
            new Point(0, 0), new Point(100, 0), new Point(150, 100), new Point(50, 100)
        ];
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
            this.points[0].y - prevPoints[1]
        ];
        this.points.forEach((point, i) => {
            // Don't move the first point again
            if (i > 0) {
                point.moveBy(diffPoints[0], diffPoints[1]);
            }
        })
        this.draw();
    }

    protected draw() {
        this.domElement.setAttributeNS(null, 'points', this._points.map(point => point.toString()).join(' '));
    }

}
