# Deployment

Lumis downloads and compiles a parser the first time it is used. Warm the
languages your application needs at startup so no request pays that cost.

Call `Lumis.Languages.async_load/1` from your application's `start/2`:

```elixir title="lib/my_app/application.ex"
def start(_type, _args) do
  Lumis.Languages.async_load(~w(markdown elixir javascript rust css html comment))

  Supervisor.start_link(children(), strategy: :one_for_one, name: MyApp.Supervisor)
end
```

It returns immediately, so the boot never waits on the network, and the result
is deliberately not matched on: a warm-up must not be able to stop an
application from starting. Failures are logged, and highlighting still loads on
demand, so the worst case is the cost this moves off the first request coming
back rather than an outage.

Include the root languages and any injected languages, such as the languages in
Markdown code fences. The API accepts language names or bundles such as
`:bundle_web` and `:bundle_system`. Downloads run concurrently, and every
failure is reported instead of stopping at the first.

Use `Lumis.Languages.load/1` instead when you do want to wait — a release task,
or a smoke test that should fail if a parser is unreachable.

By default, Lumis writes parser metadata, verified WASM, and compiled modules to
its `priv/lumis` directory. For a release, configure an absolute writable or
persistent directory such as `config :lumis, data_dir: "/app/lumis"`.

If cache preparation belongs in an image build instead of application startup,
use the standalone CLI and copy the resulting directory into the runtime image:

```dockerfile
FROM node:22-bookworm-slim AS parsers
RUN npx --yes @lumis-sh/cli --data-dir /app/lumis languages cache markdown elixir javascript rust css html comment

FROM debian:bookworm-20250428-slim
COPY --from=parsers --chown=nobody:root /app/lumis /app/lumis
```

`npx` is the shortest way to get the CLI for one command; the Node image is
only that stage's, and nothing from it lands in the runtime image.

Point the release at that directory with `config :lumis, data_dir: "/app/lumis"`
or `LUMIS_DATA_DIR=/app/lumis`. Keep the `async_load/1` call: against a prepared
directory it needs no network and only moves the parsers into the VM, which is
the half a prepared directory cannot do for you.

`Lumis.Languages.cache/2` does the same preparation from Elixir rather than the
CLI, for a release task or a migration step that runs before the VM that serves.
Inside a running application prefer `async_load/1`, which keeps what it loads
instead of compiling and discarding it.
