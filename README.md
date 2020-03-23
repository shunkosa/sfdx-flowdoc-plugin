# Flowdoc (alpha)
A Salesforce CLI plugin that generates design document from Lightning flow metadata

[![Github Workflow](https://github.com/shunkosa/sfdx-flowdoc-plugin/workflows/unit%20test/badge.svg?branch=master)](https://github.com/shunkosa/sfdx-flowdoc-plugin/actions?query=workflow%3A%22unit%20test%22)
[![Version](https://img.shields.io/npm/v/sfdx-flowdoc-plugin.svg)](https://npmjs.org/package/sfdx-flowdoc-plugin)
[![Codecov](https://codecov.io/gh/shunkosa/sfdx-flowdoc-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/shunkosa/sfdx-flowdoc-plugin)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-flowdoc-plugin.svg)](https://npmjs.org/package/sfdx-flowdoc-plugin)
[![License](https://img.shields.io/npm/l/sfdx-flowdoc-plugin.svg)](https://github.com/shunkosa/sfdx-flowdoc-plugin/blob/master/package.json)

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
```
sfdx flowdoc:pdf:generate --name Example_Process
```

```
sfdx flowdoc:pdf:generate hoge/main/default/flows/Example_Process.flow-meta.xml
```

## Feedback
Feature requests, bug reports and pull requests are welcome!

## Coming Soon
* Process which subscribes platform event
* Flow builder
* Diagram
* Editable output
