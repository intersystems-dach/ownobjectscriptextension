<div align="center">
    <br />
    <img src="https://github.com/phil1436/ownobjectscriptextension/raw/master/resources/logo.png" alt="OwnObjectScriptExtensionLogo" width="30%"/>
    <h1>OwnObjectScriptExtension</h1>
    <p>
    A <a href = "https://code.visualstudio.com/">Visual Studio Code</a> extension that supplies tools for <a href="https://docs.intersystems.com/irislatest/csp/docbook/DocBook.UI.Page.cls?KEY=GCOS_INTRO">InterSystems ObjectScript</a>.
    </p>
</div>

<div align="center">
    <a href="https://github.com/phil1436/ownobjectscriptextension/releases">
        <img src= "https://img.shields.io/github/v/release/phil1436/ownobjectscriptextension?display_name=tag" alt="current release">
    </a>
    <img alt="Visual Studio Marketplace Installs" src="https://img.shields.io/visual-studio-marketplace/azure-devops/installs/total/PhilippB.ownobjectscriptextension">
    <a href="https://github.com/phil1436/ownobjectscriptextension/blob/master/LICENSE">
        <img src="https://img.shields.io/github/license/phil1436/ownobjectscriptextension" alt="license">
    </a>
    <a href="https://github.com/phil1436/ownobjectscriptextension/stargazers">
        <img src="https://img.shields.io/github/stars/phil1436/ownobjectscriptextension" alt="stars">
    </a>
    <a href="https://github.com/phil1436/ownobjectscriptextension/commits/master">
        <img src="https://img.shields.io/github/last-commit/phil1436/ownobjectscriptextension" alt="last commit">
    </a>
</div>

---

