import { Canvas } from "../canvas";
import { iShape } from "../components/shape";
import { formatAMPM } from "../util";

interface iLanguagePattern {
  pattern: RegExp;
  action: Function;
  getContext?: Function;
}

interface MatchedCommand {
  command: iLanguagePattern;
  context: Context;
  matches: RegExpMatchArray;
}

interface WithContext {
  type: "with";
  value: string;
}

interface IfContext {
  type: "if";
  value: boolean;
}

interface NullContext {
  type: "null";
  value: null;
}

type Context = WithContext | IfContext | NullContext;

export class Parser {
  constructor(
    private readonly canvas: Canvas,
    private readonly log: (message: string) => void
  ) {
    this.canvas.reset();
  }

  private lastContext: Context = this.nullContext();
  private lines: string[] = [];
  private strings: { [key: string]: string } = {};
  private numbers: { [key: string]: number } = {};
  private objects: { [key: string]: iShape } = {};
  private lineNumber: number | null = 0;
  private marker: { [key: string]: number } = {};

  private withContext(element: string): WithContext {
    return {
      type: "with",
      value: element,
    };
  }

  private nullContext(): NullContext {
    return {
      type: "null",
      value: null,
    };
  }

  private IfContext(value: boolean): IfContext {
    return {
      type: "if",
      value: value,
    };
  }

