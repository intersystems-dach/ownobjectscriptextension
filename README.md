# OwnObjectScriptExtension

A VSCode Extension for [InterSystems ObjectScript](https://docs.intersystems.com/irislatest/csp/docbook/DocBook.UI.Page.cls?KEY=GCOS_INTRO).
Adds `Set`, `Do` and `Write` modifier to your ObjectScript code.

## Features

Add modifiers with the `Add ObjectScript Modifier` Command. After successfully adding the modifiers, you will receive a message with the lines where modifier where added.

<img alt="Gif" src="https://github.com/phil1436/ownobjectscriptextension/raw/master/resources/demo.gif" width="100%"/>

> Tip: You can use IntelliSense even if you have errors in your code.

## Requirements

The [InterSystems ObjectScript Extension](https://intersystems-community.github.io/vscode-objectscript/) should be installed and an active texteditor with an ObjectScript file should be open.

## Install

Clone this repository under `~/.vscode/extensions`.

<pre>
git clone https://github.com/phil1436/ownobjectscriptextension C:\Users\your-user\.vscode\extensions\ownobjectscriptextension
</pre>

## Commands

- `Add ObjectScript Modifier`: Adds `Set`, `Do` and `Write` modifier to your ObjectScript code.
- `Toggle Save File after Add Modifier`: Toggle if the file gets saved after the Command `Add ObjectScript Modifier` (is off by default).
- `Toggle Show Lines-Modified-Messages`: Toggle if a message box will be displayed after `Add ObjectScript Modifier` with information about the modified lines (is on by default).
- `Add ObjectScript Keyword`: Adds an Objectscript keyword to options.json. If a line starts with one of those keywords no modifier will be added.
- `Remove ObjectScript Keyword`: Remove an ObjectScript keyword.
- `Show ObjectScript Keywords`: Shows the current list of keywords.

<!-- ## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

- `myExtension.enable`: Enable/disable this extension.
- `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension. -->

## [Release Notes](https://github.com/phil1436/ownobjectscriptextension/blob/master/CHANGELOG.md)

## [v0.0.2](https://github.com/phil1436/ownobjectscriptextension/tree/0.0.2)

- options.json added
- Commands added

## [v0.0.1](https://github.com/phil1436/ownobjectscriptextension/tree/0.0.1)

- *Initial release*

---

by Philipp B.
