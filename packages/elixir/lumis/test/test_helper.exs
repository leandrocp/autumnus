wasm_fixtures =
  Path.expand("../../../javascript/lumis/test/fixtures/wasm", __DIR__)

wasm_cache =
  Path.join(System.tmp_dir!(), "lumis-elixir-test-#{System.unique_integer([:positive])}")

wasm_bundle =
  Path.join(System.tmp_dir!(), "lumis-elixir-bundle-#{System.unique_integer([:positive])}")

System.put_env("LUMIS_WASM_CACHE_DIR", wasm_cache)
Application.put_env(:lumis, :wasm_bundle_dir, wasm_bundle)

Application.put_env(:lumis, :wasm_resolver, fn entry ->
  {:file, Path.join(wasm_fixtures, "#{entry.wasm_name}.wasm")}
end)

ExUnit.start(exclude: [:conformance])

ExUnit.after_suite(fn _results ->
  File.rm_rf(wasm_cache)
  File.rm_rf(wasm_bundle)
end)
