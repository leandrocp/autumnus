import Config

if config_env() == :test do
  # Applied before the store is built, which is why this cannot live in
  # test_helper.exs: `System.put_env` is invisible to the NIF.
  root = Path.join(System.tmp_dir!(), "lumis-test-#{System.pid()}")

  config :lumis,
    data_dir: Path.join(root, "data"),
    wasm_path: Path.join(root, "wasm")
end
