const path = require('path');
const fs = require('fs');

class WorkspaceManager {
    constructor() {
        this.workspacePath = undefined;
        this.keywordsFile = undefined;
        this.keyWords = undefined;
        this.methodTemplateFile = undefined;
        this.methodTemplateJSON = undefined;
    }

    init() {
        this.workspacePath = path.join(
            __dirname,
            '../../',
            'ownobjectscriptextension-workspace'
        );

        try {
            this.keywordsFile = path.join(this.workspacePath, 'Keywords.json');

            this.keyWords = JSON.parse(
                fs.readFileSync(this.keywordsFile).toString()
            );
        } catch (e) {
            this.createWorkspace();

            this.keywordsFile = path.join(this.workspacePath, 'Keywords.json');

            this.keyWords = JSON.parse(
                fs.readFileSync(this.keywordsFile).toString()
            );
        }

        try {
            this.methodTemplateFile = path.join(
                this.workspacePath,
                'MethodDescriptionTemplate.json'
            );

            this.methodTemplateJSON = JSON.parse(
                fs.readFileSync(this.methodTemplateFile).toString()
            );
        } catch (e) {
            this.createWorkspace();

            this.methodTemplateFile = path.join(
                this.workspacePath,
                'MethodDescriptionTemplate.json'
            );

            this.methodTemplateJSON = JSON.parse(
                fs.readFileSync(this.methodTemplateFile).toString()
            );
        }
    }

    createWorkspace() {
        //make workspace
        fs.mkdir(this.workspacePath, (err) => {
            if (err) throw err;
        });
        //make keywords
        fs.writeFileSync(
            path.join(this.workspacePath, 'Keywords.json'),
            fs
                .readFileSync(path.join(__dirname, '../', 'Keywords.json'))
                .toString()
        );
        //make MethodDescriptionTemplate
        fs.writeFileSync(
            path.join(this.workspacePath, 'MethodDescriptionTemplate.json'),
            fs
                .readFileSync(
                    path.join(
                        __dirname,
                        '../',
                        'MethodDescriptionTemplate.json'
                    )
                )
                .toString()
        );
    }
}

module.exports = WorkspaceManager;
