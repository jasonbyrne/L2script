import { Point } from "./components/point";
import { Text } from "./components/text";
import { Circle } from "./components/circle";
import { Rectangle } from "./components/rectangle";
import { Line } from "./components/line";
import { Polygon } from "./components/polygon";
import { iShape } from "./components/shape";
import { formatAMPM, generateName } from "./util";

const svgns: string = "http://www.w3.org/2000/svg";
const varNamingRule: RegExp = /[A-Za-z][A-Za-z0-9]+/;
const objectTypes: { [key: string]: (name: string) => iShape } = {
  text: Text.create,
  circle: Circle.create,
  ellipse: Circle.create,
  rectangle: Rectangle.create,
  rect: Rectangle.create,
  line: Line.create,
  polyline: Line.create,
  polygon: Polygon.create,
};

export class Canvas {
  protected _svg: Element;
  protected _items: { [key: string]: iShape } = {};
  protected _timers: NodeJS.Timeout[] = [];
  protected _errorListeners: ((message: string) => void)[] = [];
  protected _infoListeners: ((message: string) => void)[] = [];
  protected _withItemName: string | null = null;

  constructor(width: number, height: number) {
    this._svg = document.createElementNS(svgns, "svg");
    this._svg.setAttribute("class", "canvas");
    this._svg.setAttribute("width", width.toString());
    this._svg.setAttribute("height", height.toString());
  }

  public onError(callback: (message: string) => void) {
    this._errorListeners.push(callback);
  }

  public onInfo(callback: (message: string) => void) {
    this._infoListeners.push(callback);
  }

  public getDomElement(): Element {
    return this._svg;
  }

  public getItem(varName: string): iShape | null {
    const item = this._items[varName];
    if (item) {
      return item;
    }
    return this._publishError(`There was no object called ${varName}.`);
  }

  public createItem(varName: string | null, type: string): iShape | null {
    varName = varName || generateName();
    if (this._items[varName]) {
      return this._publishError(
        `There is already an object called ${varName}, you can't use the same name.`
      );
    }
    if (!varNamingRule.test(varName)) {
      return this._publishError(
        `Name of your object must start with a letter and contain only letters or numbers.`
      );
    }
    if (!type) {
      return this._publishError(
        `You must set a type of object to create, like this: new text title`
      );
    }
    if (!objectTypes[type]) {
      return this._publishError(
        `${type} not a valid object type, must be one of these: ${Object.keys(
          objectTypes
        ).join(", ")}`
      );
    }
    const item = (this._items[varName] = objectTypes[type](varName));
    this._withItemName = varName;
    item.domElement.innerHTML = `<title>${item.name}</title>`;
    this._svg.appendChild(item.domElement);
    this._publishInfo(`Created ${type} object called ${varName}`);
    return item;
  }

  public clone(
    fromVarName: string | null,
    toVarName: string | null
  ): iShape | null {
    const fromItem = this.getItem(fromVarName || String(this.getWith()));
    if (fromItem) {
      toVarName = toVarName || generateName();
      const toItem = this.createItem(toVarName, fromItem.type);
      if (toItem) {
        // Need to make a copy by value, not by reference
        let points: Point[] = [];
        fromItem.points.forEach((point: Point) => {
          points.push(new Point(point.x, point.y));
        });
        toItem.setPoints(points);
        toItem.fill = fromItem.fill;
        toItem.setStroke(fromItem.stroke.color, fromItem.stroke.width);
        this._withItemName = toVarName;
        this._svg.appendChild(toItem.domElement);
        this._publishInfo(`Cloned ${fromVarName} as ${toVarName}`);
        return toItem;
      }
    }
    return null;
  }

  public remove(varName: string | null) {
    varName = varName || String(this.getWith());
    const item = this.getItem(varName);
    if (item) {
      item.remove();
      delete this._items[varName];
      delete this[`${varName}.text`];
      return this._publishInfo(`Removing object called ${varName}`);
    }
    return this._publishError(`There was no object called ${varName}`);
  }

  public paint(varName: string | null, color: string): iShape | null {
    varName = varName || String(this.getWith());
    const item = this.getItem(varName);
    if (item) {
      item.fill = color;
      this._withItemName = varName;
      this._publishInfo(`Painting ${varName} ${color}`);
      return item;
    }
    return null;
  }

  public setFontSize(varName: string | null, size: number): iShape | null {
    varName = varName || String(this.getWith());
    const item = this.getItem(varName);
    if (item) {
      item.fontSize = `${size}pt`;
      this._withItemName = varName;
      this._publishInfo(`Sizing ${varName} to ${size}pt`);
      return item;
    }
    return null;
  }

