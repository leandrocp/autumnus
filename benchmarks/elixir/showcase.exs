repo_dir = Path.expand("../..", __DIR__)
generated_dir = Path.join(repo_dir, "benchmarks/showcase/generated")
System.put_env("LUMIS_BUILD", "1")

System.put_env(
  "CARGO_PATCH_CRATES_IO_LUMIS_WASM_RUNTIME_PATH",
  Path.join(repo_dir, "crates/lumis-wasm-runtime")
)

System.put_env(
  "CARGO_PATCH_CRATES_IO_LUMIS_CORE_PATH",
  Path.join(repo_dir, "crates/lumis-core")
)

Mix.install(
  [
    {:lumis, path: Path.join(repo_dir, "packages/elixir/lumis")},
    {:rustler, "~> 0.38"}
  ],
  lockfile: Path.expand("mix.lock", __DIR__)
)

Code.require_file("runtime.exs", __DIR__)
Lumis.BenchmarkRuntime.configure(repo_dir)

:ok = Lumis.load_languages(["html", "comment", "css", "json", "javascript"])
source = File.read!(Path.join(generated_dir, "assets/webgpu_compute_reduce.html"))

output =
  Lumis.highlight!(source,
    formatter: {:html_inline, language: "html", theme: "dracula"}
  )

unless byte_size(output) > byte_size(source) and String.contains?(output, "<pre") and
         String.contains?(output, "<span") do
  raise "Lumis Elixir did not produce highlighted HTML"
end

path = Path.join(generated_dir, "fragments/lumis-elixir.html")
File.mkdir_p!(Path.dirname(path))
File.write!(path, output)
