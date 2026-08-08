defmodule Mix.Tasks.Lumis.Languages.Cache do
  @moduledoc """
  Downloads exact, integrity-checked Lumis parser WASMs ahead of time.

  Highlighting downloads what it needs on demand, so the first request for a
  language pays for it. This moves that cost to build time: both the download
  and the Wasmtime compile that follows it, which is the larger half. A host
  with no network at all is then a side effect rather than the point.

      mix lumis.languages.cache elixir html javascript css
      mix lumis.languages.cache --all
      mix lumis.languages.cache --force elixir

  Parsers land under `$LUMIS_DATA_DIR`, or wherever `config :lumis, data_dir:`
  points, and are verified against the size and SHA-256 in their language
  package before being written. An existing valid file is left alone unless `--force` is given.

  A directory written here is complete: point `LUMIS_DATA_DIR` at it, or set
  `config :lumis, data_dir:`, and nothing needs the network. It expects the
  directory holding `parsers/`, not `parsers/` itself.

  Each parser is also loaded once, so Wasmtime writes its compiled form beside
  it and the first request pays neither the download nor the compile.
  """

  use Mix.Task

  @shortdoc "Downloads Lumis parser WASMs ahead of time"

  @switches [all: :boolean, force: :boolean]

  @impl Mix.Task
  def run(arguments) do
    Mix.Task.run("app.start")
    {options, languages} = parse_arguments(arguments)

    names = languages(options, languages)

    case Lumis.Languages.cache(names, cache_options(options)) do
      {:ok, paths} -> Enum.each(paths, fn path -> Mix.shell().info(path) end)
      {:error, reason} -> Mix.raise(reason)
    end

    compile(names)
  end

  # Downloading is only half the first-request cost: Wasmtime still compiles each
  # parser to native code, which is the larger half. Loading them here writes
  # that into `compiled/` beside the parsers, so an image ships both.
  defp compile(names) do
    case Lumis.Languages.load(names) do
      :ok ->
        Mix.shell().info("compiled #{length(names)} parser(s)")

      {:error, failures} ->
        Mix.raise("could not load: " <> format_failures(failures))
    end
  end

  defp format_failures(failures) when is_map(failures) do
    failures
    |> Enum.sort()
    |> Enum.map_join(", ", fn {name, reason} -> "#{name} (#{reason})" end)
  end

  defp format_failures(reason), do: to_string(reason)

  defp parse_arguments(arguments) do
    case OptionParser.parse(arguments, strict: @switches) do
      {options, languages, []} -> {options, languages}
      {_options, _languages, invalid} -> Mix.raise("invalid options: #{inspect(invalid)}")
    end
  end

  defp languages(options, []) do
    if options[:all] do
      Lumis.available_languages() |> Map.keys() |> Enum.sort()
    else
      Mix.raise("name the languages to cache, or pass --all")
    end
  end

  defp languages(options, languages) do
    if options[:all] do
      Mix.raise("pass language names or --all, not both")
    else
      languages
    end
  end

  defp cache_options(options) do
    [force: options[:force] || false]
  end
end
