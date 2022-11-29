const vscode = require('vscode');

let keyWords = [
  'if',
  'elseif',
  'else',
  'return',
  'while',
  'do',
  'set',
  'write',
  'zwrite',
  'kill',
  'for',
  'continue',
  'quit',
  'class',
  'method',
  'classmethod',
  'query',
  'property',
  'parameter',
  'zn',
  'throw',
  'try',
  'catch',
  '{',
  '}',
  '//',
  '/*',
  '*/',
  '#',
  '$$$',
  '<',
  'xdata',
  'storage',
  'index',
  'relationship',
  '(',
  ')',
  '&sql',
];

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand(
    'ownobjectscriptextension.addObjectScriptModifier',
    function () {
      // Check if there is an active TexteEditor
      if (vscode.window.activeTextEditor == undefined) {
        vscode.window.showErrorMessage(
          'Please open a ObjectScript file first!'
        );
        return;
      }

      // Check if TextEditor is ObjectScript
      if (!vscode.window.activeTextEditor.document.fileName.endsWith('.cls')) {
        vscode.window.showErrorMessage('Only works with ObjectScript files!');
        return;
      }

      vscode.window.activeTextEditor.edit(function (editBuilder) {
        let modifiedLines = [];
        for (
          let i = 0;
          i < vscode.window.activeTextEditor.document.lineCount;
          i++
        ) {
          let line = vscode.window.activeTextEditor.document.lineAt(i);
          let newLine = undefined;
          let trimedLine = line.text.toLowerCase().replace(/\s/g, '');

          //Embedded Python
          if (trimedLine.includes('language=python')) {
            i = skipUnitlToken(i, '{', '}');
            continue;
          }

          if (!startsWithKeyword(trimedLine)) {
            newLine = addModifier(
              line.text,
              line.firstNonWhitespaceCharacterIndex
            );
            modifiedLines.push(i + 1);
            editBuilder.delete(line.range);
            editBuilder.insert(new vscode.Position(i, 0), newLine);
          }

          // MultiLine method calls
          if (trimedLine.includes('(') && !trimedLine.includes(')')) {
            i = skipUnitlToken(i, '(', ')');
          }
        }

        // Show message
        if (modifiedLines.length == 0)
          vscode.window.showInformationMessage('No lines modified!');
        else {
          let message = 'Lines modified:';
          for (let i in modifiedLines) {
            message += ' ' + modifiedLines[i] + ',';
          }
          vscode.window.showInformationMessage(
            message.slice(0, message.length - 1)
          );
        }
      });
    }
  );
  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

/**
 * @param {number} index
 * @param {string} startToken
 * @param {string} endToken
 */
function skipUnitlToken(index, startToken, endToken) {
  let endTokenCount = -1;
  for (
    let i = index;
    i < vscode.window.activeTextEditor.document.lineCount;
    i++
  ) {
    let blankLine = vscode.window.activeTextEditor.document
      .lineAt(i)
      .text.toLowerCase()
      .replace(/\s/g, '');
    for (let j = 0; j < blankLine.length; j++) {
      if (blankLine.charAt(j) == endToken) {
        endTokenCount--;
      }
      if (blankLine.charAt(j) == startToken) {
        endTokenCount++;
        if (endTokenCount == 0) endTokenCount++;
      }
    }
    if (endTokenCount == 0) {
      return i;
    }
  }
  return vscode.window.activeTextEditor.document.lineCount - 1;
}

/**
 * @param {string} line
 */
function startsWithKeyword(line) {
  for (let keyWord in keyWords) {
    if (line.startsWith(keyWords[keyWord]) || line.length == 0) {
      return true;
    }
  }
  return false;
}

/**
 * @param {string} line
 * @param {number} firstIndex
 */
function addModifier(line, firstIndex) {
  if (line.includes('=')) {
    return line.slice(0, firstIndex) + 'Set ' + line.slice(firstIndex);
  }
  if (line.includes('!') || line.includes('_')) {
    return line.slice(0, firstIndex) + 'Write ' + line.slice(firstIndex);
  }
  return line.slice(0, firstIndex) + 'Do ' + line.slice(firstIndex);
}

module.exports = {
  activate,
  deactivate,
};
