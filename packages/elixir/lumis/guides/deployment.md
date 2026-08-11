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
versions already in the cache.

By default, the task writes parser metadata, verified WASM, and compiled modules
to Lumis's `priv/lumis` directory. `mix release` includes that directory
automatically. If you set `LUMIS_DATA_DIR` or `config :lumis, data_dir:`, copy
that directory into the image and use the same path at runtime.
