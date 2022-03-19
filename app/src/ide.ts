// Insert text into code
function insertTextAtCaret(text) {
  var sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      for (let position = 0; position != text.length; position++) {
        sel.modify("move", "right", "character");
      }
    }
  }
}

export function initIde() {
  // Capture tab
  document.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      insertTextAtCaret("  ");
      e.preventDefault();
      return false;
    }
  });
}
