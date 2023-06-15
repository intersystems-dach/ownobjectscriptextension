const vscode = require('vscode');
const globalFunctions = require('../GlobalFunctions');

function makeSelectStatement() {
    if (!globalFunctions.preConditions()) return;

    let className = globalFunctions.getClassName();
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

module.exports = {
    makeSelectStatement,
};
