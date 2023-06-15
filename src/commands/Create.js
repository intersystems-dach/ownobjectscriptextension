const vscode = require('vscode');
const wizard = require('../wizard');
const { TextEncoder } = require('util');

async function createNewClass() {
    //Get workspace folder
    if (vscode.workspace.workspaceFolders.length == 0) {
        vscode.window.showErrorMessage('Open a folder in your workspace!');
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
                workspacefolderUri = vscode.workspace.workspaceFolders[i].uri;
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
            ['Class', 'Business Service', 'Business Operation', 'Message'],
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
            text = await wizard.createClass(packageName, className);
            break;
        case 'Business Service':
            text = await wizard.createBusinessService(
                packageName,
                className,
                vscode.workspace
                    .getConfiguration('ownobjectscriptextension.create.service')
                    .get('AddTargetConfigNames')
            );
            break;
        case 'Business Operation':
            text = await wizard.createBusinessOperation(packageName, className);
            break;
        case 'Message':
            text = await wizard.createMessage(packageName, className);
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

module.exports = {
    createNewClass,
};
