# Legacy Reactor

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Build Status](https://travis-ci.org/michael-stoltz/legacy-reactor.svg?branch=master)](https://travis-ci.org/michael-stoltz/legacy-reactor)
[![Coverage Status](https://coveralls.io/repos/github/michael-stoltz/legacy-reactor/badge.svg?branch=master)](https://coveralls.io/github/michael-stoltz/legacy-reactor?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/michael-stoltz/legacy-reactor.svg)](https://greenkeeper.io/)

Reactor is a standalone implementation of the [vue](https://vuejs.org/) 2.x observer code for reactivity.

The target environment is ES5+ and will therefore work on any browser that supports it.

If you are working with evergreen browsers that support [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), rather use the latest [version](https://github.com/michael-stoltz/reactor) of the library.

# Recommended Editor

It is highly suggested to use [Visual Studio Code](https://code.visualstudio.com/) as it is extendible and light weight.

The project comes configured with some settings that make development within vscode as simple as possible.

These include things such as code format on save and debugging current ts files and tests.

# Npm Scripts

- `npm run lint`: Lint all typescript files.
- `npm run format`: Format all ts files in the `src` folder.
- `npm run commit`: Commit using [commitzen](https://github.com/commitizen/cz-cli) to ensure commits follow the correct convention.
- `npm run test`: Run all [jest](https://jestjs.io/) tests on files that end with `*.spec.ts` in the `src` folder.
- `npm run cov`: Generate and open a test coverage report using [jest](https://jestjs.io/).
- `npm run cov:open`: Open the generated test coverage report.
- `npm run doc`: Generate and open documentation using [typedoc](https://typedoc.org/).
- `npm run doc:open`: Open generated documentation.
- `npm run build`: Build the project using the typescript compiler.
- `npm run version`: Generate or update a CHANGELOG.md, bump the package version and create a tag using [Standard Version](https://github.com/conventional-changelog/standard-version).
- `npm run prepublish`: Automatically runs before the `npm publish` command and ensures that the code is formatted, tested and built before publishing.

# Usage

## Computed properties

Computed properties are properties that get their value from other properties.

When you change one of the properties it relies on it will automatically be recalculated.

```javascript
import { observe } from '@microlibs/legacy-reactor';

const observed = observe({
  price: 55.6,
  qty: 100,
  // Any function in this object is treated as a computed property definition.
  total() {
    return this.price * this.total;
  },
});

console.log(observed.total); // output: 5560

observed.price = 60;
console.log(observed.total); // output: 6000

observed.qty = 50;
console.log(observed.total); // output: 3000
```

## Watchers

Watchers are simple functions that get run when the value of an observed property changes.

You can register multiple watchers per property.

```javascript
import { observe } from '@microlibs/legacy-reactor';

const observed = observe({
  price: 55.6,
  qty: 100,
  // Any function in this object is treated as a computed property definition.
  total() {
    return this.price * this.total;
  },
});

// The first parameter is the path to the property in the observed data.
// In case of a nested object {nested: {total: 55 }} you would write 'nested.total'.
// The second parameter is the function to be called when the value of total changes.
observed.$watch('total', (value, oldValue) => {
  console.log(value, oldValue);
});

observed.price = 100; // output: 10000 5560
```

# Known Issues

Since the reactor uses the same reactivity mechanism as vue does it comes with the same caveats.

1. Adding properties to an observed object is not tracked.
2. Deleting properties from an observed object is not tracked.
   > Due to the above two caveats we decided to seal the observed object.
   > Therefore you cannot add or remove properties once you have created an observed object.
3. Reassigning array length is not tracked.
   > It is not possible to define a getter on the length property since it is not configurable.
