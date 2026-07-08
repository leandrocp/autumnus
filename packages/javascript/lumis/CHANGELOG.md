## [0.5.2](https://github.com/leandrocp/lumis/compare/npm-lumis/v0.5.1...npm-lumis/v0.5.2) (2026-07-08)


### Features

- update jinja and r langs - [#993](https://github.com/leandrocp/lumis/pull/993)

## [0.5.1](https://github.com/leandrocp/lumis/compare/npm-lumis/v0.5.0...npm-lumis/v0.5.1) (2026-07-03)


### Bug Fixes

- preserve curly braces - [#982](https://github.com/leandrocp/lumis/pull/982)

## [0.5.0](https://github.com/leandrocp/lumis/compare/npm-lumis/v0.4.0...npm-lumis/v0.5.0) (2026-06-16)

### ⚠ BREAKING CHANGES

- adopt the `l-` prefix on token class [#952](https://github.com/leandrocp/lumis/pull/952)

### Features

- add toon language - [#734](https://github.com/leandrocp/lumis/pull/734)
- rainbow brackets - [#949](https://github.com/leandrocp/lumis/pull/949)
- css stylesheet builder - [#951](https://github.com/leandrocp/lumis/pull/951)

## [0.4.0](https://github.com/leandrocp/lumis/compare/npm-lumis/v0.3.0...npm-lumis/v0.4.0) (2026-04-22)

### Bug Fixes

- remove gleam bit_string_segment_option node name - [#718](https://github.com/leandrocp/lumis/pull/718) by @stefanobaghino

### Code Refactoring

- BREAKING: deprecate ANSI iterator helpers in favor of `paint` - [#706](https://github.com/leandrocp/lumis/pull/706)

### Documentation

- move runnable examples into package dirs - [#709](https://github.com/leandrocp/lumis/pull/709)

### Features

- split client and server - [#719](https://github.com/leandrocp/lumis/pull/719)


## [0.3.0](https://github.com/leandrocp/lumis/compare/npm-lumis/v0.2.0...npm-lumis/v0.3.0) (2026-04-09)


### Code Refactoring

- BREAKING: mirror Rust Formatter API ([#703](https://github.com/leandrocp/lumis/pull/703))


### Documentation

- clarify runtime support and rename usage routes

## [0.2.0](https://github.com/leandrocp/lumis/compare/javascript@v0.1.0...javascript@v0.2.0) (2026-04-05)


### ⚠ BREAKING CHANGES

* improve formatter internals ([#570](https://github.com/leandrocp/lumis/issues/570))

### Features

* language bundles ([#556](https://github.com/leandrocp/lumis/issues/556)) ([6e98734](https://github.com/leandrocp/lumis/commit/6e98734c20d8a86384f3e8b8e2b694c40bbb0f12))


### Bug Fixes

* add api-extractor to js package builds ([889bc9c](https://github.com/leandrocp/lumis/commit/889bc9cd082aeaad67a50baa3a389eabb5a6161d))


### Code Refactoring

* improve formatter internals ([#570](https://github.com/leandrocp/lumis/issues/570)) ([c811832](https://github.com/leandrocp/lumis/commit/c811832c808c50f0ab6603c70d5403813e06476d))

## [0.1.0](https://github.com/leandrocp/lumis/compare/javascript@v0.0.2...javascript@v0.1.0) (2026-04-02)


### ⚠ BREAKING CHANGES

* bump tree-sitter 0.26 ([#521](https://github.com/leandrocp/lumis/issues/521))

### Bug Fixes

* wasm bundle codegen ([#519](https://github.com/leandrocp/lumis/issues/519)) ([a784f04](https://github.com/leandrocp/lumis/commit/a784f04638b7561906df7b232edf67b1052aefdc))


### Miscellaneous Chores

* bump tree-sitter 0.26 ([#521](https://github.com/leandrocp/lumis/issues/521)) ([ad9a567](https://github.com/leandrocp/lumis/commit/ad9a5679e94032e153eb7d997f2c1577479ec812))

## [0.0.2](https://github.com/leandrocp/lumis/compare/javascript@v0.0.1...javascript@v0.0.2) (2026-03-31)


### Features

* add 135 themes ([#483](https://github.com/leandrocp/lumis/issues/483)) ([26b9d84](https://github.com/leandrocp/lumis/commit/26b9d84f096e5d9dd5064cf816f794fd578f5adf))
* add 42 new languages ([#467](https://github.com/leandrocp/lumis/issues/467)) ([9bacc46](https://github.com/leandrocp/lumis/commit/9bacc46552597f0b7ee5c3b8adde3bfc321a2097))
* add bbcode_scoped formatter to Elixir and Javascript ([#478](https://github.com/leandrocp/lumis/issues/478)) ([1a34357](https://github.com/leandrocp/lumis/commit/1a343574b0239b5100d6b170124b586b0aabecfe))
* add zsh and llvm languages ([#510](https://github.com/leandrocp/lumis/issues/510)) ([fe8bb2c](https://github.com/leandrocp/lumis/commit/fe8bb2ce76634b75ac5624166216112aba56915a))
* introduce lang bundles ([#484](https://github.com/leandrocp/lumis/issues/484)) ([5a30160](https://github.com/leandrocp/lumis/commit/5a30160531fb2509d705fa14af7b10a9343de2c0))
* **javascript:** add withWasm to configure langs ([#481](https://github.com/leandrocp/lumis/issues/481)) ([7e0250c](https://github.com/leandrocp/lumis/commit/7e0250c89bdc257852eaa1f243c48a098b41fd22))
* **javascript:** introduce markdown-it-lumis and rehype-lumis and align lumis api ([#473](https://github.com/leandrocp/lumis/issues/473)) ([9a23b57](https://github.com/leandrocp/lumis/commit/9a23b57141323b7679c8920e4f66ccb4e4351a01))


### Bug Fixes

* add jinja_inline and remove disabled wasm parsers ([#508](https://github.com/leandrocp/lumis/issues/508)) ([4cb4527](https://github.com/leandrocp/lumis/commit/4cb45279783fd0eba25016c219a3a1feb8b09ac1))
* markdown inline injections ([#454](https://github.com/leandrocp/lumis/issues/454)) ([0ec8563](https://github.com/leandrocp/lumis/commit/0ec856302aa7a41dbf78b81eabdd6220db953fba))

## 0.0.1 - 2024-03-23

- Initial release
