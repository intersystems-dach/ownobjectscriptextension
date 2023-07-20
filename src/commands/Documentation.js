const vscode = require('vscode');
const globalFunctions = require('../GlobalFunctions');
const axios = require('axios');

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
            line.text.toLowerCase().startsWith('method') ||
            line.text.toLowerCase().startsWith('classmethod')
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

function openDocumentation() {
    if (!globalFunctions.preConditions()) return;

    const selection = vscode.window.activeTextEditor.selection;

    let searchString =
        vscode.window.activeTextEditor.document.getText(selection);
    if (selection.isEmpty) {
        let wordRange =
            vscode.window.activeTextEditor.document.getWordRangeAtPosition(
                selection.start
            );

        searchString =
            vscode.window.activeTextEditor.document.getText(wordRange);

        // get character before
        if (wordRange.start.character != 0) {
            let characterBefore =
                vscode.window.activeTextEditor.document.getText(
                    new vscode.Range(
                        new vscode.Position(
                            wordRange.start.line,
                            wordRange.start.character - 1
                        ),
                        wordRange.start
                    )
                );
            while (characterBefore == '.') {
                wordRange =
                    vscode.window.activeTextEditor.document.getWordRangeAtPosition(
                        new vscode.Position(
                            wordRange.start.line,
                            wordRange.start.character - 1
                        )
                    );
                searchString =
                    vscode.window.activeTextEditor.document.getText(wordRange) +
                    '.' +
                    searchString;
                if (wordRange.start.character == 0) break;
                characterBefore =
                    vscode.window.activeTextEditor.document.getText(
                        new vscode.Range(
                            new vscode.Position(
                                wordRange.start.line,
                                wordRange.start.character - 1
                            ),
                            wordRange.start
                        )
                    );
            }
        }
        wordRange =
            vscode.window.activeTextEditor.document.getWordRangeAtPosition(
                selection.start
            );
        if (
            wordRange.end.character !=
            vscode.window.activeTextEditor.document.lineAt(wordRange.end.line)
                .range.end.character
        ) {
            let characterAfter =
                vscode.window.activeTextEditor.document.getText(
                    new vscode.Range(
                        wordRange.end,
                        new vscode.Position(
                            wordRange.end.line,
                            wordRange.end.character + 1
                        )
                    )
                );
            while (characterAfter == '.') {
                wordRange =
                    vscode.window.activeTextEditor.document.getWordRangeAtPosition(
                        new vscode.Position(
                            wordRange.end.line,
                            wordRange.end.character + 1
                        )
                    );
                searchString =
                    searchString +
                    '.' +
                    vscode.window.activeTextEditor.document.getText(wordRange);
                if (
                    wordRange.end.character ==
                    vscode.window.activeTextEditor.document.lineAt(
                        wordRange.end.line
                    ).range.end.character
                )
                    break;
                characterAfter =
                    vscode.window.activeTextEditor.document.getText(
                        new vscode.Range(
                            wordRange.end,
                            new vscode.Position(
                                wordRange.end.line,
                                wordRange.end.character + 1
                            )
                        )
                    );
            }
        }
    }

    if (
        searchString.replace(/ /g, '').startsWith('%') &&
        !searchString.includes('.')
    ) {
        searchString = searchString.replace('%', '%Library.');
    }

    let namespace = '';
    if (searchString.replace(/ /g, '').startsWith('Ens')) {
        namespace = 'LIBRARY=ENSLIB&';
    }

    let baseURL = 'https://docs.intersystems.com/csp/documatic/';
    let url =
        baseURL +
        '%25CSP.Documatic.cls?' +
        namespace +
        'CLASSNAME=' +
        searchString;

    if (
        vscode.workspace
            .getConfiguration('ownobjectscriptextension.documentation')
            .get('OpenInBrowser')
    ) {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
    } else {
        getHTMLFromURL(url)
            .then((html) => {
                if (html) {
                    html = html.replace(
                        /href="%25CSP.Documatic.cls/g,
                        'href="' + baseURL + '%25CSP.Documatic.cls'
                    );
                    html = html.replace(
                        'Sorry, your browser does not support JavaScript or JavaScript is disabled. Please enable JavaScript or use another browser to have a better experience.',
                        ''
                    );
                    html = html.replace(
                        '</body>',
                        `
    <div align="center"><a href="https://philipp-bonin.com/">by Philipp</a></div>
    <div id="openInBrowser"><a href="${url}">Open in browser</a></div>
    </body>
    <style>
        #openInBrowser {
            position: fixed;
            bottom: 0;
            right: -1px;
            background: #323694;
            padding: 10px;
            border-radius: 5px 0px 0px 0px;
            z-index: 999;
            cursor: pointer;
            box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.75);
        }
        #openInBrowser > a {
            color: white;
            text-decoration: none;
            font-size: 25px;
        }
        #openInBrowser:hover {
            background: #00b4ae;
            box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.9);
        }
    </style>
                    `
                    );
                    createPanel(html, searchString);
                } else {
                    vscode.window
                        .showErrorMessage(
                            'HTML not fetched successfully!',
                            'Open in browser',
                            'Cancel'
                        )
                        .then((value) => {
                            if (value == 'Open in browser') {
                                vscode.commands.executeCommand(
                                    'vscode.open',
                                    vscode.Uri.parse(url)
                                );
                            }
                        });
                }
            })
            .catch(() => {
                vscode.window
                    .showErrorMessage(
                        'HTML not fetched successfully!',
                        'Open in browser',
                        'Cancel'
                    )
                    .then((value) => {
                        if (value == 'Open in browser') {
                            vscode.commands.executeCommand(
                                'vscode.open',
                                vscode.Uri.parse(url)
                            );
                        }
                    });
            });
    }
}

async function createPanel(html, name) {
    const panel = vscode.window.createWebviewPanel(
        'ISCClassDocumentation',
        name,
        vscode.ViewColumn.Two,
        {}
    );
    panel.webview.html = html;

    return panel;
}

async function getHTMLFromURL(url) {
    try {
        // @ts-ignore
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        vscode.window.showErrorMessage('Error fetching HTML:' + error.message);
        return null;
    }
}

async function intersystemsWebSearch() {
    // ask for search string
    let searchstring = await vscode.window.showInputBox({
        prompt: 'Enter your InterSystems search',
        placeHolder: 'InterSystems Search',
    });
    if (searchstring == undefined) return;

    if (
        !searchstring.toLocaleLowerCase().includes('intersystems') &&
        !searchstring.toLocaleLowerCase().includes('objectscript')
    ) {
        searchstring = 'InterSystems ObjectScript ' + searchstring;
    }

    let url = 'https://www.google.com/search?q=' + searchstring;
    if (
        vscode.workspace
            .getConfiguration('ownobjectscriptextension.documentation')
            .get('UseDuckDuckGo')
    ) {
        url = 'https://www.duckduckgo.com/?q=' + searchstring;
    }
    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
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
    openDocumentation,
    editMethodDescriptionTemplate,
    intersystemsWebSearch,
};
