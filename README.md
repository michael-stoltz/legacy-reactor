# Legacy Reactor

[![greenkeeper: enabled](https://badges.greenkeeper.io/michael-stoltz/legacy-reactor.svg)](https://greenkeeper.io/)
[![build: status](https://travis-ci.org/michael-stoltz/legacy-reactor.svg?branch=master)](https://travis-ci.org/michael-stoltz/legacy-reactor)
[![codecov: percent](https://codecov.io/gh/michael-stoltz/legacy-reactor/branch/master/graph/badge.svg)](https://codecov.io/gh/michael-stoltz/legacy-reactor)
[![commitizen: friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://semantic-release.gitbook.io/semantic-release/)
[![linter: eslint](https://img.shields.io/badge/linter-eslint-blue.svg)](https://github.com/typescript-eslint/typescript-eslint)
[![docs: gh-pages](https://img.shields.io/badge/docs-gh--pages-blue.svg)](https://michael-stoltz.github.io/legacy-reactor/)
[![dependencies: status](https://david-dm.org/michael-stoltz/legacy-reactor/status.svg)](https://david-dm.org/michael-stoltz/legacy-reactor)
[![dev-dependencies: status](https://david-dm.org/michael-stoltz/legacy-reactor/dev-status.svg)](https://david-dm.org/michael-stoltz/legacy-reactor?type=dev)
[![npm (scoped)](https://img.shields.io/npm/v/@microlibs/legacy-reactor?label=npm%20package)](https://www.npmjs.com/package/@microlibs/legacy-reactor)

The Legacy Reactor is a standalone implementation of the [vue](https://vuejs.org/) 2.x observer code for reactivity.

The target environment is ES5+ and will therefore work on any browser that supports it.

## Recommended IDE

You should be using [Visual Studio Code](https://code.visualstudio.com/) because its simple, fast, extensible and beloved by many developers.

Make sure to install all the [recommended extensions](https://code.visualstudio.com/docs/editor/extension-gallery#_recommended-extensions) that come with the repository for the best possible coding experience.

## NPM Scripts

Note that these examples use yarn but you can use the equivalent `npm run <command>` instead.

Most of them will automatically run when you perform certain actions on your repository.

### Code style

Ensures code consistency in your code base.

These commands automatically get run before commits.

- `yarn style` - Runs all style:\* commands.
- `yarn style:lint` - Lints your code using [eslint](https://github.com/typescript-eslint/typescript-eslint).
- `yarn style:format` - Formats your code using [prettier](https://prettier.io/).

### Build Tasks

Creates builds from your Typescript files for [CommonJS (cjs)](https://flaviocopes.com/commonjs/) and [ES6 modules (esm)](https://exploringjs.com/es6/ch_core-features.html#sec_from-cjs-to-esm).

- `yarn build` - Runs all build commands which creates builds for different node environments.
- `yarn build:main` - Creates a build using cjs modules.
- `yarn build:module` - Creates a build using esm modules.

### Testing

Ensures code is reliable by running your [jest](https://jestjs.io/en/) unit tests.

Unit tests automatically get run before commits.

- `yarn test` - Runs all tests and generates a code coverage report.
- `yarn test:watch` - Watches file changes and reruns tests for those changed files.

### Code Coverage

Generates and publishes documentation based on your [typedoc](https://typedoc.org/) comments.

Code coverages reports are automatically generated and published during CI builds.

- `yarn cov` - Generate a code coverage report.
- `yarn cov:open` - Open generated code coverage report.
- `yarn cov:publish` - Publish generated code coverage reports to [codecov](https://codecov.io/).
  Running this command locally will require the upload token for e.g `yarn cov:publish --token="YOUR_TOKEN_HERE"`

### Documentation

Generate and publishing documentation based on your [typedoc](https://typedoc.org/) comments.

Documentation is automatically generated and published during CI builds.

- `yarn doc` - Generates documentation from code.
- `yarn doc:open` - Opens generated documentation in your default browser.
- `yarn doc:publish` - Publishes generated documentation.

### Helpers

These commands perform misc tasks.

- `yarn commit` - Create a new commit using the [commitizen](https://github.com/commitizen/cz-cli) cli.
- `yarn clean` - Cleans up all build artifacts such as the distribution folder.

## Conventional Commits

Commit messages to this repository that don't follow the [conventional commit guidelines](https://www.conventionalcommits.org/en/) will be rejected by a `commit-msg` [git hook](#Git-Hooks).

No one likes rejection so use the `yarn commit` script which provides a CLI interface for creating formated commits.

## Git Hooks

If you would like to run custom tasks during important actions on a repository you can use [git hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks).

To make this as simple as possible we use [husky](https://github.com/typicode/husky) which is also used in the [conventional commits toolchain](#Conventional-Commits).

## Debugging

The following [launch configurations](https://code.visualstudio.com/docs/editor/debugging) will assist with debugging your library.

- `Current TS File` - debug current typescript file.
- `Current Jest Test` - debug current jest test.
- `All Jest Tests` - debug all jest tests.

## Usage

### Computed properties

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

#### Side Effects

Computed properties disable data updates within them to keep your data predictable.

Setting the value of data within a computed property will cause an exception.

```typescript
const observed = observe({
  price: 10,
  qty: 5,
  total() {
    // okay
    var value = this.price * this.total;

    // this line will throw an exception
    this.price = 1000;

    return value;
  },
});
```

### Watchers

Watchers are simple functions that get run when the value of an observed property changes.

You can register multiple watchers per property.

```javascript
import { observe, addPropertyWatcher, removePropertyWatcher } from '@microlibs/legacy-reactor';

const observed = observe({
  price: 55.6,
  qty: 100,
  // Any function in this object is treated as a computed property definition.
  total() {
    return this.price * this.total;
  },
});

// The first parameter is an observed object
// The second parameter is the path to the property in the observed data.
// In case of a nested object {nested: {total: 55 }} you would write 'nested.total'.
// The last parameter is the function to be called when the value of total changes.
const watcher = addPropertyWatcher(observed, 'total', (value, oldValue) => {
  console.log(value, oldValue);
});

observed.price = 100; // output: 10000 5560

removePropertyWatcher(observed, 'total', watcher);

// No output since the watcher was removed
observed.price = 60.56;
```

## Known Issues

Since the reactor uses the same reactivity mechanism as vue does it comes with the same caveats.

1. Adding properties to an observed object is not tracked.
2. Deleting properties from an observed object is not tracked.
   > Due to the above two caveats we decided to seal the observed object.
   > Therefore you cannot add or remove properties once you have created an observed object.
3. Reassigning array length is not tracked.
   > It is not possible to define a getter on the length property since it is not configurable.
