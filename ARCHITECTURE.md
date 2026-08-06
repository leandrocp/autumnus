# Architecture

<!-- markdownlint-disable MD013 -->

```text
+------------------+ +---------------+ +------------------+
| languages.toml   | | themes/*.json | | queries/**/*.scm |
| parser metadata  | | theme data    | | highlight rules  |
+--------+---------+ +-------+-------+ +---------+--------+
         |                   |                   |
         v                   v                   v
+--------------------------------------------------------------+
| mise.toml + benchmarks/mise.toml + crates/dev                |
| setup / lint / test / docs / codegen / packaging / benchmark |
+-------+-------------------+-------------------+--------------+
        |                   |                   |
        v                   v                   v
+--------------------+ +--------------+ +--------------------+
| processed queries  | | css/*.css    | | tree-sitter-*.wasm |
| generated queries  | | linked HTML  | | parser binaries    |
+---------+----------+ +------+-------+ +----------+---------+
          |                   |                    |
          |                   |                    |
          v                   |                    v
+-------------------------+   |     +---------------------------+
| generated runtime data  |   |     | language packages         |
| JS language handles +   |   |     | parser + queries +        |
| shared Rust catalog     |   |     | integrity metadata        |
+------------+------------+   |     +---------------------------+
+------------+------------+   |                    |
             |                |                    |
             +----------------+--------------------+
                                  |
                                  v
+--------------------------------------------------------------+
| lumis-core (Rust crate)                                      |
| language detection + theme/style logic + formatter behavior  |
+-----------------------------+--------------------------------+
                              |
                              v
+--------------------------+   +---------------------------------------------------+
| lumis (Rust crate)       |   | lumis-wasm-runtime                                |
| native parser features   |   | resolve + verify + cache + one-pass highlighting  |
+--------------------------+   +----+-------------------+----------------------+---+
                                    |                   |                      |
                                    v                   v                      v
                            +--------------+   +----------------+   +--------------------+
                            | lumis-cli    |   | elixir/lumis   |   | lumis-js-native    |
                            | Rust binary  |   | Rustler NIF    |   | Node napi addon    |
                            +------+-------+   +--------+-------+   +---------+----------+
                                   |                    |                     |
                                   |                    |                     v
                                   |                    |          +------------------------+
                                   |                    |          | javascript/lumis (npm) |
                                   |                    |          | addon on Node,         |
                                   |                    |          | web-tree-sitter in the |
                                   |                    |          | browser                |
                                   |                    |          +-----------+------------+
                                   |                    |                      |
                                   +--------------------+----------------------+
                                                            |
                                                            v
                                                 +---------------------------+
                                                 | website / docs / examples|
                                                 +---------------------------+
```

## Performance benchmark lane

`benchmarks/` is an intentionally non-published comparison layer over the public Rust, JavaScript, and CLI surfaces.

```text
benchmarks/fixtures + deterministic generator
                    |
                    v
       identical small and large Rust inputs
       +----------+----------+----------+
       |          |          |          |
       v          v          v          v
 Rust/Criterion JS/Mitata Elixir/Benchee CLI/Hyperfine
 Lumis/syntect  Lumis/Shiki     Lumis     Lumis/bat
       |          |          |          |
       +----------+----------+----------+
                         |
                         v
 target/benchmarks/runs/current/ raw reports + package sizes + metadata
                         |
                         v
                 benchmarks/README.md
```

The Rust benchmark package is its own Cargo workspace so syntect and Criterion do not enter normal production workspace builds. The private JavaScript benchmark package joins the pnpm workspace so it can consume locally built Lumis packages while keeping Shiki and Mitata out of published manifests.

Fixture generation, optimized artifact builds, timed execution, memory sampling, cache preparation, and reporting are separate mise tasks. `benchmarks/mise.toml` pins the benchmark toolchain, models task dependencies and incremental sources/outputs, and owns shared paths. Root `mise run bench-*` tasks delegate to that benchmark configuration. The root `mise.toml` pins only the Tree-sitter CLI series, which `dev wasm-needed` reads so the published `lumis.treeSitter` metadata and the CLI that built a parser cannot drift apart; `mise.lock` locks it for every platform CI runs on. Language runtimes stay unpinned at the root so local commands use the developer's own toolchains. Timed families execute serially. Parser assets are prepared and verified before timing so network variability never enters benchmark results.

CI uses `jdx/mise-action` with the same benchmark config. Every pull request runs one observational, non-gating stable suite covering Rust, JavaScript, CLI, Elixir, package size, and memory. It appends available benchmark tables to the GitHub Actions job summary and retains raw report artifacts for seven days.

## Dynamic language packages

`languages.toml` is the repository source of truth. Generated runtime catalogs
contain only stable language IDs, aliases, and npm package names. `crates/dev`
generates the checked-in Rust catalog data, which `lumis-wasm-runtime` expands
through a declarative macro. JavaScript generation owns only JavaScript runtime
metadata.

Each `@lumis-sh/wasm-*` release is the independently versioned, atomic unit
containing:

- one parser WASM
- every Lumis language backed by that parser
- the matching highlight, injection, locals, and bracket queries
- parser size, SHA-256, grammar name, and package version

During staging, `crates/dev` serializes those inputs into `lumis.json`. The
manifest is published inside the language package and is not checked in.

Changing a parser or one of its queries publishes only that language package.
It does not require a JavaScript, CLI, Rust, or Elixir runtime release unless
the language-package format itself changes.

Dynamic runtimes resolve and cache the current package metadata, then load the
exact parser identified by that metadata:

