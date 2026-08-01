import Config

if config_env() == :test do
  # Applied before the store is built, which is why this cannot live in
  # test_helper.exs: `System.put_env` is invisible to the NIF.
  config :lumis,
    data_dir: Path.join(System.tmp_dir!(), "lumis-test-#{System.pid()}"),
    wasm_path:
      System.get_env("LUMIS_WASM_PATH") ||
        Path.expand("../../../../target/test-parsers", __DIR__)
end
