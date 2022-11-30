<img src="https://github.com/phil1436/ownobjectscriptextension/raw/master/resources/logo.png" width="15%"/> 

# OwnObjectScriptExtension

A VSCode Extension for [InterSystems ObjectScript](https://docs.intersystems.com/irislatest/csp/docbook/DocBook.UI.Page.cls?KEY=GCOS_INTRO).
Adds `Set`, `Do` and `Write` modifier to your ObjectScript code.
Generates description templates for your Methods

---
## Features

### `Add ObjectScript Modifier`

This command automatically adds `Set`, `Do` and `Write` to your InterSystems ObjectScript code.
<img alt="Gif" src="https://github.com/phil1436/ownobjectscriptextension/raw/master/resources/demo.gif" width="100%"/>

> Tip: You can use IntelliSense even if you have errors in your code.

### `Add Method Description Template`

Generates description templates for your Methods. Just put your cursor in the Method and execute this command. Only works with `Method` and `ClassMethod`.

<img alt="Gif" src="https://github.com/phil1436/ownobjectscriptextension/raw/master/resources/demoAddDescription.gif" width="100%"/>

<img alt="png" src="https://github.com/phil1436/ownobjectscriptextension/raw/master/resources/demoAddDescriptionClassReference.png" width="100%"/>

> Tip: You can change the template in the options.json file.

---

## Requirements

The [InterSystems ObjectScript Extension](https://intersystems-community.github.io/vscode-objectscript/) should be installed and an active Texteditor with an Intersystems ObjectScript file should be open.

---

## Install

Clone this repository under `~/.vscode/extensions`.

<pre>
git clone https://github.com/phil1436/ownobjectscriptextension C:\Users\your-user\.vscode\extensions\ownobjectscriptextension
</pre>
Reload window after installation!

---

## Commands

### Own ObjectScript Settings

- `Open Settings File`: Opens the `options.json` file.
- `Toggle Save File after Command`: Toggle if the file gets saved after a Command (is off by default).
- `Toggle Show Lines-Modified-Messages`: Toggle if a message box will be displayed after a Command (is on by default).

### Own ObjectScript Modifier

- `Add ObjectScript Modifier`: Adds `Set`, `Do` and `Write` modifier to your ObjectScript code.
- `Show ObjectScript Keywords`: Shows the current list of keywords.
- `Add ObjectScript Keyword`: Adds an Objectscript keyword to options.json. If a line starts with one of those keywords no modifier will be added.
- `Remove ObjectScript Keyword`: Remove an ObjectScript keyword.

> Tip: Lines with keywords at the beginning will be ignored.

### Own ObjectScript Comment

- `Add Method Description Template`: Adds a description template to your Method or ClassMethod.

<!-- ## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

- `myExtension.enable`: Enable/disable this extension.
- `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension. -->
---

## [Release Notes](https://github.com/phil1436/ownobjectscriptextension/blob/master/CHANGELOG.md)

## [v0.0.3](https://github.com/phil1436/ownobjectscriptextension/tree/0.0.3)

- Design changes
- Commands added

## [v0.0.2](https://github.com/phil1436/ownobjectscriptextension/tree/0.0.2)

- options.json added
- Commands added

## [v0.0.1](https://github.com/phil1436/ownobjectscriptextension/tree/0.0.1)

- *Initial release*

---

by Philipp B.
