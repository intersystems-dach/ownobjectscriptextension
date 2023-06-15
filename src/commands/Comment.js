const vscode = require('vscode');
const globalFunctions = require('../GlobalFunctions');

const WorkspaceManager = require('../WorkspaceManager.js');
const workspaceManager = new WorkspaceManager();
workspaceManager.init();

function addMethodDescriptionTemplate() {
    if (!globalFunctions.preConditions()) return;

    let startLine = undefined;
    let lineAbove = undefined;
    let startLineRange = undefined;
    // Find method
    for (
        let i = vscode.window.activeTextEditor.selection.start.line;
        i >= 0;
        i--
    ) {
        let line = vscode.window.activeTextEditor.document.lineAt(i);
        let trimedLine = line.text.toLowerCase().replace(/\s/g, '');
        if (
            trimedLine.startsWith('method') ||
            trimedLine.startsWith('classmethod')
        ) {
            let offset = 1;
            let lineString = line.text;
            while (!lineString.includes('{')) {
                lineString += vscode.window.activeTextEditor.document
                    .lineAt(i + offset)
                    .text.slice(
                        vscode.window.activeTextEditor.document.lineAt(
                            i + offset
                        ).firstNonWhitespaceCharacterIndex
                    );
                offset++;
            }
            startLine = lineString;
            startLineRange = line.range;
            if (i == 0) break;
            let lineAboveTmp = vscode.window.activeTextEditor.document.lineAt(
                i - 1
            );
            let trimmedLineAbove = lineAboveTmp.text
                .toLowerCase()
                .replace(/\s/g, '');
            if (trimmedLineAbove.startsWith('///')) {
                if (
                    trimmedLineAbove == '///description' ||
                    trimmedLineAbove == '///'
                ) {
                    //Remove description if no valid comment
                    lineAbove = lineAboveTmp;
                    break;
                } else {
                    //Return if comment already exists
                    return;
                }
            }
            break;
        }
    }

    if (startLine == undefined) {
        vscode.window.showErrorMessage('No method found!');
        return;
    }
    let template = '';

    //Add method description
    for (let i in workspaceManager.methodTemplateJSON['MethodDescription']) {
        template +=
            '/// ' +
            workspaceManager.methodTemplateJSON['MethodDescription'][i] +
            '\n';
    }

    // add paremeter description
    template += globalFunctions.makeParamterTemplate(startLine);

    //if has return value
    if (startLine.split(')')[1].toLowerCase().includes('as')) {
        // Add return description
        for (let i in workspaceManager.methodTemplateJSON[
            'ReturnDescription'
        ]) {
            template +=
                '/// ' +
                workspaceManager.methodTemplateJSON['ReturnDescription'][i] +
                '\n';
        }
    }
    // Add example
    if (startLine.toLowerCase().includes('classmethod')) {
        for (let i in workspaceManager.methodTemplateJSON[
            'ExampleClassMethod'
        ]) {
            template +=
                '/// ' +
                workspaceManager.methodTemplateJSON['ExampleClassMethod'][i] +
                '\n';
        }
    } else {
        for (let i in workspaceManager.methodTemplateJSON['ExampleMethod']) {
            template +=
                '/// ' +
                workspaceManager.methodTemplateJSON['ExampleMethod'][i] +
                '\n';
        }
    }

    //get classname
    let className = globalFunctions.getClassName();

    //get method name
    let methodName = startLine.split(' ')[1];
    if (methodName.includes('(')) methodName = methodName.split('(')[0];

    //replace spaceholder
    template = globalFunctions.ownReplaceAll(
        template,
        '*classname*',
        className
    );
    template = globalFunctions.ownReplaceAll(
        template,
        '*methodname*',
        methodName
    );

    vscode.window.activeTextEditor.edit(function (editBuilder) {
        if (lineAbove != undefined) editBuilder.delete(lineAbove.range);
        editBuilder.insert(startLineRange.start, template);
    });

    //Save if option is turned on
    if (
        vscode.workspace
            .getConfiguration('ownobjectscriptextension')
            .get('SaveFile')
    )
        vscode.window.activeTextEditor.document.save();
}

function addInlineComments() {
    if (!globalFunctions.preConditions()) return;
    let inlineCount = vscode.workspace
        .getConfiguration('ownobjectscriptextension.comment')
        .get('InLineCommentCount');

    let endIndex = undefined;
    let startIndex = undefined;
    // Find method
    for (
        let i = vscode.window.activeTextEditor.selection.start.line;
        i >= 0;
        i--
    ) {
        let line = vscode.window.activeTextEditor.document.lineAt(i);
        let trimedLine = line.text.toLowerCase().replace(/\s/g, '');
        if (
            trimedLine.startsWith('method') ||
            trimedLine.startsWith('classmethod')
        ) {
            while (!line.text.includes('{')) {
                i++;
                line = vscode.window.activeTextEditor.document.lineAt(i);
            }
            startIndex = i;
            endIndex = globalFunctions.skipUnitlToken(i, '{', '}');
            break;
        }
    }
    vscode.window.activeTextEditor.edit(function (editBuilder) {
        let count = 0;
        for (let i = startIndex; i <= endIndex; i++) {
            let trimmedLine = vscode.window.activeTextEditor.document
                .lineAt(i)
                .text.toLowerCase()
                .replace(/\s/g, '');
            if (trimmedLine == '{' || trimmedLine == '}' || trimmedLine == '')
                continue;
            if (
                trimmedLine.startsWith('//') ||
                trimmedLine.startsWith(';') ||
                trimmedLine.includes('/*') ||
                trimmedLine.includes('*/')
            ) {
                count = 0;
                continue;
            }
            count++;
            if (count == inlineCount + 1) {
                count = 1;
                //Insert
                let c =
                    vscode.window.activeTextEditor.document.lineAt(
                        i
                    ).firstNonWhitespaceCharacterIndex;
                let newLine = '// TODO\n';
                for (
                    let j = 0;
                    j <
                    vscode.window.activeTextEditor.document.lineAt(i)
                        .firstNonWhitespaceCharacterIndex;
                    j++
                ) {
                    newLine += ' ';
                }
                editBuilder.insert(new vscode.Position(i, c), newLine);
            }
        }
    });
    //Save if option is turned on
    if (
        vscode.workspace
            .getConfiguration('ownobjectscriptextension')
            .get('SaveFile')
    )
        vscode.window.activeTextEditor.document.save();
}

function editMethodDescriptionTemplate() {
    vscode.workspace
        .openTextDocument(vscode.Uri.file(workspaceManager.methodTemplateFile))
        .then((a) => {
            vscode.window.showTextDocument(a, 1, false);
        });
}

module.exports = {
    addMethodDescriptionTemplate,
    addInlineComments,
    editMethodDescriptionTemplate,
};
