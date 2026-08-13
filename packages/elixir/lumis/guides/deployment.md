# Deployment

Lumis downloads and compiles a parser the first time it is used. Prepare the
languages your application needs during its startup lifecycle so no request
pays that cost.

Call `Lumis.Languages.cache/2` before starting your supervision tree:

```elixir title="lib/my_app/application.ex"
def start(_type, _args) do
  {:ok, _paths} =
    Lumis.Languages.cache(~w(markdown elixir javascript rust css html comment))

  Supervisor.start_link(children(), strategy: :one_for_one, name: MyApp.Supervisor)
end
```

Include the root languages and any injected languages, such as the languages in
Markdown code fences. The API accepts language names or bundles such as
`:bundle_web` and `:bundle_system`. Pass `force: true` to refresh compatible
versions already in the cache.

Downloads and parser validation both run concurrently, and every failure is
reported instead of stopping at the first. The call is idempotent: later starts
reuse verified parser bytes and compiled modules from the configured directory.

By default, Lumis writes parser metadata, verified WASM, and compiled modules to
its `priv/lumis` directory. For a release, configure an absolute writable or
persistent directory such as `config :lumis, data_dir: "/app/lumis"`.

If cache preparation belongs in an image build instead of application startup,
use the standalone CLI and copy the resulting directory into the runtime image:

```dockerfile
FROM hexpm/elixir:1.18.4-erlang-27.3.4-debian-bookworm-20250428-slim AS builder
# Install the Lumis CLI here, then fill the directory the release will read.
RUN lumis --data-dir /app/lumis languages cache markdown elixir javascript rust css html comment

FROM debian:bookworm-20250428-slim
COPY --from=builder --chown=nobody:root /app/lumis /app/lumis
```

Point the release at that directory with `config :lumis, data_dir: "/app/lumis"`
or `LUMIS_DATA_DIR=/app/lumis`, and skip the `Lumis.Languages.cache/2` call.
