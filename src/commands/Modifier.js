const vscode = require('vscode');
const globalFunctions = require('../GlobalFunctions');
const fs = require('fs');

const WorkspaceManager = require('../WorkspaceManager.js');
const workspaceManager = new WorkspaceManager();
workspaceManager.init();

function addObjectScriptModifier() {
    if (!globalFunctions.preConditions()) return;

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
                i = globalFunctions.skipUnitlToken(i, '{', '}');
                continue;
            }

            if (!globalFunctions.startsWithKeyword(trimedLine)) {
                newLine = globalFunctions.addModifier(
                    line.text,
                    line.firstNonWhitespaceCharacterIndex
                );
                modifiedLines.push(i + 1);
                editBuilder.delete(line.range);
                editBuilder.insert(new vscode.Position(i, 0), newLine);
            }

            // MultiLine method calls
            if (trimedLine.includes('(') && !trimedLine.includes(')')) {
                i = globalFunctions.skipUnitlToken(i, '(', ')');
            }
        }

        if (
            !vscode.workspace
                .getConfiguration('ownobjectscriptextension')
                .get('ShowMessages')
        )
            return;
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
    if (
        vscode.workspace
            .getConfiguration('ownobjectscriptextension')
            .get('SaveFile')
    )
        vscode.window.activeTextEditor.document.save();
}

function addKeyWord() {
    let input = vscode.window.showInputBox({
        placeHolder: 'Add Keyword',
    });
    input.then(function (value) {
        if (value == undefined) return;
        let valueTrimmed = value.toLowerCase().replace(/\s/g, '');
        if (workspaceManager.keyWords.includes(valueTrimmed)) return;
        workspaceManager.keyWords.push(valueTrimmed);
        fs.writeFileSync(
            workspaceManager.keywordsFile,
            JSON.stringify(workspaceManager.keyWords, null, 2)
        );

        vscode.window.setStatusBarMessage(
            'KeyWord "' + value + '" added',
            4000
        );
    });
}

function removeKeyWord() {
    let input = vscode.window.showInputBox({
        placeHolder: 'Remove Keyword',
    });
    input.then(function (value) {
        if (value == undefined) return;
        let valueTrimmed = value.toLowerCase().replace(/\s/g, '');
        if (!workspaceManager.keyWords.includes(valueTrimmed)) {
            vscode.window.showErrorMessage('Could not find keyword: ' + value);
            return;
        }
        let index = workspaceManager.keyWords.indexOf(valueTrimmed);
        if (index > -1) {
            workspaceManager.keyWords.splice(index, 1); // 2nd parameter means remove one item only
        }
        fs.writeFileSync(
            workspaceManager.keywordsFile,
            JSON.stringify(workspaceManager.keyWords, null, 2)
        );
        vscode.window.setStatusBarMessage(
            'KeyWord "' + value + '" removed',
            4000
        );
    });
}

function showKeyWords() {
    let s = '';
    for (let key in workspaceManager.keyWords)
        s += workspaceManager.keyWords[key] + ' , ';
    vscode.window
        .showInformationMessage(s, ...['Add', 'Remove'])
        .then((item) => {
            if (item == 'Add') {
                vscode.commands.executeCommand(
                    'ownobjectscriptextension.addKeyWord'
                );
            } else if (item == 'Remove') {
                vscode.commands.executeCommand(
                    'ownobjectscriptextension.removeKeyWord'
                );
            }
        });
}

module.exports = {
    addObjectScriptModifier,
    addKeyWord,
    removeKeyWord,
    showKeyWords,
};