  private syntax: iLanguagePattern[] = [
    {
      pattern: /^reset$/i,
      action: this.canvas.reset,
    },
    {
      pattern: /^end$/i,
      action: () => {
        this.lineNumber = this.lines.length + 1;
      },
    },
    {
      pattern: /^wait ([0-9]+) ([a-z]+)?$/i,
      action: (timeout: number, units: string) => {
        return this.canvas.wait(timeout, units);
      },
    },
    {
      pattern: /^string ([a-z][a-z0-9]*) (=) ([a-z0-9]+)$/i,
      action: (name: string, op: string, value: string) => {
        this.strings[name] = value;
      },
    },
    {
      pattern: /^number ([a-z][a-z0-9]*) (=) ([0-9]+) + ([0-9]+)$/i,
      action: (name: string, op: string, valueA: number, valueB: number) => {
        this.numbers[name] = Number(valueA) + Number(valueB);
      },
    },
    {
      pattern: /^number ([a-z][a-z0-9]*) ?(=) ?([0-9]+)$/i,
      action: (name: string, op: string, value: number) => {
        this.numbers[name] = Number(value);
      },
    },
    {
      pattern: /^object ([a-z][a-z0-9]*) ?(=) ?new ([a-z][a-z0-9]*)$/i,
      action: (name: string, op: string, type: string) => {
        const shape = this.canvas.createItem(name, type);
        if (shape) this.objects[name] = shape;
      },
      getContext: (name: string) => {
        return this.withContext(name);
      },
    },
    {
      pattern: /^object ([a-z][a-z0-9]*) ?(=) ?clone ([a-z][a-z0-9]*)$/i,
      action: (toName: string, op: string, fromName: string) => {
        const shape = this.canvas.clone(fromName, toName);
        if (shape) this.objects[toName] = shape;
      },
      getContext: (toName: string) => {
        return this.withContext(toName);
      },
    },
    {
      pattern: /^goto line ([0-9]+)$/i,
      action: (lineNumber: number) => {
        this.lineNumber = lineNumber - 1; // Set it to minus one because it will increment
      },
    },
    {
      pattern: /^goto mark ([A-Za-z][A-Za-z0-9]*)$/i,
      action: (markerName: string) => {
        this.lineNumber = this.marker[markerName] || 1;
      },
    },
    {
      pattern: /^mark ([A-Za-z][A-Za-z0-9]*)$/i,
      action: (markerName: string) => {
        this.marker[markerName] = this.lineNumber || 1;
      },
    },
    {
      pattern: /^with ([a-z][a-z0-9]*)$/i,
      action: (name: string) => {
        return this.withContext(name);
      },
      getContext: (name: string) => {
        return this.withContext(name);
      },
    },
    {
      pattern: /^remove ([a-z][a-z0-9]*)$/i,
      action: (name: string) => {
        this.canvas.remove(name);
      },
    },
    {
      pattern: /^move ([a-z][a-z0-9]*) (by|to) (-?[0-9]+), ?(-?[0-9]+)$/i,
      action: (name: string, op: string, x: number, y: number) => {
        if (op == "by") {
          return this.canvas.moveBy(name, x, y);
        }
        return this.canvas.moveTo(name, x, y);
      },
      getContext: (name: string) => {
        return this.withContext(name);
      },
    },
    {
      pattern: /^size ([a-z][a-z0-9]*) (by|to) (-?[0-9]+), ?(-?[0-9]+)$/i,
      action: (name: string, op: string, x: number, y: number) => {
        if (op == "by") {
          return this.canvas.sizeBy(name, x, y);
        }
        return this.canvas.sizeTo(name, x, y);
      },
      getContext: (name: string) => {
        return this.withContext(name);
      },
    },
    {
      pattern: /^paint ([a-z][a-z0-9]*) ([a-z]+|#[a-f0-9]{3,9})$/i,
      action: (name: string, color: string) => {
        this.canvas.paint(name, color);
      },
      getContext: (name: string) => {
        return this.withContext(name);
      },
    },
    {
      pattern: /^outline ([a-z][a-z0-9]*) ([a-z]+|#[a-f0-9]{3,9}) ?([0-9]+)?$/i,
      action: (name: string, color: string, thickness: number) => {
        this.canvas.setStroke(name, color, thickness);
      },
      getContext: (name: string) => {
        return this.withContext(name);
      },
    },
    {
      pattern: /^write ([a-z][a-z0-9]*) (.+)$/i,
      action: (name: string, str: string) => {
        this.canvas.write(name, str);
      },
      getContext: (name: string) => {
        return this.withContext(name);
      },
    },
    {
      pattern: /^fontSize ([a-z][a-z0-9]*) ([0-9]+)$/i,
      action: (name: string, size: number) => {
        this.canvas.setFontSize(name, size);
      },
      getContext: (name: string) => {
        return this.withContext(name);
      },
    },
    {
      pattern: /^points ([a-z][a-z0-9]*) ([-0-9, ]+)$/i,
      action: (name: string, points: string) => {
        // this is not ideal
        this.canvas.setPoints(name, points.split(" "));
      },
      getContext: (name: string) => {
        return this.withContext(name);
      },
    },
    {
      pattern: /^print (.+)$/i,
      action: (str: string) => {
        str = this.replaceSystemVariables(str);
        str = this.replaceStringVariables(str);
        str = this.replaceNumberVariables(str);
        this.log(str);
      },
    },
  ];

  private getCommand(line: string): MatchedCommand | null {
    let output: MatchedCommand | null = null;
    this.syntax.some((command) => {
      const matches = line.match(command.pattern);
      if (matches !== null) {
        const context: Context | undefined =
          command.getContext &&
          command.getContext.apply(this.canvas, matches.slice(1));
        output = {
          matches,
          command,
          context: context || this.lastContext,
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
    if (/^ +/.test(line) && this.lastContext.type == "with") {
      line = (() => {
        let arr: string[] = line.trim().split(" ");
        arr.splice(1, 0, this.lastContext.value);
        return arr.join(" ");
      })();
    }
    console.log(line);
    return line;
  }

  private replaceNumberVariables(line: string): string {
    Object.entries(this.numbers).forEach((variable) => {
      line = line.replace(
        new RegExp(`%${variable[0]}`, "g"),
        String(variable[1])
      );
    });
    return line;
  }

  private replaceStringVariables(line: string): string {
    Object.entries(this.strings).forEach((variable) => {
      line = line.replace(new RegExp(`%${variable[0]}`, "g"), variable[1]);
    });
    return line;
  }

  private replaceSystemVariables(line: string): string {
    line = line.replace(/%TIME/g, formatAMPM(new Date()));
    line = line.replace(
      /%DATE/g,
      new Date().toLocaleDateString("en-us", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    );
    return line;
  }

  public compile(code: string) {
    const lines = code ? code.split("\n") : [];
    this.lines = lines.map((line) => {
      line = this.cleanLine(line);
      line = this.replaceShorthandWith(line);
      const command = this.getCommand(line);
      if (command && command.context) {
        this.lastContext = command.context;
      }
      return line;
    });
  }

  public async execute(startLine: number = 1) {
    const startIndex = startLine - 1;
    const length = this.lines.length - startIndex;
    this.lineNumber = startLine;
    for (; this.lineNumber <= length; ) {
      let line = this.lines[this.lineNumber - 1];
      line = this.replaceSystemVariables(line);
      line = this.replaceStringVariables(line);
      line = this.replaceNumberVariables(line);
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
      this.lineNumber += 1;
    }
  }
}
