# The suite never downloads: it points the store at the parser tree
# `mise run stage-test-parsers` lays out, so what it exercises is the real
# resolve-verify-load path. `config/config.exs` sets the paths, because it runs
# before the store is built and `System.put_env` is invisible to the NIF.
staged = Application.fetch_env!(:lumis, :wasm_path)
repository_root = Path.expand("../../../..", __DIR__)

unless File.dir?(Path.join(staged, "parsers")) do
  args = [
    "run",
    "-q",
    "--manifest-path",
    "crates/dev/Cargo.toml",
    "--",
    "stage-test-parsers",
    staged
  ]

  case System.cmd("cargo", args, cd: repository_root, stderr_to_stdout: true) do
    {_output, 0} -> :ok
    {output, status} -> raise "could not stage test parsers (exit #{status}):\n#{output}"
  end
end

ExUnit.start(exclude: [:conformance])

ExUnit.after_suite(fn _results ->
  File.rm_rf(Application.fetch_env!(:lumis, :data_dir))
end)
