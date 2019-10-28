import { forEachPromise } from './util';
import { Canvas } from './canvas';

// Setup DOM
const scriptConsole = document.getElementById('console');
const output = document.getElementById('output');
const code = document.getElementById('code');
const lineNumbers = document.getElementById('lineNumbers');

const canvas: Canvas = new Canvas(640, 480);
output && output.appendChild(canvas.getDomElement());

canvas.onError(message => {
    log(message);
});

canvas.onInfo(message => {
    log(message);
});

// Console line
let lastConsoleLineNumber: number = 0;
const log = (message: string) => {
    const logItem = document.createElement('div');
    logItem.className = `line l${lineNumber}`
    logItem.innerHTML = `
        <span class="lineNumber">${lastConsoleLineNumber == lineNumber ? '' : lineNumber}</span>
        <span class="message">${message}</span>
    `;
    if (scriptConsole) {
        scriptConsole.appendChild(logItem);
        scriptConsole.scrollTop = scriptConsole.scrollHeight;
    }
    lastConsoleLineNumber = lineNumber;
}

// Commands
const cleanCommand = (line: string) => {
    const words = line.trim().split(' ');
    const removeWords = [' '];
    // Filter out banned words
    let out: string[] = [];
    for (let i = 0; i < words.length; i++) {
        if (removeWords.indexOf(words[i]) < 0) {
            out.push(words[i]);
        }
    }
    // But if line started with a space, inject the last with object
    if (/^\s/.test(line)) {
        out.splice(1, 0, String(canvas.getWith()));
    }
    // Return it
    return out;
}

interface iLanguagePattern {
    pattern: RegExp
    action: Function
    getWith?: Function
}

