defmodule Mix.Tasks.Lumis.Parsers.Cache do
  @moduledoc """
  Caches exact, integrity-checked Lumis parser WASMs for an OTP release.
  """

  use Mix.Task

  @shortdoc "Caches exact Lumis parser WASMs for an OTP release"

  @switches [all: :boolean, force: :boolean, output: :string]
  @aliases [o: :output]

  @impl Mix.Task
  def run(arguments) do
    {options, languages} = parse_arguments(arguments)
    selected = select_languages(options, languages)
    validate_selection!(selected)
    cache(selected, options)
  end

  defp parse_arguments(arguments) do
    case OptionParser.parse(arguments, strict: @switches, aliases: @aliases) do
      {options, languages, []} -> {options, languages}
      {_options, _languages, invalid} -> Mix.raise("invalid options: #{inspect(invalid)}")
    end
  end

  defp select_languages(options, languages) do
    cond do
      options[:all] && languages != [] ->
        Mix.raise("pass language names or --all, not both")

      options[:all] ->
        Enum.map(Lumis.Native.language_manifests(), & &1.id)

      languages != [] ->
        languages

      true ->
        Application.get_env(:lumis, :bundled_languages, [])
    end
  end

  defp validate_selection!([]) do
    Mix.raise("pass language names, --all, or configure :lumis, :bundled_languages")
  end

  defp validate_selection!(_languages), do: :ok

  defp cache(languages, options) do
    cache_options =
      [force: options[:force] || false]
      |> maybe_put(:directory, options[:output])

    case Lumis.LanguageLoader.cache(languages, cache_options) do
      {:ok, paths} ->
        Enum.each(paths, fn path -> Mix.shell().info(path) end)

      {:error, reason} ->
        Mix.raise(reason)
    end
  end

  defp maybe_put(options, _key, nil), do: options
  defp maybe_put(options, key, value), do: Keyword.put(options, key, value)
end
