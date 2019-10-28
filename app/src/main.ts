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

const commands = {
    paint: (words: string[]) => {
        return canvas.paint(words[1], words[2]);
    },
    remove: (words: string[]) => {
        return canvas.remove(words[1]);
    },
    new: (words: string[]) => {
        return canvas.createItem(words[2], words[1]);
    },
    print: (words: string[]) => {
        return canvas.print(words[1], words[2]);
    },
    clone: (words: string[]) => {
        return canvas.clone(words[1], words[2]);
    },
    write: (words: string[]) => {
        return canvas.write(words[1], words.slice(2).join(' '));
    },
    reset: () => {
        return canvas.reset();
    },
    width: (words: string[]) => {
        return canvas.sizeTo(words[1], Number(words[2]), null);
    },
    height: (words: string[]) => {
        return canvas.sizeTo(words[1], null, Number(words[2]));
    },
    left: (words: string[]) => {
        return canvas.moveTo(words[1], Number(words[2]), null);
    },
    top: (words: string[]) => {
        return canvas.moveTo(words[1], null, Number(words[2]));
    },
    outline: (words: string[]) => {
        return canvas.setStroke(words[1], words[2], Number(words[3]) || 1);
    },
    with: (words: string[]) => {
        return canvas.setWith(words[1]);
    },
    move: (words: string[]) => {
        return canvas.moveBy(words[1], Number(words[2]), Number(words[3]));
    },
    position: (words: string[]) => {
        return canvas.moveTo(words[1], Number(words[2]), Number(words[3]));
    },
    points: (words: string[]) => {
        return canvas.setPoints(words[1], words.slice(2));
    },
    size: (words: string[]) => {
        return canvas.sizeTo(words[1], Number(words[2]), Number(words[3]));
    },
    grow: (words: string[]) => {
        return canvas.sizeBy(words[1], Number(words[2]), Number(words[3]));
    },
    wait: (words: string[]) => {
        return canvas.wait(Number(words[1]), words[2]);
    }
};

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
            // Echo line
            log(line);
            // Parse it
            let words = cleanCommand(line);
            // Get command
            const action = words[0] == ' ' ? words[1] : words[0];
            const command = commands[action];
            // Execute command
            if (command) {
                //console.log(words);
                return command(words);
            }
            log(`Invalid command: ${action}`);
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
