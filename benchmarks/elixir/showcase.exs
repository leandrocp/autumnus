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

fixture_root = Path.join(repo_dir, "packages/javascript/lumis/test/fixtures/wasm")
node_modules = Path.join(repo_dir, "node_modules/.pnpm")

Application.put_env(:lumis, :wasm_resolver, fn entry ->
  candidates = [
    Path.join(fixture_root, "#{entry.wasm_name}.wasm")
    | Path.wildcard(
        Path.join([
          node_modules,
          "@lumis-sh+wasm-*",
          "node_modules",
          "@lumis-sh",
          "wasm-*",
          "#{entry.wasm_name}.wasm"
        ])
      )
  ]

  case Enum.find(candidates, fn path ->
         with {:ok, bytes} <- File.read(path) do
           byte_size(bytes) == entry.size and
             Base.encode16(:crypto.hash(:sha256, bytes), case: :lower) == entry.sha256
         else
           _ -> false
         end
       end) do
    nil -> raise "missing exact parser fixture for #{entry.id}"
    path -> {:file, path}
  end
end)

:ok = Lumis.load_languages(["html", "css", "json", "javascript"])
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
