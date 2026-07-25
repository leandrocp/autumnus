defmodule Lumis.BenchmarkRuntime do
  def configure(repo_dir) do
    packages =
      repo_dir
      |> Path.join("target/benchmarks/language-packages/index.json")
      |> File.read!()
      |> :json.decode()

    fixture_root = Path.join(repo_dir, "packages/javascript/lumis/test/fixtures/wasm")
    node_modules = Path.join(repo_dir, "node_modules/.pnpm")

    Application.put_env(:lumis, :language_package_resolver, fn handle ->
      metadata_path = packages |> Map.fetch!(handle.package_name) |> Map.fetch!("metadataPath")
      {:file, metadata_path}
    end)

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

      case Enum.find(candidates, &verified?(&1, entry)) do
        nil -> raise "missing exact parser fixture for #{entry.id}"
        path -> {:file, path}
      end
    end)
  end

  defp verified?(path, entry) do
    with {:ok, bytes} <- File.read(path) do
      byte_size(bytes) == entry.size and
        Base.encode16(:crypto.hash(:sha256, bytes), case: :lower) == entry.sha256
    else
      _ -> false
    end
  end
end
