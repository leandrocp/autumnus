wasm_fixtures =
  Path.expand("../../../javascript/lumis/test/fixtures/wasm", __DIR__)

query_fixtures = Path.expand("../../../../queries/processed", __DIR__)

wasm_cache =
  Path.join(System.tmp_dir!(), "lumis-elixir-test-#{System.unique_integer([:positive])}")

System.put_env("LUMIS_DATA_DIR", wasm_cache)

# Release-local parsers are only ever read from the app's own priv/wasm, so
# tests use the real directory and start from empty.
wasm_bundle = Application.app_dir(:lumis, "priv/wasm")
File.rm_rf!(wasm_bundle)
File.mkdir_p!(wasm_bundle)

Application.put_env(:lumis, :language_package_resolver, fn handle ->
  wasm_name =
    handle.package_name
    |> Path.basename()
    |> String.replace_prefix("wasm-", "tree-sitter-")

  wasm_path = Path.join(wasm_fixtures, "#{wasm_name}.wasm")
  wasm = File.read!(wasm_path)

  languages =
    Lumis.Native.language_package_refs()
    |> Enum.filter(&(&1.package_name == handle.package_name))
    |> Map.new(fn language ->
      query = fn name ->
        path = Path.join([query_fixtures, language.id, "#{name}.scm"])
        if File.exists?(path), do: File.read!(path), else: ""
      end

      brackets_path = Path.join([query_fixtures, language.id, "brackets.scm"])

      brackets =
        if File.exists?(brackets_path) do
          File.read!(brackets_path)
        else
          File.read!(Path.join([query_fixtures, "default", "brackets.scm"]))
        end

      {language.id,
       %{
         aliases: language.aliases,
         highlights: query.("highlights"),
         injections: query.("injections"),
         locals: query.("locals"),
         brackets: brackets
       }}
    end)

  package = %{
    packageName: handle.package_name,
    version: "test",
    definitionHash: "test",
    parser: %{
      name: wasm_name,
      grammarName: String.replace_prefix(wasm_name, "tree-sitter-", ""),
      sha256: :sha256 |> :crypto.hash(wasm) |> Base.encode16(case: :lower),
      size: byte_size(wasm)
    },
    languages: languages
  }

  {:ok, Jason.encode!(package)}
end)

Application.put_env(:lumis, :wasm_resolver, fn entry ->
  {:file, Path.join(wasm_fixtures, "#{entry.wasm_name}.wasm")}
end)

# Nothing is loaded implicitly, so the suite declares what it uses, the way a
# real caller has to. Only languages with a local wasm fixture can load here, and
# these four are left unloaded for the tests that exercise loading itself.
reserved = ~w(comment diff dockerfile xml)

fixture_languages =
  wasm_fixtures
  |> File.ls!()
  |> Enum.map(&String.replace_suffix(String.replace_prefix(&1, "tree-sitter-", ""), ".wasm", ""))
  |> Enum.reject(&(&1 in reserved))
  |> Enum.sort()

:ok = Lumis.Languages.load(fixture_languages)

ExUnit.start(exclude: [:conformance])

ExUnit.after_suite(fn _results ->
  File.rm_rf(wasm_cache)
  File.rm_rf(wasm_bundle)
end)