const languagePatterns: iLanguagePattern[] = [
    {
        pattern: /^reset$/i,
        action: canvas.reset
    },
    {
        pattern: /^wait ([0-9]+) ?([a-z]+)?$/i,
        action: (timeout: number, units: string) => {
            return canvas.wait(timeout, units);
        }
    },
    {
        pattern: /^set ([a-z]+) (=)? ?([a-z][a-z0-9]*)$/i,
        action: (name: string, op: string, value: string) => {
            canvas.setVariable(name, value);
        }
    },
    {
        pattern: /^new ([a-z]+) (as)? ?([a-z][a-z0-9]*)$/i,
        action: (type: string, op: string, name: string) => {
            canvas.createItem(name || null, type);
        },
        getWith: (type: string, op: string, name: string) => {
            return name;
        }
    },
    {
        pattern: /^clone ([a-z]+) (as)? ?([a-z][a-z0-9]*)$/i,
        action: (fromName: string, op: string, toName: string) => {
            canvas.clone(fromName, toName || null);
        },
        getWith: (fromName: string, op: string, toName: string) => {
            return toName;
        }
    },
    {
        pattern: /^with ([a-z][a-z0-9]*)$/i,
        action: (name: string) => { canvas.setWith(name); },
        getWith: (name: string) => { return name; }
    },
    {
        pattern: /^remove ([a-z][a-z0-9]*)$/i,
        action: (name: string) => { canvas.remove(name); }
    },
    {
        pattern: /^move ([a-z][a-z0-9]*) (by|to)? ?(-?[0-9]+)?,(-?[0-9]+)?$/i,
        action: (name: string, op: string, x: number, y: number) => {
            if (op == 'by') {
                return canvas.moveBy(name, x, y);
            }
            return canvas.moveTo(name, x, y);
        },
        getWith: (name: string) => { return name; }
    },
    {
        pattern: /^size ([a-z][a-z0-9]*) (by|to)? ?(-?[0-9]+)?,(-?[0-9]+)?$/i,
        action: (name: string, op: string, x: number, y: number) => {
            if (op == 'by') {
                return canvas.sizeBy(name, x, y);
            }
            return canvas.sizeTo(name, x, y);
        },
        getWith: (name: string) => { return name; }
    },
    {
        pattern: /^paint ([a-z][a-z0-9]*) ([a-z]+|#[a-f0-9]{3,9})$/i,
        action: (name: string, color: string) => { canvas.paint(name, color); },
        getWith: (name: string) => { return name; }
    },
    {
        pattern: /^outline ([a-z][a-z0-9]*) ([a-z]+|#[a-f0-9]{3,9})? ?([0-9]+)?$/i,
        action: (name: string, color: string, thickness: number) => { canvas.setStroke(name, color, thickness); },
        getWith: (name: string) => { return name; }
    },
    {
        pattern: /^write ([a-z][a-z0-9]*) (.+)$/i,
        action: (name: string, str: string) => { canvas.write(name, str); },
        getWith: (name: string) => { return name; }
    },
    {
        pattern: /^points ([a-z][a-z0-9]*) ([-0-9, ]+)$/i,
        action: (name: string, points: string) => {
            // this is not ideal
            canvas.setPoints(name, points.split(' '))
        }
    }
];


// Render it
let lineNumber: number = 0;
const render = () => {
    lineNumber = 0;
    canvas.reset();
    scriptConsole && (scriptConsole.innerHTML = '');
    // Parse content
    const lines = code ? code.innerText.split("\n") : [];
    // Pre-Processing
    let lastWith: string | null = null;
    for (let i = 0; i < lines.length; i++) {
        // Clean line
        lines[i] = lines[i].replace(/\s/g, ' ');
        lines[i] = lines[i].trimRight();
        // Rewrite shorthand
        if (/^ +/.test(lines[i]) && lastWith !== null) {
            lines[i] = (() => {
                let arr: string[] = lines[i].trim().split(' ');
                arr.splice(1, 0, lastWith);
                return arr.join(' ');
            })();
        }
        // Process with
        else {
            languagePatterns.some(lang => {
                const matches = lines[i].match(lang.pattern);
                if (matches !== null && typeof lang.getWith != 'undefined') {
                    lastWith = lang.getWith.apply(canvas, matches.slice(1));
                    return true;
                }
                return false;
            });
        }
    }
    // Execution
    forEachPromise(lines, (line: string) => {
        // Increment line number
        lineNumber += 1;
        // Ignore blank lines
        if (line.length) {
            // Echo line
            log(line);
            // Parse from regular expressions
            let thisPromise = null;
            const isValidCommand: boolean = languagePatterns.some(lang => {
                const matches = line.match(lang.pattern);
                if (matches !== null) {
                    thisPromise = lang.action.apply(canvas, matches.slice(1));
                    return true;
                }
                return false;
            });
            if (!isValidCommand) {
                log(`Invalid command: ${line}`);
            }
            return thisPromise;
        }
    });
    // Save content
    localStorage.setItem('lastRunCode', code ? code.innerText : '');
}

// Event listener
const btnRun = document.getElementById('run');
btnRun && btnRun.addEventListener('click', render);

// On code change
const updateLineCount = () => {
    if (code) {
        const newLineCount: number = code.innerText.split(/\r\n|\r|\n/).length;
        if (newLineCount != lastLineCount) {
            let lineCountHtml: string = '';
            for (let i = 0; i < newLineCount; i++) {
                lineCountHtml += `<div>${i + 1}</div>`;
            }
            lineNumbers && (lineNumbers.innerHTML = lineCountHtml);
            lastLineCount = newLineCount;
        }
    }
};
code && code.addEventListener('paste', () => {
    if (code) {
        // Strip html pasted in
        setTimeout(() => {
            if (code.innerHTML !== code.innerText) {
                code.innerHTML = code.innerText;
            }
            updateLineCount();
        }, 1);
    }
});
let lastLineCount: number = 0;
code && code.addEventListener('input', () => {
    updateLineCount();
});
code && code.addEventListener('scroll', () => {
    let scrollY = code.scrollTop;
    lineNumbers && (lineNumbers.scrollTop = scrollY);
});

// Restore from local storage
let lastRunCode = localStorage.getItem('lastRunCode');
if (lastRunCode && code) {
    code.innerText = lastRunCode;
    updateLineCount();
}
else if (code) {
    code.innerText += "new rectangle background\n" +
        "  size 640 480\n" +
        "  paint black\n";
}
render();
