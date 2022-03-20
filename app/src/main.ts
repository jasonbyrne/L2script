import { forEachPromise } from "./util";
import { Canvas } from "./canvas";
import { Parser } from "./logic/parser";
import { initIde } from "./ide";

// Setup DOM
const scriptConsole = document.getElementById("console");
const canvasDiv = document.getElementById("canvas");
const code = document.getElementById("code");
const lineNumbers = document.getElementById("lineNumbers");

const canvas: Canvas = new Canvas(640, 480);
canvasDiv && canvasDiv.appendChild(canvas.getDomElement());

canvas.onError((message) => {
  log(message);
});

canvas.onInfo((message) => {
  log(message);
});

// Console line
let lastConsoleLineNumber: number = 0;
const log = (message: string) => {
  const logItem = document.createElement("div");
  logItem.className = `line l${lineNumber}`;
  logItem.innerHTML = `
        <span class="lineNumber">${
          lastConsoleLineNumber == lineNumber ? "" : lineNumber
        }</span>
        <span class="message">${message}</span>
    `;
  if (scriptConsole) {
    scriptConsole.appendChild(logItem);
    scriptConsole.scrollTop = scriptConsole.scrollHeight;
  }
  lastConsoleLineNumber = lineNumber;
};

// Render it
let lineNumber: number = 0;
const render = () => {
  lineNumber = 0;
  canvas.reset();
  scriptConsole && (scriptConsole.innerHTML = "");
  // Parse content
  const parser = new Parser(canvas, log);
  const codeText = code ? code.innerText : "";
  parser.compile(codeText);
  parser.execute();
  // Save content
  localStorage.setItem("lastRunCode", code ? code.innerText : "");
};

// Event listener
const btnRun = document.getElementById("run");
btnRun && btnRun.addEventListener("click", render);

// On code change
const updateLineCount = () => {
  if (code) {
    const newLineCount: number = code.innerText.split(/\r\n|\r|\n/).length;
    if (newLineCount != lastLineCount) {
      let lineCountHtml: string = "";
      for (let i = 0; i < newLineCount; i++) {
        lineCountHtml += `<div>${i + 1}</div>`;
      }
      lineNumbers && (lineNumbers.innerHTML = lineCountHtml);
      lastLineCount = newLineCount;
    }
  }
};
code &&
  code.addEventListener("paste", () => {
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
code &&
  code.addEventListener("input", () => {
    updateLineCount();
  });
code &&
  code.addEventListener("scroll", () => {
    let scrollY = code.scrollTop;
    lineNumbers && (lineNumbers.scrollTop = scrollY);
  });

// Restore from local storage
let lastRunCode = localStorage.getItem("lastRunCode");
if (lastRunCode && code) {
  code.innerText = lastRunCode;
  updateLineCount();
} else if (code) {
  code.innerText +=
    "object background = new rectangle\n" +
    "  size to 640,640\n" +
    "  paint black\n";
}

initIde();
