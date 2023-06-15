const vscode = require('vscode');
const globalFunctions = require('../GlobalFunctions');

function translateEmbPython() {
    if (!globalFunctions.preConditions()) return;

    let startLineIndex = undefined;
    let isPython = false;
    let methodAttributes = undefined;
    let firstMethodLine = undefined;

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
            firstMethodLine = i;
            let offset = 0;
            let lineString = line.text;
            while (!lineString.includes('{')) {
                lineString += vscode.window.activeTextEditor.document.lineAt(
                    i + offset + 1
                ).text;
                offset++;
            }
            if (
                lineString
                    .toLowerCase()
                    .replace(/\s/g, '')
                    .includes('language=python')
            )
                isPython = true;
            if (lineString.includes('[')) {
                methodAttributes = lineString.split('[')[1].split(']')[0];
            }
            startLineIndex = i + offset;
            break;
        }
    }

    if (startLineIndex == undefined) {
        vscode.window.showErrorMessage('No method found!');
        return;
    }
    if (isPython) {
        vscode.window.showErrorMessage(
            'Cannot convert from embedded python to objetscript!'
        );
        return;
    }

    let methodText = [];
    let lastMethodLine = globalFunctions.skipUnitlToken(
        firstMethodLine,
        '{',
        '}'
    );
    let methodHead = '';
    let finishedHead = false;
    for (let i = firstMethodLine; i < lastMethodLine; i++) {
        let line = vscode.window.activeTextEditor.document.lineAt(i).text;
        if (!finishedHead) {
            methodHead += line + '\n';
        } else methodText.push(line);
        if (line.includes('{')) finishedHead = true;
    }

    let endLineIndex = globalFunctions.skipUnitlToken(startLineIndex, '{', '}');

    vscode.window.activeTextEditor.edit(function (editBuilder) {
        //add language = python
        if (!methodHead.includes('['))
            methodHead =
                methodHead.split('{')[0] + '[Language = python]' + '{\n';
        else {
            if (
                methodHead
                    .toLowerCase()
                    .replace(/\s/g, '')
                    .includes('language=objectscript')
            ) {
                methodHead =
                    methodHead.split('[')[0] +
                    '[' +
                    methodHead.split('[')[1].replace(/objectscript/i, 'python');
            } else
                methodHead =
                    methodHead.split(']')[0] +
                    ', Language = python]' +
                    methodHead.split(']')[1];
        }

        //add py to method name
        let temp = methodHead.split(' ')[0] + ' py';
        for (let i = 1; i < methodHead.split(' ').length; i++) {
            if (i != 1) temp += ' ';
            temp += methodHead.split(' ')[i];
        }
        methodHead = temp;
        //add import iris
        methodHead += '    import iris\n';
        let linesArray = [];
        for (const element of methodText) {
            let newLine =
                globalFunctions.convertObjectscriptToPython(
                    element,
                    linesArray
                ) + '\n';
            linesArray.push(newLine);
        }

        linesArray.forEach((element) => {
            methodHead += element;
        });

        methodHead += '}\n\n';
        editBuilder.insert(
            new vscode.Position(lastMethodLine + 2, 0),
            methodHead
        );
    });

    //Save if option is turned on
    if (
        vscode.workspace
            .getConfiguration('ownobjectscriptextension')
            .get('SaveFile')
    )
        vscode.window.activeTextEditor.document.save();
}

module.exports = {
    translateEmbPython,
};
