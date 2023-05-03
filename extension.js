const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { TextEncoder } = require('util');
const wizard = require('./wizard');

//workspace path
const workspacePath = path.join(
    __dirname,
    '../',
    'ownobjectscriptextension-workspace'
);

//keywords
let keywordsFile = undefined;
let keyWords = undefined;
try {
    keywordsFile = path.join(workspacePath, 'Keywords.json');

    keyWords = JSON.parse(fs.readFileSync(keywordsFile).toString());
} catch (e) {
    createWorkspace();

    keywordsFile = path.join(workspacePath, 'Keywords.json');

    keyWords = JSON.parse(fs.readFileSync(keywordsFile).toString());
}

//Method template
let methodTemplateFile = undefined;
let methodTemplateJSON = undefined;
try {
    methodTemplateFile = path.join(
        workspacePath,
        'MethodDescriptionTemplate.json'
    );

    methodTemplateJSON = JSON.parse(
        fs.readFileSync(methodTemplateFile).toString()
    );
} catch (e) {
    createWorkspace();

    methodTemplateFile = path.join(
        workspacePath,
        'MethodDescriptionTemplate.json'
    );

    methodTemplateJSON = JSON.parse(
        fs.readFileSync(methodTemplateFile).toString()
    );
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    //Add ObjectScript Modifier
    let disposable = vscode.commands.registerCommand(
        'ownobjectscriptextension.addObjectScriptModifier',
        function () {
            if (!preConditions()) return;

            vscode.window.activeTextEditor.edit(function (editBuilder) {
                let modifiedLines = [];
                for (
                    let i = 0;
                    i < vscode.window.activeTextEditor.document.lineCount;
                    i++
                ) {
                    let line =
                        vscode.window.activeTextEditor.document.lineAt(i);
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
    );

    //add keyword
    vscode.commands.registerCommand(
        'ownobjectscriptextension.addKeyWord',
        function () {
            let input = vscode.window.showInputBox({
                placeHolder: 'Add Keyword',
            });
            input.then(function (value) {
                if (value == undefined) return;
                let valueTrimmed = value.toLowerCase().replace(/\s/g, '');
                if (keyWords.includes(valueTrimmed)) return;
                keyWords.push(valueTrimmed);
                fs.writeFileSync(
                    keywordsFile,
                    JSON.stringify(keyWords, null, 2)
                );

                vscode.window.setStatusBarMessage(
                    'KeyWord "' + value + '" added',
                    4000
                );
            });
        }
    );

    //remove keyword
    vscode.commands.registerCommand(
        'ownobjectscriptextension.removeKeyWord',
        function () {
            let input = vscode.window.showInputBox({
                placeHolder: 'Remove Keyword',
            });
            input.then(function (value) {
                if (value == undefined) return;
                let valueTrimmed = value.toLowerCase().replace(/\s/g, '');
                if (!keyWords.includes(valueTrimmed)) {
                    vscode.window.showErrorMessage(
                        'Could not find keyword: ' + value
                    );
                    return;
                }
                let index = keyWords.indexOf(valueTrimmed);
                if (index > -1) {
                    keyWords.splice(index, 1); // 2nd parameter means remove one item only
                }
                fs.writeFileSync(
                    keywordsFile,
                    JSON.stringify(keyWords, null, 2)
                );
                vscode.window.setStatusBarMessage(
                    'KeyWord "' + value + '" removed',
                    4000
                );
            });
        }
    );

    //show keywords
    vscode.commands.registerCommand(
        'ownobjectscriptextension.showKeyWords',
        function () {
            let s = '';
            for (let key in keyWords) s += keyWords[key] + ' , ';
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
    );

    //add method description template
    vscode.commands.registerCommand(
        'ownobjectscriptextension.addMethodDescriptionTemplate',
        function () {
            if (!preConditions()) return;

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
                    console.log(lineString);
                    startLine = lineString;
                    startLineRange = line.range;
                    if (i == 0) break;
                    let lineAboveTmp =
                        vscode.window.activeTextEditor.document.lineAt(i - 1);
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
            for (let i in methodTemplateJSON['MethodDescription']) {
                template +=
                    '/// ' + methodTemplateJSON['MethodDescription'][i] + '\n';
            }

            // add paremeter description
            template += makeParamterTemplate(startLine);

            //if has return value
            if (startLine.split(')')[1].toLowerCase().includes('as')) {
                // Add return description
                for (let i in methodTemplateJSON['ReturnDescription']) {
                    template +=
                        '/// ' +
                        methodTemplateJSON['ReturnDescription'][i] +
                        '\n';
                }
            }
            // Add example
            if (startLine.toLowerCase().includes('classmethod')) {
                for (let i in methodTemplateJSON['ExampleClassMethod']) {
                    template +=
                        '/// ' +
                        methodTemplateJSON['ExampleClassMethod'][i] +
                        '\n';
                }
            } else {
                for (let i in methodTemplateJSON['ExampleMethod']) {
                    template +=
                        '/// ' + methodTemplateJSON['ExampleMethod'][i] + '\n';
                }
            }

            //get classname
            let className = getClassName();

            //get method name
            let methodName = startLine.split(' ')[1];
            if (methodName.includes('(')) methodName = methodName.split('(')[0];

            //replace spaceholder
            template = ownReplaceAll(template, '*classname*', className);
            template = ownReplaceAll(template, '*methodname*', methodName);

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
    );

    //add inline comments
    vscode.commands.registerCommand(
        'ownobjectscriptextension.addInlineComments',
        function () {
            if (!preConditions()) return;
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
                        line =
                            vscode.window.activeTextEditor.document.lineAt(i);
                    }
                    startIndex = i;
                    endIndex = skipUnitlToken(i, '{', '}');
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
                    if (
                        trimmedLine == '{' ||
                        trimmedLine == '}' ||
                        trimmedLine == ''
                    )
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
    );

    //make select statement
    vscode.commands.registerCommand(
        'ownobjectscriptextension.makeSelectStatement',
        function () {
            if (!preConditions()) return;

            let className = getClassName();
            for (let i = 1; i < (className.match(/\./g) || []).length; i++) {
                className = className.replace('.', '_');
            }

            let selectStmt = 'SELECT *\nFROM ' + className;
            //Copy to clipboard
            vscode.env.clipboard.writeText(selectStmt);

            if (
                vscode.workspace
                    .getConfiguration('ownobjectscriptextension.sql')
                    .get('OpenSQLFile')
            ) {
                vscode.workspace
                    .openTextDocument({ language: 'sql', content: selectStmt })
                    .then((a) => {
                        vscode.window.showTextDocument(a, 1, false);
                    });
            }
        }
    );

    //translate embedded python
    vscode.commands.registerCommand(
        'ownobjectscriptextension.translateEmbPython',
        function () {
            if (!preConditions()) return;

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
                        lineString +=
                            vscode.window.activeTextEditor.document.lineAt(
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
                        methodAttributes = lineString
                            .split('[')[1]
                            .split(']')[0];
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
            let lastMethodLine = skipUnitlToken(firstMethodLine, '{', '}');
            let methodHead = '';
            let finishedHead = false;
            for (let i = firstMethodLine; i < lastMethodLine; i++) {
                let line =
                    vscode.window.activeTextEditor.document.lineAt(i).text;
                if (!finishedHead) {
                    methodHead += line + '\n';
                } else methodText.push(line);
                if (line.includes('{')) finishedHead = true;
            }
            console.log(methodHead);
            console.log(methodText);

            let endLineIndex = skipUnitlToken(startLineIndex, '{', '}');

            vscode.window.activeTextEditor.edit(function (editBuilder) {
                //add language = python
                if (!methodHead.includes('['))
                    methodHead =
                        methodHead.split('{')[0] +
                        '[Language = python]' +
                        '{\n';
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
                            methodHead
                                .split('[')[1]
                                .replace(/objectscript/i, 'python');
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
                for (const element of methodText) {
                    let newLine = convertObjectscriptToPython(element) + '\n';
                    methodHead += newLine;
                }
                methodHead += '}\n\n';
                console.log(methodHead);
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
    );

    //open method template file
    vscode.commands.registerCommand(
        'ownobjectscriptextension.editMethodDescriptionTemplate',
        function () {
            vscode.workspace
                .openTextDocument(vscode.Uri.file(methodTemplateFile))
                .then((a) => {
                    vscode.window.showTextDocument(a, 1, false);
                });
        }
    );

    //create new class
    vscode.commands.registerCommand(
        'ownobjectscriptextension.createNewClass',
        async function () {
            //Get workspace folder
            if (vscode.workspace.workspaceFolders.length == 0) {
                vscode.window.showErrorMessage(
                    'Open a folder in your workspace!'
                );
                return;
            }
            let workspacefolderUri = undefined;
            if (vscode.workspace.workspaceFolders.length > 1) {
                let wsfList = [];
                for (let i in vscode.workspace.workspaceFolders) {
                    wsfList.push(vscode.workspace.workspaceFolders[i].name);
                }
                let choice = undefined;
                await vscode.window
                    .showQuickPick(wsfList, {
                        placeHolder: 'Select a folder:',
                    })
                    .then(
                        (value) => {
                            choice = value;
                        },
                        (reason) => {
                            vscode.window.showErrorMessage(
                                'Something went wrong:' + reason
                            );
                        }
                    );
                for (let i in vscode.workspace.workspaceFolders) {
                    if (choice == vscode.workspace.workspaceFolders[i].name) {
                        workspacefolderUri =
                            vscode.workspace.workspaceFolders[i].uri;
                        break;
                    }
                }
            } else {
                workspacefolderUri = vscode.workspace.workspaceFolders[0].uri;
            }
            if (workspacefolderUri == undefined) {
                vscode.window.showErrorMessage('Something went wrong!');
                return;
            }

            //select kind of class
            let kind = undefined;
            await vscode.window
                .showQuickPick(
                    [
                        'Class',
                        'Business Service',
                        'Business Operation',
                        'Message',
                    ],
                    { placeHolder: 'New' }
                )
                .then(
                    (value) => {
                        kind = value;
                    },
                    (reason) => {
                        vscode.window.showErrorMessage(
                            'Something went wrong:' + reason
                        );
                    }
                );
            if (kind == undefined) return;
            // get class name and package
            let className = undefined;
            let packageName = undefined;
            if (
                vscode.workspace
                    .getConfiguration('ownobjectscriptextension.create')
                    .get('AskForPackageFirst')
            ) {
                packageName = await vscode.window.showInputBox({
                    placeHolder: 'Package',
                });
                if (packageName == undefined) return;
                className = await vscode.window.showInputBox({
                    placeHolder: 'Class Name',
                });
                if (className == undefined) return;
            } else {
                className = await vscode.window.showInputBox({
                    placeHolder: 'Class Name',
                });
                if (className == undefined) return;
                packageName = await vscode.window.showInputBox({
                    placeHolder: 'Package',
                });
                if (packageName == undefined) return;
            }

            let text = undefined;

            // get the code
            switch (kind) {
                case 'Class':
                    text = await wizard.createClass(className, packageName);
                    break;
                case 'Business Service':
                    text = await wizard.createBusinessService(
                        className,
                        packageName
                    );
                    break;
                case 'Business Operation':
                    text = await wizard.createBusinessOperation(
                        className,
                        packageName
                    );
                    break;
                case 'Message':
                    text = await wizard.createMessage(className, packageName);
                    break;
                default:
                    vscode.window.showErrorMessage('Something went wrong!');
                    return;
            }

            if (text == undefined) return;

            let fileUri = vscode.Uri.joinPath(
                workspacefolderUri,
                packageName,
                className + '.cls'
            );

            await vscode.workspace.fs.writeFile(
                fileUri,
                new TextEncoder().encode(text)
            );

            let doc = await vscode.workspace.openTextDocument(fileUri); // calls back into the provider
            await vscode.window.showTextDocument(doc, { preview: false });
        }
    );

    /* const provider2 = vscode.languages.registerCompletionItemProvider(
        'plaintext',
        {
            provideCompletionItems(
                document = vscode.window.activeTextEditor.document,
                position = vscode.window.activeTextEditor.selection.active
            ) {
                // get all text until the `position` and check if it reads `console.`
                // and if so then complete if `log`, `warn`, and `error`
                const linePrefix = document
                    .lineAt(position)
                    .text.substr(0, position.character);
                if (!linePrefix.endsWith('console.')) {
                    return undefined;
                }

                return [
                    new vscode.CompletionItem(
                        'log',
                        vscode.CompletionItemKind.Method
                    ),
                    new vscode.CompletionItem(
                        'warn',
                        vscode.CompletionItemKind.Method
                    ),
                    new vscode.CompletionItem(
                        'error',
                        vscode.CompletionItemKind.Method
                    ),
                ];
            },
        },
        '.' // triggered whenever a '.' is being typed
    ); */

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

/**
 * Converts a line from objectscript to python
 * @param {string} line the line to convert
 */
function convertObjectscriptToPython(line) {
    let trimmedLine = line.toLowerCase().replace(/\s/g, '');
    //##class to __class
    line = ownReplaceAll(line, '##class', 'iris.cls');
    //comments
    line = ownReplaceAll(line, '//', '#');
    //_ to +
    line = line.replace(/_/g, ' + ');

    //remove set
    if (trimmedLine.startsWith('set')) {
        line = line.replace(/set\s*/i, '');
    }
    //remove do
    if (trimmedLine.startsWith('do')) {
        line = line.replace(/do\s*/i, '');
    }
    //write to print
    if (trimmedLine.startsWith('write')) {
        line = line.replace(/write\s*/i, 'print(');
        line += ')';
        line = line.replace(/!/g, '"\\n"');
    }
    //remove #dim
    if (trimmedLine.startsWith('#dim')) {
        line = line.replace(/#dim\s*/i, '');
    }
    //make lowercase return
    if (trimmedLine.startsWith('return')) {
        line = line.replace(/return/i, 'return');
    }

    let isCondition = false;
    // if
    if (trimmedLine.startsWith('if')) {
        line = line.replace(/if/i, 'if');
        isCondition = true;
    }
    //else
    if (trimmedLine.startsWith('else')) {
        line = line.replace(/else/i, 'else');
        isCondition = true;
    }
    //elseif
    if (trimmedLine.startsWith('elseif')) {
        line = line.replace(/elseif/i, 'elif');
        isCondition = true;
    }
    //while
    if (trimmedLine.startsWith('while')) {
        line = line.replace(/while/i, 'while');
        isCondition = true;
    }
    //if condition convert = to == and '= to !=
    if (isCondition) {
        line = line.replace(/=/g, '==');
        line = line.replace(/'==/g, '!=');
    }

    //$$$OK to 1
    line = line.replace(/\$\$\$ok/gi, '1');
    //% to _
    line = line.replace(/%/g, '_');
    //{ to :
    line = line.replace(/{/g, ':');
    //remove }
    line = line.replace(/}/g, '');
    //this
    line = line.replace(/\.\./g, 'self.');

    //Byref
    //line = line.replace(/\s\./g, 'iris.ref(');

    //$FIND to find()
    if (trimmedLine.includes('$f')) {
        line = line.replace(/\$f/gi, '$F');
        line = line.replace(/\$find/gi, '$F');
        let firstParam = line.split('$F')[1].split('(')[1].split(',')[0];
        line = line.replace('$F(' + firstParam + ',', firstParam + '.find(');
    }
    //$PIECE to split()
    if (trimmedLine.includes('$p')) {
        line = line.replace(/\$p/gi, '$P');
        line = line.replace(/\$piece/gi, '$P');
        let firstParam = line.split('$P')[1].split('(')[1].split(',')[0];
        line = line.replace('$P(' + firstParam + ',', firstParam + '.split(');
    }
    //$REPLACE to replace()
    if (trimmedLine.includes('$replace')) {
        line = line.replace(/\$replace/gi, '$REPLACE');
        let firstParam = line.split('$REPLACE')[1].split('(')[1].split(',')[0];
        line = line.replace(
            '$REPLACE(' + firstParam + ',',
            firstParam + '.replace('
        );
    }

    return line;
}

/**
 * @param {string} s
 * @param {string} searchString
 * @param {string} replaceString
 */
function ownReplaceAll(s, searchString, replaceString) {
    while (s.includes(searchString)) s = s.replace(searchString, replaceString);
    return s;
}

/**
 * Gets the name of the class
 * @returns {string} the name of the class
 */
function getClassName() {
    let document = vscode.window.activeTextEditor.document;
    for (let i = 0; i < document.lineCount; i++) {
        let line = document.lineAt(i);
        if (line.text.toLowerCase().replace(/\s/g, '').startsWith('class')) {
            let className = line.text.split(' ')[1];
            return className;
        }
    }
    return '';
}

/**
 * @param {string} startLine
 */
function makeParamterTemplate(startLine) {
    let parameterRaw = startLine.split('(')[1];
    let parameterArray = parameterRaw.split(')')[0].split(',');
    let parameterTemplate = '';
    //Add parameter
    for (let i in parameterArray) {
        while (true) {
            if (parameterArray[i].charAt(0) == ' ') {
                parameterArray[i] = parameterArray[i].replace(' ', '');
            } else {
                break;
            }
        }
        let name = parameterArray[i].split(' ')[0];
        if (name.toLowerCase() == 'byref' || name.toLowerCase() == 'output')
            name = parameterArray[i].split(' ')[1];
        if (name != '') {
            let isOptional = parameterArray[i].includes('=') ? true : false;
            for (let j in methodTemplateJSON['ParameterDescription']) {
                let temp = methodTemplateJSON['ParameterDescription'][j];
                temp = ownReplaceAll(temp, '*parametername*', name);
                temp = ownReplaceAll(
                    temp,
                    '*optional*',
                    isOptional ? '(optional)' : ''
                );
                parameterTemplate += '/// ' + temp + '\n';
            }
        }
    }
    return parameterTemplate;
}

function preConditions() {
    // Check if there is an active TexteEditor
    if (vscode.window.activeTextEditor == undefined) {
        vscode.window.showErrorMessage(
            'Please open an ObjectScript file first!'
        );
        return false;
    }

    // Check if TextEditor is ObjectScript
    if (!vscode.window.activeTextEditor.document.fileName.endsWith('.cls')) {
        vscode.window.showErrorMessage('Only works with ObjectScript files!');
        return false;
    }
    return true;
}

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

function createWorkspace() {
    //make workspace
    fs.mkdir(workspacePath, (err) => {
        if (err) throw err;
    });
    //make keywords
    fs.writeFileSync(
        path.join(workspacePath, 'Keywords.json'),
        fs.readFileSync(path.join(__dirname, 'Keywords.json')).toString()
    );
    //make MethodDescriptionTemplate
    fs.writeFileSync(
        path.join(workspacePath, 'MethodDescriptionTemplate.json'),
        fs
            .readFileSync(
                path.join(__dirname, 'MethodDescriptionTemplate.json')
            )
            .toString()
    );
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
