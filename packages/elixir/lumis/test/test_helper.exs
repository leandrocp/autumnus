# The suite never downloads: it copies the parser tree the `stage.test_parsers`
# alias lays out into the store directory, so what it exercises is the real
# resolve-verify-load path against packages that are already present.
# `config/config.exs` sets the directory, because it runs before the store is
# built and `System.put_env` is invisible to the NIF.
data_dir = Application.fetch_env!(:lumis, :data_dir)
staged = Path.expand("../../../../target/test-parsers/parsers", __DIR__)

staged_parsers = Path.wildcard(Path.join(staged, "*.wasm"))

if staged_parsers == [] do
  raise """
  no staged parsers at #{staged}

  Run `mix test` from packages/elixir/lumis, which stages them first.
  """
end

# A previous run that was interrupted leaves this behind, and a half-copied
# store fails one unrelated test rather than announcing itself.
File.rm_rf!(data_dir)
File.mkdir_p!(Path.join(data_dir, "parsers"))
File.cp_r!(staged, Path.join(data_dir, "parsers"))

copied = Path.wildcard(Path.join([data_dir, "parsers", "*.wasm"]))

if length(copied) != length(staged_parsers) do
  raise """
  staged store copied incompletely: #{length(copied)} of #{length(staged_parsers)} parsers

  from: #{staged}
  to:   #{Path.join(data_dir, "parsers")}
  """
end

ExUnit.start(exclude: [:conformance])

ExUnit.after_suite(fn _results ->
  File.rm_rf(data_dir)
end)
