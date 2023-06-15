const vscode = require('vscode');
const WorkspaceManager = require('./WorkspaceManager.js');
const workspaceManager = new WorkspaceManager();
workspaceManager.init();
/**
 * Converts a line from objectscript to python
 * @param {string} line the line to convert
 * @param {Array} linesArray the lines that are already converted
 * @returns {string} the converted line
 */
function convertObjectscriptToPython(line, linesArray) {
    let trimmedLine = line.toLowerCase().replace(/\s/g, '');
    //##class to iris.cls
    while (line.includes('##class')) {
        let parts = line.split('##class(');
        let className = parts[1].split(')')[0];
        line =
            parts[0] +
            'iris.cls("' +
            className +
            '")' +
            parts[1].split(')').slice(1).join(')');
    }

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
    if (trimmedLine === '{') {
        line = '';
        linesArray[linesArray.length - 1] = linesArray[
            linesArray.length - 1
        ].replace(/\n/g, '');
        linesArray[linesArray.length - 1] =
            linesArray[linesArray.length - 1] + ':';
    } else {
        line = line.replace(/{/g, ':');
    }
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
    //$$$TRACE to find()
    if (trimmedLine.includes('$$$trace')) {
        line = line.replace(/\$\$\$trace/gi, 'trace');
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

/**
 * @param {string} line
 */
function startsWithKeyword(line) {
    for (let keyWord in workspaceManager.keyWords) {
        if (
            line.startsWith(workspaceManager.keyWords[keyWord]) ||
            line.length == 0
        ) {
            return true;
        }
    }
    return false;
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
            for (let j in workspaceManager.methodTemplateJSON[
                'ParameterDescription'
            ]) {
                let temp =
                    workspaceManager.methodTemplateJSON['ParameterDescription'][
                        j
                    ];
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

module.exports = {
    addModifier,
    skipUnitlToken,
    preConditions,
    convertObjectscriptToPython,
    ownReplaceAll,
    getClassName,
    startsWithKeyword,
    makeParamterTemplate,
};