-   [Features](#features)
    -   [Add Method Description](#add-method-description)
    -   [Make Select Statement](#make-select-statement)
    -   [Create New Wizard](#create-new-wizard-_beta_)
    -   [Translate Embedded Python](#translate-embedded-python-_beta_)
-   [Requirements](#requirements)
-   [Installation](#installation)
    -   [Install from VSCode Marketplace](#install-from-vscode-marketplace)
    -   [Install from GitHub](#install-from-github)
-   [Workspace](#workspace)
-   [Commands](#commands)
-   [Configuration](#configuration)
-   [Color Theme](#color-theme)
-   [Bugs](#bugs)
-   [Release Notes](#release-notes)

---

## Features

<!-- ### `Add ObjectScript Modifier`

This command automatically adds `Set`, `Do` and `Write` to your InterSystems ObjectScript code.

![demo](https://github.com/phil1436/ownobjectscriptextension/raw/master/resources/demo.gif)

> Tip: You can use IntelliSense even if you have errors in your code. -->

### `Add Method Description`

Writing comprehensive method descriptions is essential for maintaining code clarity and promoting collaboration. Simply place your cursor within a method and execute the `Add Method Description` command. The command will automatically generate a description template for the method, making it easy to provide meaningful documentation.

![demoAddDescription](https://github.com/phil1436/ownobjectscriptextension/raw/master/resources/demoAddDescription.gif)

<img alt="png" src="https://github.com/phil1436/ownobjectscriptextension/raw/master/resources/demoAddDescriptionClassReference.png" width="70%"/>

> Tip: You can change the template with the `Edit Method Description Template` command.

### `Make Select Statement`

When working with ObjectScript, you often need to interact with databases. The `Make Select Statement` feature simplifies the process of generating SQL _SELECT_ statements. By analyzing the currently opened ObjectScript file, the extension creates a _SELECT_ statement based on the class name.

![demoMakeSelectStatement](https://github.com/phil1436/ownobjectscriptextension/raw/master/resources/DemoMakeSelectStatement.gif)

> Tip: Install the [SQLTools](https://github.com/mtxr/vscode-sqltools) extension to execute the statement directly within Visual Studio Code.

### `Create New Wizard` _BETA_

Creating new ObjectScript classes, messages, business services, or business operations is made more convenient with the `Create New Wizard` feature. This wizard-like interface guides you through the process of generating new components, resembling the familiar InterSystems Studio Wizard. By executing the command and following the instructions, you can quickly set up new ObjectScript artifacts, saving you time and effort.

![DemoCreateNewClass](https://raw.githubusercontent.com/phil1436/ownobjectscriptextension/master/resources/DemoCreateNewClass.gif)

> This feature is currently in beta and may not work as expected. You may have to adjust the generated code.

### `Translate Embedded Python` _BETA_

In certain scenarios, you may want to leverage the power of Python within your ObjectScript code. The `Translate Embedded Python` feature allows you to translate ObjectScript methods to embedded Python methods. By executing the command, the extension generates a new method with the same name, prefixed with _py_. This enables you to incorporate Python functionality while maintaining the structure and organization of your codebase.

![demoTranslateEmbeddedPython](https://github.com/phil1436/ownobjectscriptextension/raw/master/resources/demoTranslateEmbeddedPython.gif)

> This feature is currently in beta and may not work as expected. You may have to adjust the generated code.

---

## Requirements

-   Visual Studio Code 1.73.0 or higher
-   The [InterSystems ObjectScript Extension](https://intersystems-community.github.io/vscode-objectscript/) should be installed and an active Texteditor with an Intersystems ObjectScript file should be open.

---

## Installation

### Install from VSCode Marketplace

-   Open the Extensions sidebar in Visual Studio Code
-   Search for `OwnObjectScriptExtension`
-   Click `Install`

### Install from GitHub

-   Clone this repository (recommended under `~/.vscode/extensions`):

```shell
git clone https://github.com/phil1436/ownobjectscriptextension C:\Users\<your-user>\.vscode\extensions\ownobjectscriptextension
```

or download the [latest realease](https://github.com/phil1436/ownobjectscriptextension/releases/latest) and extract the file into `~/.vscode/extensions`.

-   If the extension did not got installed, run the command `Developer: Install Extension from Location...` and choose the extension folder.

---

## Workspace

This extension will create a directory named _ownobjectscriptextension-workspace_ in the same directory as the extension. The workspace contains all files, so your changes in those files will not be lost when installing a new version.

---

## Commands

### Own ObjectScript Create

-   `Create New Wizard`: Creates a new ObjectScript class. See [here](#create-new-wizard-beta) for more information.

### Own ObjectScript Modifier

-   `Add ObjectScript Modifier`: Adds `Set`, `Do` and `Write` modifier to your ObjectScript code. <!-- See [here](https://github.com/phil1436/ownobjectscriptextension#add-objectscript-modifier) for more information. -->
-   `Show ObjectScript Keywords`: Shows the current list of keywords.
-   `Add ObjectScript Keyword`: Adds an Objectscript keyword to options.json. If a line starts with one of those keywords no modifier will be added.
-   `Remove ObjectScript Keyword`: Remove an ObjectScript keyword.

> Tip: Lines starting with a keyword will be ignored by the command `Add ObjectScript Modifier`.

### Own ObjectScript Documentation

-   `Add Method Description`: Adds a description template to your `Method` or `ClassMethod`. See [here](#add-method-description) for more information.
-   `Edit Method Description Template`: Opens the _MethodDescriptionTemplate.json_ file so you can edit the method template. Reload Window after editing!
-   `Add Inline Comments`: Adds a comment in the current Method every specified count of lines without any comment (Default is every 5 lines).

### Own ObjectScript SQL

-   `Make Select Statement`: Copies a SQL-Select-Statement based on the currently opened file to the clipboard. If the configuration _OpenSQLFile_ is enabled a sql file will be generated.

### Own ObjectScript Translate

-   `Translate Embedded Python`: Translates an Objectscript method to a new method with embedded python. See [here](#translate-embedded-python-beta) for more information.

---

## Configuration

Go to `File > Preferences > Settings` and than navigate to `Extensions > OwnObjectscriptExtension`.

-   `Save File`: Set if the current opened file will be saved after a command (Default: _disabled_).
-   `Show Messages`: Set if the extension will show information messages (Default: _enabled_).

### Sql

-   `Open SQLFile`: Set if a sql file will be opened with `Own ObjectScript SQL: Make SQL Select File` (Default: _disabled_).

### Comment

-   `In Line Comment Count`: Sets the line count between added comments for `Own ObjectScript Comment: Add Inline Comments` (Default: _5_).

### Create

-   `Ask For Package First`: Set if the extension should ask for the package first (Default: _disabled_).
-   `Service: Add Target Config Names`: If enabled a property called `TargetConfigNames` will be added to your service, that represent the business partners inside of the production. (Default: _disabled_).

---

## Color Theme

The extension will add a new color theme called _InterSystems Real Dark_. You can change it via `File > Preferences > Theme > Color Theme`.

![InterSystemsRealDarkExample](https://raw.githubusercontent.com/phil1436/ownobjectscriptextension/master/resources/InterSystemsRealDarkExample.png)

---

## Bugs

-   _no known bugs_

---

## [Release Notes](https://github.com/phil1436/ownobjectscriptextension/blob/master/CHANGELOG.md)

### [v0.0.16](https://github.com/phil1436/ownobjectscriptextension/tree/0.0.16)

-   Refactoring
-   Bug fixes
-   Command `Add Method Description Template` renamed to `Add Method Description`

---

View on [Marketplace](https://marketplace.visualstudio.com/items?itemName=PhilippB.ownobjectscriptextension).

---

by [Philipp B.](https://github.com/phil1436)

powered by [InterSystems](https://www.intersystems.com/).

_This application is **not** supported by InterSystems Corporation. Please be notified that you use it at your own responsibility._
