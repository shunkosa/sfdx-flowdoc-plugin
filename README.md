# Flowdoc (alpha)

A Salesforce CLI plugin that generates design document from Lightning Flow metadata. If you're not familiar with CLI, try the [web app version](https://flowdoc.herokuapp.com/).

[![Github Workflow](https://github.com/shunkosa/sfdx-flowdoc-plugin/workflows/unit%20test/badge.svg?branch=master)](https://github.com/shunkosa/sfdx-flowdoc-plugin/actions?query=workflow%3A%22unit%20test%22)
[![Version](https://img.shields.io/npm/v/sfdx-flowdoc-plugin.svg)](https://npmjs.org/package/sfdx-flowdoc-plugin)
[![Codecov](https://codecov.io/gh/shunkosa/sfdx-flowdoc-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/shunkosa/sfdx-flowdoc-plugin)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-flowdoc-plugin.svg)](https://npmjs.org/package/sfdx-flowdoc-plugin)
[![License](https://img.shields.io/npm/l/sfdx-flowdoc-plugin.svg)](https://github.com/shunkosa/sfdx-flowdoc-plugin/blob/master/package.json)

![](img/screenshot.png)

## Features

### Supported Flow

-   Trigger based Process
-   Platform Event based Process
-   Invocable Process

### Supported Actions

-   Chatter Post
-   Quick Action
-   Apex (Invocable Action)
-   Sub flow/process
-   Record Create
-   Record Update
-   Approval Process

### Output Format

-   Word (.docx)
-   PDF
-   JSON

## Setup

### Install as plugin

```
sfdx plugins:install sfdx-flowdoc-plugin
```

### Install from source

Clone this repo and run `npm install`. Then run,

```
sfdx plugins:link .
```

## Usage

Specify an API name of your process

### PDF output

```
sfdx flowdoc:pdf:generate Example_Process -o dest
```

### Word output

```
sfdx flowdoc:docx:generate Example_Process -o dest
```

### JSON output

```
sfdx flowdoc:json:generate Example_Process
```

You can also use the display command and redirect the output. Use `--nospinner` option if you don't need spinner while the command execution.

```
sfdx flowdoc:json:display Example_Process --nospinner > example_process.json
```

### Locale

Add `-l (--locale) ja` option to export Japanese document.

```
sfdx flowdoc:pdf:generate Example_Process -l ja
```

## Feedback

Feature requests, bug reports and pull requests are welcome!

## Coming Soon

-   Flow Builder
-   Diagram
