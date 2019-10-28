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
}

const languagePatterns: iLanguagePattern[] = [
    {
        pattern: /^reset$/i,
        action: canvas.reset
    },
    {
        pattern: /^wait ([0-9]+)$/i,
        action: (timeout: number) => { return canvas.wait(timeout); }
    },
    {
        pattern: /^wait ([0-9]+) ([a-z]+)$/i,
        action: (timeout: number, units: string) => { return canvas.wait(timeout, units); }
    },
    {
        pattern: /^new ([a-z]+) ([a-z][a-z0-9]*)$/i,
        action: (type: string, name: string) => { canvas.createItem(name, type); }
    },
    {
        pattern: /^new ([a-z]+)$/i,
        action: (type: string) => { canvas.createItem(null, type); }
    },
    {
        pattern: /^clone ([a-z]+) ([a-z][a-z0-9]*)$/i,
        action: (fromName: string, toName: string) => { canvas.clone(fromName, toName); }
    },
    {
        pattern: /^with ([a-z][a-z0-9]*)$/i,
        action: (name: string) => { canvas.setWith(name); }
    },
    {
        pattern: /^remove ([a-z][a-z0-9]*)$/i,
        action: (name: string) => { canvas.remove(name); }
    },
    {
        pattern: /^move ([a-z][a-z0-9]*) (-?[0-9]+),(-?[0-9]+)$/i,
        action: (name: string, x: number, y: number) => { canvas.moveBy(name, x, y); }
    },
    {
        pattern: /^move ([a-z][a-z0-9]*) (-?[0-9]+)$/i,
        action: (name: string, x: number) => { canvas.moveBy(name, x, null); }
    },
    {
        pattern: /^move ([a-z][a-z0-9]*) ,(-?[0-9]+)$/i,
        action: (name: string, y: number) => { canvas.moveBy(name, null, y); }
    },
    {
        pattern: /^position ([a-z][a-z0-9]*) (-?[0-9]+),(-?[0-9]+)$/i,
        action: (name: string, x: number, y: number) => { canvas.moveTo(name, x, y); }
    },
    {
        pattern: /^position ([a-z][a-z0-9]*) (-?[0-9]+)$/i,
        action: (name: string, x: number) => { canvas.moveTo(name, x, null); }
    },
    {
        pattern: /^position ([a-z][a-z0-9]*) ,(-?[0-9]+)$/i,
        action: (name: string, y: number) => { canvas.moveTo(name, null, y); }
    },
    {
        pattern: /^size ([a-z][a-z0-9]*) (-?[0-9]+),(-?[0-9]+)$/i,
        action: (name: string, x: number, y: number) => { canvas.sizeTo(name, x, y); }
    },
    {
        pattern: /^size ([a-z][a-z0-9]*) (-?[0-9]+)$/i,
        action: (name: string, x: number) => { canvas.sizeTo(name, x, null); }
    },
    {
        pattern: /^size ([a-z][a-z0-9]*) ,(-?[0-9]+)$/i,
        action: (name: string, y: number) => { canvas.sizeTo(name, null, y); }
    },
    {
        pattern: /^grow ([a-z][a-z0-9]*) (-?[0-9]+),(-?[0-9]+)$/i,
        action: (name: string, x: number, y: number) => { canvas.sizeBy(name, x, y); }
    },
    {
        pattern: /^grow ([a-z][a-z0-9]*) (-?[0-9]+)$/i,
        action: (name: string, x: number) => { canvas.sizeBy(name, x, null); }
    },
    {
        pattern: /^grow ([a-z][a-z0-9]*) ,(-?[0-9]+)$/i,
        action: (name: string, y: number) => { canvas.sizeBy(name, null, y); }
    },
    {
        pattern: /^paint ([a-z][a-z0-9]*) ([a-z]+)$/i,
        action: (name: string, color: string) => { canvas.paint(name, color); }
    },
    {
        pattern: /^paint ([a-z][a-z0-9]*) (#[0-9a-f]{3,9})$/i,
        action: (name: string, color: string) => { canvas.paint(name, color); }
    },
    {
        pattern: /^outline ([a-z][a-z0-9]*) ([a-z]+) ([0-9]+)$/i,
        action: (name: string, color: string, thickness: number) => { canvas.setStroke(name, color, thickness); }
    },
    {
        pattern: /^outline ([a-z][a-z0-9]*) ([a-z]+)$/i,
        action: (name: string, color: string) => { canvas.setStroke(name, color, null); }
    },
    {
        pattern: /^write ([a-z][a-z0-9]*) (.+)$/i,
        action: (name: string, str: string) => { canvas.write(name, str); }
    },
    {
        pattern: /^points ([a-z][a-z0-9]*) ([-0-9, ]+)$/i,
        action: (name: string, points: string) => {
            // this is not ideal
            canvas.setPoints(name, points.split(' '))
        }
    },
    {
        pattern: /^  clone ([a-z][a-z0-9]*)$/i,
        action: (toName: string) => { canvas.clone(null, toName); }
    },
    {
        pattern: /^  paint ([a-z]+)$/i,
        action:  (color: string) => { canvas.paint(null, color); }
    },
    {
        pattern: /^  paint (#[0-9a-f]{3,9})$/i,
        action: (color: string) => { canvas.paint(null, color); }
    },
    {
        pattern: /^  outline ([a-z]+) ([0-9]+)$/i,
        action: (color: string, thickness: number) => { canvas.setStroke(null, color, thickness); }
    },
    {
        pattern: /^  outline ([a-z]+)$/i,
        action: (color: string) => { canvas.setStroke(null, color, null); }
    },
    {
        pattern: /^  size ([0-9]+),([0-9]+)$/i,
        action: (width: number, height: number) => { canvas.sizeTo(null, width, height); }
    },
    {
        pattern: /^  size ([0-9]+)$/i,
        action: (width: number) => { canvas.sizeTo(null, width, null); }
    },
    {
        pattern: /^  size ,([0-9]+)$/i,
        action: (height: number) => { canvas.sizeTo(null, null, height); }
    },
    {
        pattern: /^  position (-?[0-9]+),(-?[0-9]+)$/i,
        action: (x: number, y: number) => { canvas.moveTo(null, x, y); }
    },
    {
        pattern: /^  position (-?[0-9]+)$/i,
        action: (x: number) => { canvas.moveTo(null, x, null); }
    },
    {
        pattern: /^  position ,(-?[0-9]+)$/i,
        action: (y: number) => { canvas.moveTo(null, null, y); }
    },
    {
        pattern: /^  move (-?[0-9]+),(-?[0-9]+)$/i,
        action: (x: number, y: number) => { canvas.moveBy(null, x, y); }
    },
    {
        pattern: /^  move (-?[0-9]+)$/i,
        action: (x: number) => { canvas.moveBy(null, x, null); }
    },
    {
        pattern: /^  move ,(-?[0-9]+)$/i,
        action: (y: number) => { canvas.moveBy(null, null, y); }
    },
    {
        pattern: /^  grow (-?[0-9]+),(-?[0-9]+)$/i,
        action: (x: number, y: number) => { canvas.sizeBy(null, x, y); }
    },
    {
        pattern: /^  grow (-?[0-9]+)$/i,
        action: (x: number) => { canvas.sizeBy(null, x, null); }
    },
    {
        pattern: /^  grow ,(-?[0-9]+)$/i,
        action: (y: number) => { canvas.sizeBy(null, null, y); }
    },
    {
        pattern: /^  write (.+)$/i,
        action: (str: string) => { canvas.write(null, str); }
    },
    {
        pattern: /^  points ([-0-9, ]+)$/i,
        action: (points: string) => {
            // this is not ideal
            canvas.setPoints(null, points.split(' '))
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
    
    forEachPromise(lines, (line) => {
        // Increment line number
        lineNumber += 1;
        // Ignore blank lines
        if (line.length) {
            // Clean line
            line = line.replace(/\s/g, ' ');
            line = line.trimEnd();
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
