store = Application.fetch_env!(:lumis, :data_dir)

if Path.wildcard(Path.join([store, "parsers", "*.wasm"])) == [] do
  raise """
  no staged parsers in #{store}

  Run `mix test` from packages/elixir/lumis, which stages them first.
  """
end

ExUnit.start(exclude: [:conformance])