  public write(varName: string | null, text: string): iShape | null {
    varName = varName || String(this.getWith());
    const item = this.getItem(varName);
    if (item) {
      item.text = text;
      this._publishInfo(`Wrote "${text}" in ${varName}`);
      return item;
    }
    return null;
  }

  public setStroke(
    varName: string | null,
    color: string | null,
    width: number | null
  ): iShape | null {
    varName = varName || String(this.getWith());
    const item = this.getItem(varName);
    if (item) {
      item.setStroke(color, width);
      this._publishInfo(
        `Set ${varName} stroke color to ${color} and width to ${width}`
      );
      return item;
    }
    return null;
  }

  public moveTo(
    varName: string | null,
    x: number | null,
    y: number | null
  ): iShape | null {
    varName = varName || String(this.getWith());
    const item = this.getItem(varName);
    if (item) {
      x = typeof x == "undefined" ? null : x;
      y = typeof y == "undefined" ? null : y;
      item.moveTo(x, y);
      this._publishInfo(`Moved ${varName} to ${item.x},${item.y}`);
      return item;
    }
    return null;
  }

  public moveBy(
    varName: string | null,
    x: number | null,
    y: number | null
  ): iShape | null {
    varName = varName || String(this.getWith());
    const item = this.getItem(varName);
    if (item) {
      x = typeof x == "undefined" ? null : x;
      y = typeof y == "undefined" ? null : y;
      item.moveBy(x, y);
      this._publishInfo(`Moved ${varName} to ${item.x},${item.y}`);
    }
    return null;
  }

  public sizeTo(
    varName: string | null,
    x: number | null,
    y: number | null
  ): iShape | null {
    varName = varName || String(this.getWith());
    const item = this.getItem(varName);
    if (item) {
      x = typeof x == "undefined" ? null : x;
      y = typeof y == "undefined" ? null : y;
      item.sizeTo(x, y);
      this._publishInfo(`Sized ${varName} to ${item.width},${item.height}`);
      return item;
    }
    return null;
  }

  public sizeBy(
    varName: string | null,
    x: number | null,
    y: number | null
  ): iShape | null {
    varName = varName || String(this.getWith());
    const item = this.getItem(varName);
    if (item) {
      x = typeof x == "undefined" ? null : x;
      y = typeof y == "undefined" ? null : y;
      item.sizeBy(x, y);
      this._publishInfo(`Sized ${varName} to ${item.width},${item.height}`);
      return item;
    }
    return null;
  }

  public setPoints(varName: string | null, points: string[]): iShape | null {
    varName = varName || String(this.getWith());
    const item = this.getItem(varName);
    if (item) {
      let arrPoints: Point[] = [];
      points.forEach((point) => {
        const arrPoint = point.split(",");
        arrPoints.push(new Point(Number(arrPoint[0]), Number(arrPoint[1])));
      });
      item.setPoints(arrPoints);
      this._publishInfo(`Set points ${varName} to ${item.points}`);
      return item;
    }
    return null;
  }

  public reset() {
    // Clear out everything
    this._svg.innerHTML = "";
    this._items = {};
    this._timers.forEach((timer) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    this._timers = [];
    this._withItemName = null;
  }

  public getWith(): string | null {
    return this._withItemName;
  }

  public setWith(varName: string): iShape | null {
    const item = this.getItem(varName);
    if (item) {
      this._withItemName = varName;
      this._publishInfo(`Set currently selected object as ${varName}`);
      return item;
    }
    return null;
  }

  public wait(n: number, unitName: string = "milliseconds"): Promise<void> {
    let units: string = "milliseconds";
    const factor: number = (() => {
      if (/^(seconds?|sec|s)$/i.test(unitName)) {
        units = "second";
        return 1000;
      }
      return 1;
    })();
    const ms = (n > 0 ? n : 1000) * factor;
    this._publishInfo(`Waiting for ${n} ${units + (n > 1 ? "s" : "")}`);
    return new Promise((resolve) => {
      this._timers.push(
        setTimeout(() => {
          this._publishInfo(
            `${n} ${units + (n > 1 ? "s" : "")} timer finished`
          );
          resolve();
        }, ms)
      );
    });
  }

  protected _publishError(message: string): null {
    this._errorListeners.forEach((callback) => {
      callback(message);
    });
    return null;
  }

  protected _publishInfo(message: string) {
    this._infoListeners.forEach((callback) => {
      callback(message);
    });
  }
}
