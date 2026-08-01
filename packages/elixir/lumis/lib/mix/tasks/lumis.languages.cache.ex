defmodule Mix.Tasks.Lumis.Languages.Cache do
  @moduledoc """
  Downloads exact, integrity-checked Lumis parser WASMs ahead of time.

  Highlighting downloads what it needs on demand, so this is for deployments
  that would rather pay at build time, or that run without network access.

      mix lumis.languages.cache elixir html javascript css
      mix lumis.languages.cache --all
      mix lumis.languages.cache --force elixir
      mix lumis.languages.cache --output /app/lumis elixir

  Parsers land under `$LUMIS_DATA_DIR` unless `--output` names a directory, and
  are verified against the size and SHA-256 in their language package before
  being written. An existing valid file is left alone unless `--force` is given.

  A directory written here is complete: point `LUMIS_DATA_DIR` at it, or
  `LUMIS_WASM_PATH` at its parent, and nothing needs the network.
  """

  use Mix.Task

  @shortdoc "Downloads Lumis parser WASMs ahead of time"

  @switches [all: :boolean, force: :boolean, output: :string]
  @aliases [o: :output]

  @impl Mix.Task
  def run(arguments) do
    Mix.Task.run("app.start")
    {options, languages} = parse_arguments(arguments)

    case Lumis.Languages.cache(languages(options, languages), cache_options(options)) do
      {:ok, paths} -> Enum.each(paths, fn path -> Mix.shell().info(path) end)
      {:error, reason} -> Mix.raise(reason)
    end
  end

  defp parse_arguments(arguments) do
    case OptionParser.parse(arguments, strict: @switches, aliases: @aliases) do
      {options, languages, []} -> {options, languages}
      {_options, _languages, invalid} -> Mix.raise("invalid options: #{inspect(invalid)}")
    end
  end

  defp languages(options, []) do
    if options[:all] do
      Lumis.Languages.all_names()
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
    |> maybe_put(:directory, options[:output])
  end

  defp maybe_put(options, _key, nil), do: options
  defp maybe_put(options, key, value), do: Keyword.put(options, key, value)
end