```text
stable language catalog
         |
         v
installed/local language package -> persistent metadata cache -> current package metadata
         |
         v
installed/local parser -> persistent verified parser cache -> exact-version CDN parser
                                  |
                                  +-> persistent Wasmtime compiled cache
```

### Highlighting loads what a document needs, in one pass

Highlighting a document resolves, downloads, verifies and loads whatever it
turns out to name. A Markdown file with a fenced Rust block highlights that
block, without Rust having been mentioned anywhere in the calling code. Nothing
is configured, nothing is enumerated.

The three runtimes used to disagree here — the CLI and JavaScript skipped an
unloaded injection while Elixir fetched it and re-highlighted — so the same
input produced different output per runtime. What removed the disagreement was
making one implementation serve all three, not making the rule stricter.

**One pass, not two.** `Runtime::highlight` hands Tree-sitter a callback for
injected languages, and that callback loads. So the walk descends into the
language it just fetched and finds whatever *that* language injects, however
deep the nesting goes. The alternatives were both worse: highlighting twice
throws away the first pass, and a separate discovery pass has to re-run the
injections query per nesting level, which measured at 32% of a full pass and
still cannot see past the layers it has already loaded.

Configured JavaScript language-package and WASM resolvers are part of that Node
path too. A language first named by an injection is resolved and loaded before
the walk descends into it. The native walk can synchronously read local paths
and `file:`, `data:`, `http:`, and `https:` URLs returned by those resolvers.
JavaScript-owned resources such as `blob:` URLs have to be resolved by
`loadLanguage` before the walk because Rust cannot access JavaScript's blob
registry.

Ordinary Node highlighters share one `Runtime`, so loading Markdown forty times
does not create forty Tree-sitter Wasm stores. A highlighter is promoted to its
own runtime only when it accepts caller-selected parser bytes, a different
package, or resolver callbacks. Definitions use a content-derived internal id,
and catalog roots or canonical installed packages loaded before promotion are
replayed into the private runtime. The Wasmtime engine and persistent caches
remain shared.

That private store is the lifetime boundary. Tree-sitter exposes no operation
that reclaims one language from a Wasm store, and loading another module advances
the store's memory allocation monotonically. Removing an id from Lumis's catalog
therefore does not free its parser. Dropping the whole private runtime does, so
caller-resolved definitions are isolated between highlighters and reclaimed when
their highlighter and any in-flight formatting task are gone.

Queries are not part of that surface. A parser and the queries written against it
are released together in one package, so a caller names a package and, at most,
where its parser bytes come from. Supplying queries directly is a planned
cross-runtime capability; it existed in JavaScript alone and was removed rather
than shipped half-designed.

Parser modules are retained before query compilation. Rust keys both successful
and failed store loads by the declared grammar and the SHA-256 of the actual
bytes; `web-tree-sitter` retains the corresponding `Language.load` promise by
byte digest within its JavaScript realm. An invalid query can therefore be
corrected without loading the parser again, while repeating the same parser-load
failure cannot grow Tree-sitter's store. Fetch, resolver and integrity failures
happen before this cache and remain retryable. Package-backed loads also inspect
the module's single `tree_sitter_*` function export and require it to match
`parser.grammarName`, so native and browser runtimes interpret the same package
metadata identically.

**A failure costs one block.** A thousand-line document with ten languages must
not fail because one fenced block names something unpublished. An injected
language that cannot be fetched leaves its content plain and the walk carries
on. Only the root language failing is an error the caller sees.

**A cold parser is expensive; a warm one is not.** It costs a download and then
a Wasmtime compile, and the compile is the larger half: seven parsers already on
disk take about 8 s to compile against 1.3 s once `compiled/` holds their
compiled forms. Registering an already-compiled parser is 3-15 ms, and about
0.3 ms after. That is why loading in the request path is fine once the store is
warm, and why `load` still exists: to move both costs off a user's first
request, not to gate anything.

In Elixir it is cheaper still, because loading is global to the VM. One
`Runtime` lives in the NIF, so the first process to need a language pays, and
every process after it does not.

Browsers are the exception. `web-tree-sitter` loads asynchronously, so a parser
cannot be fetched inside a synchronous walk; an injected language has to be
loaded before the document mentioning it. Node runs the native addon
specifically so it does not inherit that limit, and falls back to
`web-tree-sitter` only where no addon is built.

Everything a runtime persists lives under one directory, named by
`LUMIS_DATA_DIR`: `parsers/` for language packages and parser WASM, `themes/`
for the CLI's custom themes, `compiled/` for Wasmtime's module cache. The CLI,
Elixir and Node write the same filenames into `parsers/`, so one prepared
directory serves all three, whether the files were downloaded or staged there
by a build step. Browsers use CacheStorage instead, having no filesystem. Parser
cache keys contain the parser name, package version, and digest, so upgrades do
not overwrite older verified assets. The catalog pins an exact package version
per language, so a package already in the directory is the expected one and is
never revalidated; a request therefore never waits on the network for something
already on disk.

### Filling the store at build time

Keeping both costs off the first request means paying them during the build:

```sh
lumis parsers cache rust javascript      # CLI
mix lumis.languages.cache rust javascript # Elixir
```

Both write a self-sufficient directory — parser bytes plus the `lumis.json`
that names them — so pointing `LUMIS_DATA_DIR` at it is all a deployment needs.
Both go through `LanguageStore::cache_language`, which needs no Wasmtime
runtime, so the two commands cannot disagree about what a prepared cache
contains.
