const vscode = require('vscode');

const Modifier = require('./commands/Modifier');
const Documentation = require('./commands/Documentation');
const SQL = require('./commands/SQL');
const Translate = require('./commands/Translate');
const Create = require('./commands/Create');

const WorkspaceManager = require('./WorkspaceManager.js');
const workspaceManager = new WorkspaceManager();
workspaceManager.init();

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    //Add ObjectScript Modifier
    vscode.commands.registerCommand(
        'ownobjectscriptextension.addObjectScriptModifier',
        Modifier.addObjectScriptModifier
    );

    //add keyword
    vscode.commands.registerCommand(
        'ownobjectscriptextension.addKeyWord',
        Modifier.addKeyWord
    );

    //remove keyword
    vscode.commands.registerCommand(
        'ownobjectscriptextension.removeKeyWord',
        Modifier.removeKeyWord
    );

    //show keywords
    vscode.commands.registerCommand(
        'ownobjectscriptextension.showKeyWords',
        Modifier.showKeyWords
    );

    //add method description template
    vscode.commands.registerCommand(
        'ownobjectscriptextension.addMethodDescriptionTemplate',
        Documentation.addMethodDescriptionTemplate
    );

    //add inline comments
    vscode.commands.registerCommand(
        'ownobjectscriptextension.addInlineComments',
        Documentation.addInlineComments
    );

    //open intersystems class documentation
    vscode.commands.registerCommand(
        'ownobjectscriptextension.openDocumentation',
        Documentation.openDocumentation
    );

    //intersystems web search
    vscode.commands.registerCommand(
        'ownobjectscriptextension.intersystemsWebSearch',
        Documentation.intersystemsWebSearch
    );

    //open method template file
    vscode.commands.registerCommand(
        'ownobjectscriptextension.editMethodDescriptionTemplate',
        Documentation.editMethodDescriptionTemplate
    );

    //make select statement
    vscode.commands.registerCommand(
        'ownobjectscriptextension.makeSelectStatement',
        SQL.makeSelectStatement
    );

    //translate embedded python
    vscode.commands.registerCommand(
        'ownobjectscriptextension.translateEmbPython',
        Translate.translateEmbPython
    );

    //create new class
    vscode.commands.registerCommand(
        'ownobjectscriptextension.createNewClass',
        Create.createNewClass
    );

    /* const completionProvider = vscode.languages.registerCompletionItemProvider(
        'javascript',
        {
            provideCompletionItems(document, position) {
                // Check if the current word is 'hello'
                const wordRange = document.getWordRangeAtPosition(position);
                const currentWord = wordRange
                    ? document.getText(wordRange)
                    : '';
                console.log(currentWord);
                if (currentWord !== 'hello') {
                    return undefined;
                }

                // Return a completion item for 'hello'
                const completionItem = new vscode.CompletionItem(
                    'hello',
                    vscode.CompletionItemKind.Keyword
                );
                completionItem.insertText = 'Hello, world!';
                return [completionItem];
            },
        },
        'h' // Specify the trigger character for the completion provider
    );
    context.subscriptions.push(completionProvider); */
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
