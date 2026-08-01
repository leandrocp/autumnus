wasm_fixtures = Path.expand("../../../javascript/lumis/test/fixtures/wasm", __DIR__)
query_fixtures = Path.expand("../../../../queries/processed", __DIR__)

# The suite never downloads: it stages the fixture parsers where the store looks
# first, so what it exercises is the real resolve-verify-load path. The
# directories come from config/config.exs, which runs before the store is built.
staged = Application.fetch_env!(:lumis, :wasm_path)
parsers = Path.join(staged, "parsers")
File.mkdir_p!(parsers)

query = fn language, name ->
  path = Path.join([query_fixtures, language, "#{name}.scm"])
  if File.exists?(path), do: File.read!(path), else: ""
end

brackets = fn language ->
  case query.(language, "brackets") do
    "" -> query.("default", "brackets")
    brackets -> brackets
  end
end

Lumis.Native.language_package_refs()
|> Enum.group_by(& &1.package_name)
|> Enum.each(fn {package_name, refs} ->
  wasm_name =
    package_name |> Path.basename() |> String.replace_prefix("wasm-", "tree-sitter-")

  wasm_path = Path.join(wasm_fixtures, "#{wasm_name}.wasm")

  if File.exists?(wasm_path) do
    wasm = File.read!(wasm_path)
    sha256 = :sha256 |> :crypto.hash(wasm) |> Base.encode16(case: :lower)
    version = "test"

    languages =
      Map.new(refs, fn language ->
        {language.id,
         %{
           aliases: language.aliases,
           highlights: query.(language.id, "highlights"),
           injections: query.(language.id, "injections"),
           locals: query.(language.id, "locals"),
           brackets: brackets.(language.id)
         }}
      end)

    package = %{
      packageName: package_name,
      version: version,
      definitionHash: "test",
      parser: %{
        name: wasm_name,
        grammarName: String.replace_prefix(wasm_name, "tree-sitter-", ""),
        sha256: sha256,
        size: byte_size(wasm)
      },
      languages: languages
    }

    suffix = String.replace_prefix(package_name, "@lumis-sh/wasm-", "")
    File.write!(Path.join(parsers, "#{suffix}.language.json"), Jason.encode!(package))
    File.write!(Path.join(parsers, "#{wasm_name}-#{version}-#{sha256}.wasm"), wasm)
  end
end)

ExUnit.start(exclude: [:conformance])

ExUnit.after_suite(fn _results ->
  File.rm_rf(Path.dirname(staged))
end)
