# Deployment

Lumis downloads and compiles a parser the first time it is used. Cache the
languages your application needs while building a Mix release so production
does not pay that cost.

Add the cache step after compilation and before `mix release`:

```dockerfile
RUN mix compile
RUN mix lumis.languages.cache markdown elixir javascript rust css html comment
RUN mix release
```

Include the root languages and any injected languages, such as the languages in
Markdown code fences. The task accepts language names, bundles such as
`bundle_web` and `bundle_system`, or `--all`. Use `--force` to refresh compatible
versions already in the cache. `--verbose` prints one section per language with
the download URL when fetched, destination path, cache time, and compile time.

Downloads and parser validation both run concurrently, so a large bundle is
worth naming directly rather than splitting across layers. The task prints a
two-line summary unless asked for more, and reports every failure in a phase
instead of stopping at the first.

By default, the task writes parser metadata, verified WASM, and compiled modules
to Lumis's `priv/lumis` directory. `mix release` includes that directory
automatically. If you set `config :lumis, data_dir: "/app/lumis"`, use an
absolute path, copy that directory into the image, and keep the same
configuration at runtime.
