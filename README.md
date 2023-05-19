<div align="center">
    <br />
    <img src="https://github.com/phil1436/ownobjectscriptextension/raw/master/resources/logo.png" width="20%"/>
    <h1>OwnObjectScriptExtension</h1>
    <p>
    A <a href = "https://code.visualstudio.com/">Visual Studio Code</a> extension that supplies tools for <a href="https://docs.intersystems.com/irislatest/csp/docbook/DocBook.UI.Page.cls?KEY=GCOS_INTRO">InterSystems ObjectScript</a>.
    </p>
</div>

<div align="center">
<br />

[![current release](https://img.shields.io/github/v/release/phil1436/ownobjectscriptextension?display_name=tag)](https://github.com/phil1436/ownobjectscriptextension/releases)
[![license](https://img.shields.io/github/license/phil1436/ownobjectscriptextension)](https://github.com/phil1436/ownobjectscriptextension/blob/master/LICENSE)
[![stars](https://img.shields.io/github/stars/phil1436/ownobjectscriptextension)](https://github.com/phil1436/ownobjectscriptextension/stargazers)
![last commit](https://img.shields.io/github/last-commit/phil1436/ownobjectscriptextension)

</div>

---

-   [Features](#features)
    -   [Create New Class](#create-new-class-_beta_)
    -   [Add ObjectScript Modifier](#add-objectscript-modifier)
    -   [Add Method Description Template](#add-method-description-template)
    -   [Make Select Statement](#make-select-statement)
    -   [Translate Embedded Python](#translate-embedded-python-_beta_)
-   [Requirements](#requirements)
-   [Installation](#installation)
-   [Workspace](#workspace)
-   [Commands](#commands)
    -   [Own ObjectScript Create](#own-objectscript-create)
    -   [Own ObjectScript Modifier](#own-objectscript-modifier)
    -   [Own ObjectScript Comment](#own-objectscript-comment)
    -   [Own ObjectScript SQL](#own-objectscript-sql)
    -   [Own ObjectScript Translate](#own-objectscript-translate)
-   [Configuration](#configuration)
    -   [Sql](#sql)
    -   [Comment](#comment)
    -   [Create](#create)
-   [Bugs](#bugs)
-   [Release Notes](#release-notes)

---

## Features

### `Create New Class` _BETA_

Creates a new ObjectScript Class, Message, Business Service or Business Operation similar to the InterSystems Studio Wizard. Just execute the command and follow the instructions.

![DemoCreateNewClass](resources/DemoCreateNewClass.gif)

> This feature is still in beta.

### `Add ObjectScript Modifier`

This command automatically adds `Set`, `Do` and `Write` to your InterSystems ObjectScript code.

![demo](https://github.com/phil1436/ownobjectscriptextension/raw/master/resources/demo.gif)

> Tip: You can use IntelliSense even if you have errors in your code.

### `Add Method Description Template`

Generates description templates for your Methods. Just put your cursor in the Method and execute this command. Only works with `Method` and `ClassMethod`.

![demoAddDescription](https://github.com/phil1436/ownobjectscriptextension/raw/master/resources/demoAddDescription.gif)

<img alt="png" src="https://github.com/phil1436/ownobjectscriptextension/raw/master/resources/demoAddDescriptionClassReference.png" width="70%"/>

> Tip: You can change the template in the options.json file.

### `Make Select Statement`

Generates a _SELECT_ statement based on the current opened file.

![demoMakeSelectStatement](https://github.com/phil1436/ownobjectscriptextension/raw/master/resources/DemoMakeSelectStatement.gif)

> Tip: Install the [SQLTools](https://github.com/mtxr/vscode-sqltools) extension to execute the statement directly in VSCode.

### `Translate Embedded Python` _BETA_

Translate an ObjectSCript Method to embedded python. Will generate a new method with the same name and the prefix _py_.

![demoTranslateEmbeddedPython](https://github.com/phil1436/ownobjectscriptextension/raw/master/resources/demoTranslateEmbeddedPython.gif)

> This feature is still in beta.

---

## Requirements

The [InterSystems ObjectScript Extension](https://intersystems-community.github.io/vscode-objectscript/) should be installed and an active Texteditor with an Intersystems ObjectScript file should be open.

---

## Installation

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

-   `Create New Class`: Creates a new ObjectScript class. See [here](#create-new-class-beta) for more information.

### Own ObjectScript Modifier

-   `Add ObjectScript Modifier`: Adds `Set`, `Do` and `Write` modifier to your ObjectScript code. See [here](https://github.com/phil1436/ownobjectscriptextension#add-objectscript-modifier) for more information.
-   `Show ObjectScript Keywords`: Shows the current list of keywords.
-   `Add ObjectScript Keyword`: Adds an Objectscript keyword to options.json. If a line starts with one of those keywords no modifier will be added.
-   `Remove ObjectScript Keyword`: Remove an ObjectScript keyword.

> Tip: Lines starting with a keyword will be ignored.

### Own ObjectScript Comment

-   `Add Method Description Template`: Adds a description template to your Method or ClassMethod. See [here](#add-method-description-template) for more information.
-   `Add Inline Comments`: Adds a comment in the current Method every specified count of lines without any comment (Default is every 5 lines).
-   `Edit Method Description Template`: Opens the _MethodDescriptionTemplate.json_ file so can edit the method template. Reload Window after editing.

### Own ObjectScript SQL

-   `Make Select Statement`: Copies a SQL-Select-Statement based on the currently opened file to the clipboard. If _OpenSQLFile_ is enabled a sql file will be generated.

### Own ObjectScript Translate

-   `Translate Embedded Python`: Translates an Objectscript method to a new method with embedded python. See [here](#translate-embedded-python-beta) for more information.

---

## Configuration

Go to `File > Preferences > Settings` and than navigate to `Extensions > OwnObjectscriptExtension`.

-   `Save File`: Set if the current opend file will be saved after a command (Default: _disabled_).
-   `Show Messages`: Set if the extension will show information messages (Default: _enabled_).

### Sql

-   `Open SQLFile`: Set if a sql file will be opened with `Own ObjectScript SQL: Make SQL Select File` (Default: _disabled_).

### Comment

-   `In Line Comment Count`: Sets the line count between added comments for `Own ObjectScript Comment: Add Inline Comments` (Default: _5_).

### Create

-   `Ask For Package First`: Set if the extension should ask for the package first (Default: _disabled_).
-   `Service: Add Target Config Names`: If enabled a property called `TargetConfigNames` will be added to your service, that represent the business partners inside of the production. (Default: _disabled_).

---

## Bugs

-   _no known bugs_

---

## [Release Notes](https://github.com/phil1436/ownobjectscriptextension/blob/master/CHANGELOG.md)

### [v0.0.14](https://github.com/phil1436/ownobjectscriptextension/tree/0.0.14)

-   Configuartion `Create > Service: Add Target Config Names` added

---

by Philipp B.

powered by [InterSystems](https://www.intersystems.com/).

_This application is **not** supported by InterSystems Corporation._
