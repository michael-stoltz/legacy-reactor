# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.5.0](https://github.com/michael-stoltz/legacy-reactor/compare/v0.4.0...v0.5.0) (2019-07-19)


### Bug Fixes

* disable side effects in user defined getters ([ca263cc](https://github.com/michael-stoltz/legacy-reactor/commit/ca263cc))


### Features

* add support for user defined getters in observed data ([4583030](https://github.com/michael-stoltz/legacy-reactor/commit/4583030))



## [0.4.0](https://github.com/michael-stoltz/legacy-reactor/compare/v0.3.0...v0.4.0) (2019-07-17)


### Features

* computed properties can no longer have side effects ([eee66eb](https://github.com/michael-stoltz/legacy-reactor/commit/eee66eb))



## [0.3.0](https://github.com/michael-stoltz/legacy-reactor/compare/v0.2.2...v0.3.0) (2019-07-12)


### Build System

* change travis ci config ([e253ef6](https://github.com/michael-stoltz/legacy-reactor/commit/e253ef6))


### Features

* add travis ci and coveralls support ([3a92f78](https://github.com/michael-stoltz/legacy-reactor/commit/3a92f78))


### Refactor

* Change the add and remove watcher api ([#7](https://github.com/michael-stoltz/legacy-reactor/issues/7)) ([86cb544](https://github.com/michael-stoltz/legacy-reactor/commit/86cb544)), closes [#2](https://github.com/michael-stoltz/legacy-reactor/issues/2)


### BREAKING CHANGES

* observed data no longer has $watch and $unwatch functions

* refactor: remove remnants of the old watcher mechanism

* fix: return the watcher function from addPropertyWatcher



### 0.2.2 (2019-07-03)



### 0.2.1 (2019-07-03)
