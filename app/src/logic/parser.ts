import { Canvas } from "../canvas";
import { forEachPromise } from "../util";

export type WithElement = string | null;

interface iLanguagePattern {
  pattern: RegExp;
  action: Function;
  getWith?: Function;
}

interface MatchedCommand {
  command: iLanguagePattern;
  withElement: WithElement;
  matches: RegExpMatchArray;
}

export class Parser {
  constructor(
    private readonly canvas: Canvas,
    private readonly log: (message: string) => void
  ) {
    this.canvas.reset();
  }

  private lastWith: WithElement = null;
  private lines: string[] = [];

  private syntax: iLanguagePattern[] = [
    {
      pattern: /^reset$/i,
      action: this.canvas.reset,
    },
    {
      pattern: /^wait ([0-9]+) ?([a-z]+)?$/i,
      action: (timeout: number, units: string) => {
        return this.canvas.wait(timeout, units);
      },
    },
    {
      pattern: /^set ([a-z]+) (=)? ?([a-z][a-z0-9]*)$/i,
      action: (name: string, op: string, value: string) => {
        this.canvas.setVariable(name, value);
      },
    },
    {
      pattern: /^new ([a-z]+) (as)? ?([a-z][a-z0-9]*)$/i,
      action: (type: string, op: string, name: string) => {
        this.canvas.createItem(name || null, type);
      },
      getWith: (type: string, op: string, name: string) => {
        return name;
      },
    },
    {
      pattern: /^clone ([a-z]+) (as)? ?([a-z][a-z0-9]*)$/i,
      action: (fromName: string, op: string, toName: string) => {
        this.canvas.clone(fromName, toName || null);
      },
      getWith: (fromName: string, op: string, toName: string) => {
        return toName;
      },
    },
    {
      pattern: /^with ([a-z][a-z0-9]*)$/i,
      action: (name: string) => {
        this.canvas.setWith(name);
      },
      getWith: (name: string) => {
        return name;
      },
    },
    {
      pattern: /^remove ([a-z][a-z0-9]*)$/i,
      action: (name: string) => {
        this.canvas.remove(name);
      },
    },
    {
      pattern: /^move ([a-z][a-z0-9]*) (by|to)? ?(-?[0-9]+)?,(-?[0-9]+)?$/i,
      action: (name: string, op: string, x: number, y: number) => {
        if (op == "by") {
          return this.canvas.moveBy(name, x, y);
        }
        return this.canvas.moveTo(name, x, y);
      },
      getWith: (name: string) => {
        return name;
      },
    },
    {
      pattern: /^size ([a-z][a-z0-9]*) (by|to)? ?(-?[0-9]+)?,(-?[0-9]+)?$/i,
      action: (name: string, op: string, x: number, y: number) => {
        if (op == "by") {
          return this.canvas.sizeBy(name, x, y);
        }
        return this.canvas.sizeTo(name, x, y);
      },
      getWith: (name: string) => {
        return name;
      },
    },
    {
      pattern: /^paint ([a-z][a-z0-9]*) ([a-z]+|#[a-f0-9]{3,9})$/i,
      action: (name: string, color: string) => {
        this.canvas.paint(name, color);
      },
      getWith: (name: string) => {
        return name;
      },
    },
    {
      pattern:
        /^outline ([a-z][a-z0-9]*) ([a-z]+|#[a-f0-9]{3,9})? ?([0-9]+)?$/i,
      action: (name: string, color: string, thickness: number) => {
        this.canvas.setStroke(name, color, thickness);
      },
      getWith: (name: string) => {
        return name;
      },
    },
    {
      pattern: /^write ([a-z][a-z0-9]*) (.+)$/i,
      action: (name: string, str: string) => {
        this.canvas.write(name, str);
      },
      getWith: (name: string) => {
        return name;
      },
    },
    {
      pattern: /^points ([a-z][a-z0-9]*) ([-0-9, ]+)$/i,
      action: (name: string, points: string) => {
        // this is not ideal
        this.canvas.setPoints(name, points.split(" "));
      },
    },
  ];

  private getCommand(line: string): MatchedCommand | null {
    let output: MatchedCommand | null = null;
    this.syntax.some((command) => {
      const matches = line.match(command.pattern);
      if (matches !== null) {
        const withElement: WithElement =
          command.getWith &&
          command.getWith.apply(this.canvas, matches.slice(1));
        output = {
          matches,
          command,
          withElement,
        };
        return true;
      }
      return false;
    });
    return output;
  }

  private cleanLine(line: string): string {
    line = line.replace(/\s/g, " ");
    line = line.trimRight();
    return line;
  }

  private replaceShorthandWith(line: string): string {
    // If it starts with spaces, add in the with name
    if (/^ +/.test(line) && this.lastWith !== null) {
      line = (() => {
        let arr: string[] = line.trim().split(" ");
        arr.splice(1, 0, this.lastWith);
        return arr.join(" ");
      })();
    }
    return line;
  }

  public compile(code: string) {
    const lines = code ? code.split("\n") : [];
    this.lines = lines.map((line) => {
      line = this.cleanLine(line);
      line = this.replaceShorthandWith(line);
      const command = this.getCommand(line);
      if (command && command.withElement) {
        this.lastWith = command.withElement;
      }
      return line;
    });
  }

  public async execute() {
    let lineNumber = 1;
    for (let i = 0; i < this.lines.length; i++) {
      let line = this.lines[i];
      // Increment line number
      lineNumber += 1;
      // Ignore blank lines
      if (line.length) {
        // Echo line
        this.log(line);
        // Parse from regular expressions
        const command = this.getCommand(line);
        if (command === null) {
          this.log(`Invalid command: ${line}`);
          return null;
        }
        await command.command.action.apply(
          this.canvas,
          command.matches.slice(1)
        );
      }
    }
  }
}
